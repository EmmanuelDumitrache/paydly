interface TemplateContext {
  invoice_number: string;
  contact_name: string;
  amount: number;
  currency: string;
  due_date: string;
  company_name: string;
}

export type ReminderType = 'day_7' | 'day_14' | 'day_21';

const SUBJECTS: Record<ReminderType, string> = {
  day_7: 'Friendly reminder - Invoice {invoice_number}',
  day_14: 'Payment overdue - Invoice {invoice_number}',
  day_21: 'Final notice - Invoice {invoice_number}',
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
};

function formatAmount(amount: number) {
  return amount.toFixed(2);
}

function interpolate(template: string, context: TemplateContext) {
  return template
    .replaceAll('{invoice_number}', context.invoice_number)
    .replaceAll('{contact_name}', context.contact_name)
    .replaceAll('{amount}', formatAmount(context.amount))
    .replaceAll('{currency}', context.currency)
    .replaceAll('{due_date}', context.due_date)
    .replaceAll('{company_name}', context.company_name);
}

export function getReminderTemplate(type: ReminderType, context: TemplateContext) {
  const subjectTemplate = SUBJECTS[type];
  const bodyTemplate = BODY_COPY[type];
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

