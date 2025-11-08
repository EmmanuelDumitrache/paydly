const { createClient } = require('@supabase/supabase-js');
const { differenceInCalendarDays, formatISO, startOfMonth, format } = require('date-fns');

function parseCurrency(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function alreadySentToday(timestamp) {
  if (!timestamp) return false;
  const sent = new Date(timestamp);
  const today = new Date();
  return sent.toDateString() === today.toDateString();
}

function nextReminderType(daysOverdue, reminderCount, schedule) {
  if (daysOverdue >= 21 && reminderCount < 3 && schedule.day_21_enabled) return 'day_21';
  if (daysOverdue >= 14 && reminderCount < 2 && schedule.day_14_enabled) return 'day_14';
  if (daysOverdue >= 7 && reminderCount < 1 && schedule.day_7_enabled) return 'day_7';
  return null;
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.USER_ID;
  if (!serviceKey || !userId) throw new Error('Missing env vars');

  const supabase = createClient('https://xsvuqporgkddggmkasgh.supabase.co', serviceKey, { auth: { persistSession: false } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = formatISO(today, { representation: 'date' });
  const monthStart = formatISO(startOfMonth(new Date()), { representation: 'date' });

  const { data: allInvoicesRows, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'PAID')
    .order('due_date', { ascending: true });

  if (error) throw error;

  const overdueInvoicesData = (allInvoicesRows ?? []).map((invoice) => {
    const dueDate = new Date(invoice.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today;
    return { ...invoice, isOverdue };
  }).filter((invoice) => invoice.isOverdue);

  console.log('Total invoices fetched:', allInvoicesRows?.length);
  console.log('Overdue invoices detected:', overdueInvoicesData.length);
  overdueInvoicesData.forEach((invoice) => {
    console.log({
      invoice_number: invoice.invoice_number,
      due_date: invoice.due_date,
      difference: differenceInCalendarDays(new Date(), new Date(invoice.due_date)),
      status: invoice.status,
    });
  });

  const invoicesRows = overdueInvoicesData.slice(0, 10);
  console.log('Dashboard top invoices:', invoicesRows.map((inv) => ({
    invoice_number: inv.invoice_number,
    due_date: inv.due_date,
    days_overdue: Math.max(differenceInCalendarDays(new Date(), new Date(inv.due_date)), 0),
  })));

  const { data: settings } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const schedule = {
    day_7_enabled: settings?.day_7_enabled ?? true,
    day_14_enabled: settings?.day_14_enabled ?? true,
    day_21_enabled: settings?.day_21_enabled ?? true,
  };

  const upcomingReminders = [];
  for (const invoice of overdueInvoicesData.filter((inv) => !inv.reminders_paused)) {
    const daysOverdue = Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0);
    const currentType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule);
    const tomorrowType = nextReminderType(daysOverdue + 1, invoice.reminder_count ?? 0, schedule);

    if (alreadySentToday(invoice.last_reminder_sent_at ?? null)) continue;

    if (currentType) {
      upcomingReminders.push({
        invoice_number: invoice.invoice_number,
        reminderType: currentType,
        daysOverdue,
      });
      continue;
    }

    if (!tomorrowType) continue;

    upcomingReminders.push({
      invoice_number: invoice.invoice_number,
      reminderType: tomorrowType,
      daysOverdue: daysOverdue + 1,
    });
  }

  console.log('Upcoming reminders:', upcomingReminders);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
