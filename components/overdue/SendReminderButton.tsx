'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

interface SendReminderButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  contactEmail: string | null;
}

export function SendReminderButton({ invoiceId, invoiceNumber, contactEmail }: SendReminderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSend = async () => {
    console.log('[SendReminderButton] Button clicked', { invoiceId, invoiceNumber, contactEmail });
    
    if (!contactEmail) {
      console.log('[SendReminderButton] No contact email');
      setMessage({ type: 'error', text: 'No email address on file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log('[SendReminderButton] Sending request to /api/reminders/send');
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      console.log('[SendReminderButton] Response status:', res.status);

      if (res.ok) {
        console.log('[SendReminderButton] Success!');
        setMessage({ type: 'success', text: `Reminder sent to ${contactEmail}` });
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
    <div className="flex flex-col gap-1">
      <button
        onClick={handleSend}
        disabled={loading || !contactEmail}
        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Mail className="h-3 w-3" />
        {loading ? 'Sending...' : 'Send Reminder'}
      </button>
      {message && (
        <span className={`text-xs ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}

