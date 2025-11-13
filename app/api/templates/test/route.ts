'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendReminderEmail } from '@/lib/email/send';
import type { ReminderType } from '@/lib/email/templates';
import { getReminderTemplate } from '@/lib/email/templates';

interface RequestBody {
  template_type: ReminderType;
  subject: string;
  body: string;
  email: string;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: RequestBody = await request.json();
    const { template_type, subject, body: templateBody, email } = body;

    if (!template_type || !subject || !templateBody || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const serviceSupabase = createServiceClient();

    const template = await getReminderTemplate(
      template_type,
      {
        invoice_number: 'INV-0000',
        contact_name: 'Test Customer',
        amount: 0,
        currency: 'USD',
        due_date: new Date().toLocaleDateString(),
        company_name: 'Paydly',
        days_until_due: 3,
      },
      serviceSupabase,
      user.id
    );

    const interpolatedSubject = subject;
    const interpolatedBody = templateBody.replaceAll('\n', '<br/>');

    await sendReminderEmail({
      to: email,
      subject: interpolatedSubject,
      html: `<div style="font-family: Arial, sans-serif; line-height:1.6">${interpolatedBody}</div>`,
      text: templateBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Templates Test] Error sending test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}


