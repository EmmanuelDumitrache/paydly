// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { getReminderTemplate } from '@/lib/email/templates';
import { sendReminderEmail } from '@/lib/email/send';
import { nextReminderType } from '@/lib/reminders/utils';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const invoiceId = body?.invoice_id as string | undefined;

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.reminders_paused) {
    return NextResponse.json({ error: 'Reminders are paused for this invoice' }, { status: 400 });
  }

  const daysOverdue =
    invoice.status !== 'PAID'
      ? Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0)
      : 0;
  if (daysOverdue < 7) {
    return NextResponse.json({ error: 'Invoice is not overdue enough to send a reminder' }, { status: 400 });
  }

  const { data: settings } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name,email')
    .eq('id', user.id)
    .maybeSingle();

  const schedule = {
    day_7_enabled: settings?.day_7_enabled ?? true,
    day_14_enabled: settings?.day_14_enabled ?? true,
    day_21_enabled: settings?.day_21_enabled ?? true,
  };

  const reminderType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule);
  if (!reminderType) {
    return NextResponse.json({ error: 'No reminder scheduled for this invoice at the moment' }, { status: 400 });
  }

  const companyName = profile?.company_name || profile?.email || user.email;
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
      to: invoice.contact_email || user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

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

    return NextResponse.json({ success: true });
  } catch (error) {
    await supabase.from('reminder_logs').insert({
      invoice_id: invoice.id,
      user_id: user.id,
      reminder_type: reminderType,
      email_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to send reminder email' }, { status: 500 });
  }
}

