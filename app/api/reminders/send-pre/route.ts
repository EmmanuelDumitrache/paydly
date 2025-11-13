// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReminderEmail } from '@/lib/email/send';
import { getReminderTemplate } from '@/lib/email/templates';
import { differenceInCalendarDays } from 'date-fns';
import { checkActiveSubscription } from '@/lib/auth/subscription';

export async function POST(request: Request) {
  console.log('[API /api/reminders/send-pre] Request received');

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has active subscription
  const profile = await checkActiveSubscription(supabase, user.id);
  if (!profile) {
    console.log('[API /api/reminders/send-pre] Forbidden - no active subscription');
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
  }

  console.log('[API /api/reminders/send-pre] User:', user.id);

  const body = await request.json();
  const { invoiceId } = body;

  if (!invoiceId) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  console.log('[API /api/reminders/send-pre] Invoice ID:', invoiceId);

  // Fetch invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (invoiceError || !invoice) {
    console.error('[API /api/reminders/send-pre] Invoice not found:', invoiceError);
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  console.log('[API /api/reminders/send-pre] Invoice found:', invoice.invoice_number);

  // Validate invoice is not overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(invoice.due_date);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate <= today) {
    console.error('[API /api/reminders/send-pre] Invoice is already due or overdue');
    return NextResponse.json(
      { error: 'Cannot send pre-reminder for overdue invoice' },
      { status: 400 }
    );
  }

  const daysUntilDue = differenceInCalendarDays(dueDate, today);
  console.log('[API /api/reminders/send-pre] Days until due:', daysUntilDue);

  // Validate contact email
  if (!invoice.contact_email) {
    console.error('[API /api/reminders/send-pre] No contact email');
    return NextResponse.json({ error: 'No contact email for this invoice' }, { status: 400 });
  }

  // Fetch user profile for company name
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name')
    .eq('id', user.id)
    .single();

  const companyName = profile?.company_name || 'Your Company';

  // Generate email template
  const template = await getReminderTemplate(
    'pre_reminder',
    {
      invoice_number: invoice.invoice_number,
      contact_name: invoice.contact_name,
      amount: typeof invoice.amount_due === 'string' 
        ? parseFloat(invoice.amount_due) 
        : invoice.amount_due,
      currency: invoice.currency_code || 'AUD',
      due_date: new Date(invoice.due_date).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      company_name: companyName,
      days_until_due: daysUntilDue,
    },
    supabase,
    user.id
  );

  console.log('[API /api/reminders/send-pre] Sending email to:', invoice.contact_email);
  console.log('[API /api/reminders/send-pre] Template:', { subject: template.subject });

  // Send email
  try {
    const emailResult = await sendReminderEmail({
      to: invoice.contact_email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('[API /api/reminders/send-pre] Email sent successfully', emailResult);
  } catch (emailError) {
    console.error('[API /api/reminders/send-pre] Email send failed:', emailError);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }

  // Log to database
  const { error: logError } = await supabase.from('reminder_logs').insert({
    user_id: user.id,
    invoice_id: invoice.id,
    reminder_type: 'pre_reminder',
    sent_at: new Date().toISOString(),
  });

  if (logError) {
    console.error('[API /api/reminders/send-pre] Failed to log reminder:', logError);
  }

  console.log('[API /api/reminders/send-pre] Success - returning 200');

  return NextResponse.json({
    success: true,
    message: 'Pre-reminder sent successfully',
  });
}

