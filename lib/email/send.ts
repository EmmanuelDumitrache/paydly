import { Resend } from 'resend';

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendReminderEmail(payload: SendEmailPayload) {
  if (!resendClient) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Paydly Reminders <reminders@paydly.com>';

  const response = await resendClient.emails.send({
    from: fromEmail,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return response;
}

