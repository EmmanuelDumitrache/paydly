// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { getReminderTemplate } from '@/lib/email/templates';
import { sendReminderEmail } from '@/lib/email/send';
import { nextReminderType } from '@/lib/reminders/utils';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  console.log('[API /api/reminders/send] Request received');
  
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[API /api/reminders/send] User:', user?.id);

  if (!user) {
    console.log('[API /api/reminders/send] Unauthorized - no user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const invoiceId = body?.invoice_id as string | undefined;

  console.log('[API /api/reminders/send] Invoice ID:', invoiceId);

  if (!invoiceId) {
    console.log('[API /api/reminders/send] Missing invoice_id');
    return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('[API /api/reminders/send] Invoice found:', invoice?.invoice_number, 'Error:', invoiceError);

  if (invoiceError || !invoice) {
    console.log('[API /api/reminders/send] Invoice not found');
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.reminders_paused) {
    console.log('[API /api/reminders/send] Reminders paused');
    return NextResponse.json({ error: 'Reminders are paused for this invoice' }, { status: 400 });
  }

  const daysOverdue =
    invoice.status !== 'PAID'
      ? Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0)
      : 0;
  
  console.log('[API /api/reminders/send] Days overdue:', daysOverdue);
  
  if (daysOverdue < 7) {
    console.log('[API /api/reminders/send] Not overdue enough');
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
  
  console.log('[API /api/reminders/send] Reminder type:', reminderType, 'Schedule:', schedule);
  
  if (!reminderType) {
    console.log('[API /api/reminders/send] No reminder type available');
    return NextResponse.json({ error: 'No reminder scheduled for this invoice at the moment' }, { status: 400 });
  }

  const derivedEmailFromName =
    invoice.contact_name && invoice.contact_name.includes('@') ? invoice.contact_name : null;
  const targetEmail = invoice.contact_email ?? derivedEmailFromName;

  if (!targetEmail) {
    console.log('[API /api/reminders/send] Missing recipient email', {
      invoiceId: invoice.id,
      contact_name: invoice.contact_name,
      contact_email: invoice.contact_email,
    });
    return NextResponse.json(
      { error: 'This invoice does not have a client email address. Add one in Xero and re-sync.' },
      { status: 400 }
    );
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
    console.log('[API /api/reminders/send] Sending email to:', targetEmail);
    console.log('[API /api/reminders/send] Template:', { subject: template.subject });
    
    const sendResponse = await sendReminderEmail({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('[API /api/reminders/send] Email sent successfully', sendResponse);

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

    console.log('[API /api/reminders/send] Success - returning 200');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/reminders/send] Error sending email:', error);
    
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

