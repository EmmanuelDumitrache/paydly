import { NextResponse } from 'next/server';

import { getReminderTemplate } from '@/lib/email/templates';
import { sendReminderEmail } from '@/lib/email/send';
import { createServiceClient } from '@/lib/supabase/service';
import { alreadySentToday, nextReminderType } from '@/lib/reminders/utils';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id,email,company_name,subscription_status,xero_tenant_id')
    .in('subscription_status', ['trialing', 'active'])
    .not('xero_tenant_id', 'is', null);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  let remindersSent = 0;
  let remindersFailed = 0;

  const today = new Date().toISOString().split('T')[0];

  for (const user of users ?? []) {
    const { data: settings } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const schedule = {
      day_7_enabled: settings?.day_7_enabled ?? true,
      day_14_enabled: settings?.day_14_enabled ?? true,
      day_21_enabled: settings?.day_21_enabled ?? true,
    };

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('reminders_paused', false)
      .neq('status', 'PAID')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    for (const invoice of invoices ?? []) {
      const daysOverdue = invoice.days_overdue ?? 0;
      if (daysOverdue <= 0) continue;

      const reminderType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule);
      if (!reminderType) continue;

      if (alreadySentToday(invoice.last_reminder_sent_at ?? null)) {
        continue;
      }

      const toEmail = invoice.contact_email || user.email;
      const companyName = user.company_name || user.email;
      const template = getReminderTemplate(reminderType, {
        invoice_number: invoice.invoice_number,
        contact_name: invoice.contact_name,
        amount: typeof invoice.amount_due === 'string' ? parseFloat(invoice.amount_due) : invoice.amount_due,
        currency: invoice.currency_code || 'AUD',
        due_date: new Date(invoice.due_date).toLocaleDateString(),
        company_name: companyName,
      });

      try {
        await sendReminderEmail({
          to: toEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        remindersSent += 1;

        await supabase.from('reminder_logs').insert({
          invoice_id: invoice.id,
          user_id: user.id,
          reminder_type: reminderType,
          email_status: 'sent',
        });

        await supabase
          .from('invoices')
          .update({
            last_reminder_sent_at: new Date().toISOString(),
            reminder_count: (invoice.reminder_count ?? 0) + 1,
          })
          .eq('id', invoice.id);
      } catch (error) {
        remindersFailed += 1;
        await supabase.from('reminder_logs').insert({
          invoice_id: invoice.id,
          user_id: user.id,
          reminder_type: reminderType,
          email_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return NextResponse.json({ remindersSent, remindersFailed });
}

