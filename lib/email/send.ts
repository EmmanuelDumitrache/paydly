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

  const rawFrom =
    process.env.RESEND_FROM_EMAIL ?? 'Paydly Reminders <onboarding@resend.dev>';

  // Extract bare email from `Name <email>` format
  const emailMatch = rawFrom.match(/<(.+)>/);
  const fromEmail = emailMatch ? emailMatch[1] : rawFrom;
  const fromDomain = fromEmail.split('@')[1]?.toLowerCase();

  const proxyNeeded =
    fromDomain === 'onboarding@resend.dev'.split('@')[1] ||
    (fromDomain && !fromDomain.includes('resend.dev') && fromDomain !== 'emmanueldumitrache@gmail.com');

  const allowList = new Set<string>(
    process.env.RESEND_TEST_ALLOWLIST?.split(',').map((email) => email.trim().toLowerCase()) ?? [
      'emmanueldumitrache@gmail.com',
    ]
  );

  const recipient = payload.to.toLowerCase();

  if (process.env.NODE_ENV !== 'production' || proxyNeeded) {
    if (!allowList.has(recipient)) {
      console.warn('[email/send] Blocking email to', recipient);
      return { data: null, blocked: true };
    }
  }

  const response = await resendClient.emails.send({
    from: rawFrom,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return response;
}

