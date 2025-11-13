'use client';

import { useRef, useState } from 'react';
import { RotateCcw, Save, Send, Bold, Italic, Underline } from 'lucide-react';
import { toast } from 'sonner';
import type { ReminderType } from '@/lib/email/templates';

const DEFAULT_TEMPLATES: Record<ReminderType, { subject: string; body: string }> = {
  day_7: {
    subject: 'Friendly reminder - Invoice {invoice_number}',
    body: `Hi {contact_name},

I hope you're well. I wanted to send a quick reminder that invoice {invoice_number} for \${amount} was due on {due_date}.

If you've already sent payment, please disregard this message. Otherwise, I'd appreciate payment at your earliest convenience.

Invoice details:
- Invoice #: {invoice_number}
- Amount: \${amount} {currency}
- Due date: {due_date}

Thanks,
{company_name}

---
This reminder was sent automatically by Paydly`,
  },
  day_14: {
    subject: 'Payment overdue - Invoice {invoice_number}',
    body: `Hi {contact_name},

This is a follow-up regarding invoice {invoice_number} for \${amount}, which is now 14 days overdue.

If there's an issue with the invoice or you need to discuss payment terms, please let me know as soon as possible.

Invoice details:
- Invoice #: {invoice_number}
- Amount: \${amount} {currency}
- Due date: {due_date} (14 days ago)

I'd appreciate your prompt attention to this matter.

Best regards,
{company_name}

---
This reminder was sent automatically by Paydly`,
  },
  day_21: {
    subject: 'Final notice - Invoice {invoice_number}',
    body: `Hi {contact_name},

This is a final reminder regarding invoice {invoice_number} for \${amount}, which is now 21 days overdue.

Please arrange payment immediately to avoid any disruption to our business relationship.

If payment has been sent, please provide confirmation. If there's a dispute or issue, please contact me directly.

Invoice details:
- Invoice #: {invoice_number}
- Amount: \${amount} {currency}
- Due date: {due_date} (21 days ago)

Regards,
{company_name}

---
This reminder was sent automatically by Paydly`,
  },
  pre_reminder: {
    subject: 'Upcoming payment - Invoice {invoice_number}',
    body: `Hi {contact_name},

Just a friendly heads up that invoice {invoice_number} for \${amount} is due in {days_until_due} days.

This is a courtesy reminder to help you plan ahead. No action is required right now, but payment will be due on {due_date}.

Invoice details:
- Invoice #: {invoice_number}
- Amount: \${amount} {currency}
- Due date: {due_date} ({days_until_due} days from now)

Thanks for your business!

{company_name}

---
This reminder was sent automatically by Paydly`,
  },
};

const TEMPLATE_LABELS: Record<ReminderType, string> = {
  day_7: '7 Days Overdue',
  day_14: '14 Days Overdue',
  day_21: '21 Days Overdue (Final Notice)',
  pre_reminder: 'Pre-Reminder (Before Due Date)',
};

interface TemplateEditorProps {
  type: ReminderType;
  initialSubject?: string;
  initialBody?: string;
  onSave: (type: ReminderType, subject: string, body: string) => Promise<void>;
  onReset: (type: ReminderType) => Promise<void>;
  onSendTest: (type: ReminderType, subject: string, body: string, email: string) => Promise<void>;
}

export function TemplateEditor({
  type,
  initialSubject,
  initialBody,
  onSave,
  onReset,
  onSendTest,
}: TemplateEditorProps) {
  const defaultTemplate = DEFAULT_TEMPLATES[type];
  const [subject, setSubject] = useState(initialSubject || defaultTemplate.subject);
  const [body, setBody] = useState(initialBody || defaultTemplate.body);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const hasChanges =
    subject !== (initialSubject || defaultTemplate.subject) ||
    body !== (initialBody || defaultTemplate.body);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await onSave(type, subject, body);
      toast.success(`${TEMPLATE_LABELS[type]} template saved`);
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await onReset(type);
      setSubject(defaultTemplate.subject);
      setBody(defaultTemplate.body);
      toast.success(`${TEMPLATE_LABELS[type]} template reset to default`);
    } catch (error) {
      toast.error('Failed to reset template');
    } finally {
      setResetting(false);
    }
  };

  const applyFormatting = (wrapBefore: string, wrapAfter: string = wrapBefore) => {
    if (!bodyRef.current) return;
    const textarea = bodyRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === null || end === null || start === end) {
      toast.info('Select text to format');
      return;
    }

    const before = body.slice(0, start);
    const selected = body.slice(start, end);
    const after = body.slice(end);

    const formatted = `${before}${wrapBefore}${selected}${wrapAfter}${after}`;
    setBody(formatted);

    // Restore selection (roughly)
    const newCursorStart = start + wrapBefore.length;
    const newCursorEnd = newCursorStart + selected.length;
    requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
        bodyRef.current.setSelectionRange(newCursorStart, newCursorEnd);
      }
    });
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Enter an email to send the test');
      return;
    }
    setSendingTest(true);
    try {
      await onSendTest(type, subject, body, testEmail.trim());
      toast.success('Test email sent');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{TEMPLATE_LABELS[type]}</h3>
          <p className="text-sm text-slate-500">Customize the email sent for this reminder type</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Enter email subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Body</label>
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyFormatting('**')}
              className="rounded border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('*')}
              className="rounded border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('__')}
              className="rounded border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </button>
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Enter email body"
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Available Variables
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <code className="rounded bg-white px-2 py-1">{'{invoice_number}'}</code>
            <code className="rounded bg-white px-2 py-1">{'{contact_name}'}</code>
            <code className="rounded bg-white px-2 py-1">{'{amount}'}</code>
            <code className="rounded bg-white px-2 py-1">{'{currency}'}</code>
            <code className="rounded bg-white px-2 py-1">{'{due_date}'}</code>
            <code className="rounded bg-white px-2 py-1">{'{company_name}'}</code>
            {type === 'pre_reminder' && (
              <code className="rounded bg-white px-2 py-1">{'{days_until_due}'}</code>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Template'}
        </button>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Send test email
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={sendingTest || !testEmail.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>
    </div>
  );
}

