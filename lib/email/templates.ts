interface TemplateContext {
  invoice_number: string;
  contact_name: string;
  amount: number;
  currency: string;
  due_date: string;
  company_name: string;
  days_until_due?: number; // For pre-reminders
}

export type ReminderType = 'day_7' | 'day_14' | 'day_21' | 'pre_reminder';

const SUBJECTS: Record<ReminderType, string> = {
  day_7: 'Friendly reminder - Invoice {invoice_number}',
  day_14: 'Payment overdue - Invoice {invoice_number}',
  day_21: 'Final notice - Invoice {invoice_number}',
  pre_reminder: 'Upcoming payment - Invoice {invoice_number}',
};

const BODY_COPY: Record<ReminderType, string> = {
  day_7: `Hi {contact_name},

I hope you're well. I wanted to send a quick reminder that invoice {invoice_number} for ${'{amount}'} was due on {due_date}.

If you've already sent payment, please disregard this message. Otherwise, I'd appreciate payment at your earliest convenience.

Invoice details:
- Invoice #: {invoice_number}
- Amount: ${'{amount}'} {currency}
- Due date: {due_date}

Thanks,
{company_name}

---
This reminder was sent automatically by Paydly`,
  day_14: `Hi {contact_name},

This is a follow-up regarding invoice {invoice_number} for ${'{amount}'}, which is now 14 days overdue.

If there's an issue with the invoice or you need to discuss payment terms, please let me know as soon as possible.

Invoice details:
- Invoice #: {invoice_number}
- Amount: ${'{amount}'} {currency}
- Due date: {due_date} (14 days ago)

I'd appreciate your prompt attention to this matter.

Best regards,
{company_name}

---
This reminder was sent automatically by Paydly`,
  day_21: `Hi {contact_name},

This is a final reminder regarding invoice {invoice_number} for ${'{amount}'}, which is now 21 days overdue.

Please arrange payment immediately to avoid any disruption to our business relationship.

If payment has been sent, please provide confirmation. If there's a dispute or issue, please contact me directly.

Invoice details:
- Invoice #: {invoice_number}
- Amount: ${'{amount}'} {currency}
- Due date: {due_date} (21 days ago)

Regards,
{company_name}

---
This reminder was sent automatically by Paydly`,
  pre_reminder: `Hi {contact_name},

Just a friendly heads up that invoice {invoice_number} for ${'{amount}'} is due in {days_until_due} days.

This is a courtesy reminder to help you plan ahead. No action is required right now, but payment will be due on {due_date}.

Invoice details:
- Invoice #: {invoice_number}
- Amount: ${'{amount}'} {currency}
- Due date: {due_date} ({days_until_due} days from now)

Thanks for your business!

{company_name}

---
This reminder was sent automatically by Paydly`,
};

function formatAmount(amount: number) {
  return amount.toFixed(2);
}

function interpolate(template: string, context: TemplateContext) {
  let result = template
    .replaceAll('{invoice_number}', context.invoice_number)
    .replaceAll('{contact_name}', context.contact_name)
    .replaceAll('{amount}', formatAmount(context.amount))
    .replaceAll('{currency}', context.currency)
    .replaceAll('{due_date}', context.due_date)
    .replaceAll('{company_name}', context.company_name);
  
  // Handle days_until_due for pre-reminders
  if (context.days_until_due !== undefined) {
    result = result.replaceAll('{days_until_due}', context.days_until_due.toString());
  }
  
  return result;
}

export async function getReminderTemplate(
  type: ReminderType,
  context: TemplateContext,
  supabase?: any,
  userId?: string
) {
  let subjectTemplate = SUBJECTS[type];
  let bodyTemplate = BODY_COPY[type];

  // Check for custom template if supabase client and userId are provided
  if (supabase && userId) {
    try {
      const { data: customTemplate } = await supabase
        .from('email_templates')
        .select('subject, body')
        .eq('user_id', userId)
        .eq('template_type', type)
        .maybeSingle();

      if (customTemplate) {
        subjectTemplate = customTemplate.subject;
        bodyTemplate = customTemplate.body;
      }
    } catch (error) {
      console.error('[getReminderTemplate] Error fetching custom template:', error);
      // Fall back to default templates on error
    }
  }

  const text = interpolate(bodyTemplate, context);

  const html = text
    .split('\n')
    .map((line) => (line.trim().length ? `<p>${line}</p>` : '<br />'))
    .join('');

  const subject = interpolate(subjectTemplate, context);

  return {
    subject,
    text,
    html,
  };
}

