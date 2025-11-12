// @ts-nocheck - Supabase generic types cause issues with type inference
'use server';

import { redirect } from 'next/navigation';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendSupportEmail(formData: FormData) {
  const name = formData.get('name')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const subject = formData.get('subject')?.toString() || '';
  const message = formData.get('message')?.toString() || '';

  if (!name || !email || !subject || !message) {
    redirect('/support?error=missing_fields');
    return;
  }

  if (!resend) {
    console.error('[Support] Resend not configured');
    redirect('/support?error=email_not_configured');
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Paydly Support <onboarding@resend.dev>',
      to: 'support@paydly.io',
      replyTo: email,
      subject: `[Support] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
      text: `
New Support Request

From: ${name} (${email})
Subject: ${subject}

${message}
      `,
    });

    redirect('/support?success=true');
  } catch (error) {
    console.error('[Support] Error sending email:', error);
    redirect('/support?error=send_failed');
  }
}

