// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays, format, formatISO, startOfMonth } from 'date-fns';

import type { DashboardStats, Invoice, Profile } from '@/types';
import type { SupabaseServerClient } from '@/lib/supabase/server';
import { alreadySentToday, nextReminderType, type ReminderSchedule } from '@/lib/reminders/utils';

interface UpcomingReminder {
  id: string;
  invoiceNumber: string;
  clientName: string;
  reminderType: 'day_7' | 'day_14' | 'day_21';
  scheduledFor: string;
}

interface DashboardData {
  profile: Profile | null;
  stats: DashboardStats;
  invoices: Invoice[];
  upcomingReminders: UpcomingReminder[];
  xeroConnected: boolean;
}

function parseCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function getDashboardData(supabase: SupabaseServerClient): Promise<DashboardData> {
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();

  const profile = profileRow as Profile | null;
  const userId = profile?.id;

  if (!userId) {
    return {
      profile: null,
      stats: {
        total_overdue_invoices: 0,
        total_overdue_amount: 0,
        reminders_sent_this_month: 0,
        average_days_to_payment: 0,
        money_recovered_this_month: 0,
      },
      invoices: [],
      upcomingReminders: [],
      xeroConnected: false,
    };
  }

  const today = formatISO(new Date(), { representation: 'date' });
  const monthStart = formatISO(startOfMonth(new Date()), { representation: 'date' });

  console.log('[Dashboard] Today:', today);
  console.log('[Dashboard] User ID:', userId);

  const { data: overdueRows, count: overdueCount } = await supabase
    .from('invoices')
    .select('amount_due')
    .eq('user_id', userId)
    .neq('status', 'PAID')
    .lt('due_date', today);

  console.log('[Dashboard] Overdue count:', overdueCount);

  const totalOverdueAmount = (overdueRows ?? []).reduce(
    (sum, row) => sum + parseCurrency(row.amount_due),
    0
  );

  // First, get ALL invoices to see what we have
  const { data: allInvoicesRows } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId);

  console.log('[Dashboard] Total invoices:', allInvoicesRows?.length);
  console.log('[Dashboard] All invoices:', allInvoicesRows?.map(inv => ({
    number: inv.invoice_number,
    due_date: inv.due_date,
    status: inv.status,
    is_overdue: inv.due_date < today
  })));

  const { data: invoicesRows } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'PAID')
    .lt('due_date', today)
    .order('due_date', { ascending: true })
    .limit(10);

  console.log('[Dashboard] Filtered overdue invoices:', invoicesRows?.length);

  const invoices: Invoice[] = (invoicesRows ?? []).map((invoice) => {
    const daysOverdue = Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0);

    return {
      ...invoice,
      amount_due: parseCurrency(invoice.amount_due),
      total_amount: parseCurrency(invoice.total_amount),
      days_overdue: daysOverdue,
    };
  });

  const { count: remindersCount } = await supabase
    .from('reminder_logs')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('sent_at', monthStart);

  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('due_date, updated_at, total_amount')
    .eq('user_id', userId)
    .eq('status', 'PAID')
    .gte('updated_at', monthStart);

  const paymentDurations = (paidInvoices ?? [])
    .map((invoice) => {
      const due = new Date(invoice.due_date);
      const paid = new Date(invoice.updated_at);
      return Math.max(differenceInCalendarDays(paid, due), 0);
    })
    .filter((value) => Number.isFinite(value));

  const averageDaysToPayment = paymentDurations.length
    ? paymentDurations.reduce((sum, value) => sum + value, 0) / paymentDurations.length
    : 0;

  const moneyRecovered = (paidInvoices ?? []).reduce(
    (sum, invoice) => sum + parseCurrency(invoice.total_amount),
    0
  );

  const { data: settings } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const schedule: ReminderSchedule = {
    day_7_enabled: settings?.day_7_enabled ?? true,
    day_14_enabled: settings?.day_14_enabled ?? true,
    day_21_enabled: settings?.day_21_enabled ?? true,
  };

  const { data: potentialReminders } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('reminders_paused', false)
    .neq('status', 'PAID')
    .lt('due_date', today);

  const upcomingReminders: UpcomingReminder[] = [];

  for (const invoice of potentialReminders ?? []) {
    const daysOverdue = Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0);
    const currentType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule);
    const tomorrowType = nextReminderType(daysOverdue + 1, invoice.reminder_count ?? 0, schedule);

    if (!tomorrowType || currentType) continue;
    if (alreadySentToday(invoice.last_reminder_sent_at ?? null)) continue;

    upcomingReminders.push({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.contact_name,
      reminderType: tomorrowType,
      scheduledFor: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'd MMM, h:mm a'),
    });
  }

  return {
    profile,
    stats: {
      total_overdue_invoices: overdueCount ?? 0,
      total_overdue_amount: totalOverdueAmount,
      reminders_sent_this_month: remindersCount ?? 0,
      average_days_to_payment: Number.isFinite(averageDaysToPayment) ? averageDaysToPayment : 0,
      money_recovered_this_month: moneyRecovered,
    },
    invoices,
    upcomingReminders,
    xeroConnected: Boolean(profile?.xero_tenant_id),
  };
}

