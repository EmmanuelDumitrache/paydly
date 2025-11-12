'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

interface SendReminderButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  contactEmail: string | null;
  fallbackEmail?: string | null;
}

export function SendReminderButton({
  invoiceId,
  invoiceNumber,
  contactEmail,
  fallbackEmail,
}: SendReminderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const targetEmail = contactEmail ?? fallbackEmail ?? null;

  const handleSend = async () => {
    console.log('[SendReminderButton] Button clicked', { invoiceId, invoiceNumber, contactEmail, fallbackEmail });

    setLoading(true);
    setMessage(null);

    try {
      console.log('[SendReminderButton] Sending request to /api/reminders/send');
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId, force: true }),
      });

      console.log('[SendReminderButton] Response status:', res.status);

      if (res.ok) {
        console.log('[SendReminderButton] Success!');
        const target = targetEmail ?? 'account email';
        setMessage({
          type: 'success',
          text: `Reminder sent to ${target}`,
        });
      } else {
        const data = await res.json();
        console.log('[SendReminderButton] Error response:', data);
        setMessage({ type: 'error', text: data.error || 'Failed to send' });
      }
    } catch (error) {
      console.error('[SendReminderButton] Network error:', error);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleSend}
        disabled={loading || !targetEmail}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Mail className="h-3.5 w-3.5" />
        {loading ? 'Sending...' : 'Send'}
      </button>
      {message && (
        <span className={`text-xs ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}

