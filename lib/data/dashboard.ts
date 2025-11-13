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
  xeroTenantName: string | null;
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

  console.log('[getDashboardData] Profile:', { 
    userId, 
    xero_tenant_id: profile?.xero_tenant_id,
    xero_tenant_name: profile?.xero_tenant_name,
    xero_connected: Boolean(profile?.xero_tenant_id)
  });

  if (!userId) {
    console.log('[getDashboardData] No userId found, returning empty data');
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
      xeroTenantName: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = formatISO(today, { representation: 'date' });
  const monthStart = formatISO(startOfMonth(new Date()), { representation: 'date' });

  console.log('[getDashboardData] Date filters:', { today: todayISO, monthStart });

  // Fetch all unpaid invoices and filter in code for more reliable overdue detection
  const { data: allInvoicesRows } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'PAID')
    .order('due_date', { ascending: true });

  console.log('[getDashboardData] Fetched invoices:', { 
    count: allInvoicesRows?.length, 
    invoices: allInvoicesRows 
  });

  // Filter overdue invoices in code for accurate date comparison
  const overdueInvoicesData = (allInvoicesRows ?? []).map((invoice) => {
    const dueDate = new Date(invoice.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today;

    console.log('[Dashboard] Invoice status check:', {
      invoice_number: invoice.invoice_number,
      due_date: invoice.due_date,
      parsed_due_date: dueDate.toISOString(),
      today_normalized: today.toISOString(),
      isOverdue,
      reminders_paused: invoice.reminders_paused,
      reminder_count: invoice.reminder_count,
      amount_due: invoice.amount_due,
    });

    return { ...invoice, isOverdue };
  }).filter((invoice) => invoice.isOverdue);

  console.log('[getDashboardData] Overdue invoices:', { 
    count: overdueInvoicesData.length, 
    invoices: overdueInvoicesData.map(inv => ({ 
      invoice_number: inv.invoice_number, 
      due_date: inv.due_date,
      amount_due: inv.amount_due 
    }))
  });

  const overdueCount = overdueInvoicesData.length;
  const totalOverdueAmount = overdueInvoicesData.reduce(
    (sum, row) => sum + parseCurrency(row.amount_due),
    0
  );

  // Get top 10 most overdue invoices
  const invoicesRows = overdueInvoicesData.slice(0, 10);

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
    .select('id', { count: 'exact', head: true })
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

  // Use the same overdueInvoicesData for upcoming reminders
  const upcomingReminders: UpcomingReminder[] = [];

  console.log('[getDashboardData] Building upcoming reminders from overdue invoices:', {
    overdueCount: overdueInvoicesData.length,
    unpausedCount: overdueInvoicesData.filter(inv => !inv.reminders_paused).length
  });

  for (const invoice of overdueInvoicesData.filter(inv => !inv.reminders_paused)) {
    const daysOverdue = Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0);
    const currentType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule);
    const tomorrowType = nextReminderType(daysOverdue + 1, invoice.reminder_count ?? 0, schedule);

    console.log('[getDashboardData] Reminder check for invoice:', {
      invoice_number: invoice.invoice_number,
      daysOverdue,
      reminder_count: invoice.reminder_count,
      currentType,
      tomorrowType,
      alreadySent: alreadySentToday(invoice.last_reminder_sent_at ?? null),
      last_reminder_sent_at: invoice.last_reminder_sent_at
    });

    if (alreadySentToday(invoice.last_reminder_sent_at ?? null)) continue;

    const now = new Date();
    now.setHours(9, 0, 0, 0);

    if (currentType) {
      upcomingReminders.push({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.contact_name,
        reminderType: currentType,
        scheduledFor: format(now, 'd MMM, h:mm a'),
      });
      continue;
    }

    if (!tomorrowType) continue;

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    upcomingReminders.push({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.contact_name,
      reminderType: tomorrowType,
      scheduledFor: format(tomorrow, 'd MMM, h:mm a'),
    });
  }

  console.log('[getDashboardData] Upcoming reminders:', { 
    count: upcomingReminders.length, 
    reminders: upcomingReminders 
  });

  const finalData = {
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
    xeroConnected: Boolean(profile?.xero_tenant_id && profile?.xero_access_token),
    xeroTenantName: profile?.xero_tenant_name || null,
  };

  console.log('[getDashboardData] Final return:', { 
    overdueCount, 
    totalOverdueAmount, 
    invoicesCount: invoices.length, 
    upcomingCount: upcomingReminders.length,
    xeroConnected: Boolean(profile?.xero_tenant_id)
  });

  return finalData;
}

