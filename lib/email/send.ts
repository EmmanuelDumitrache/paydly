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

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Paydly Reminders <onboarding@resend.dev>';

  console.log('[Resend] Sending email', {
    from: fromEmail,
    to: payload.to,
    subject: payload.subject,
  });

  try {
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    console.log('[Resend] Email sent successfully', { id: response.data?.id });
    return response;
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    throw error;
  }
}

