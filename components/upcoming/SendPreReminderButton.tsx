'use client';

import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';
import type { UpcomingInvoice } from '@/lib/data/upcoming';

interface SendPreReminderButtonProps {
  invoice: UpcomingInvoice;
}

export function SendPreReminderButton({ invoice }: SendPreReminderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (loading || status === 'success') return;

    setLoading(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/reminders/send-pre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send pre-reminder');
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('[SendPreReminderButton] Error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
      >
        <Check className="h-3.5 w-3.5" />
        Sent
      </button>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleSend}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
        title={errorMessage || 'Click to retry'}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Retry
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send className="h-3.5 w-3.5" />
      {loading ? 'Sending...' : 'Send'}
    </button>
  );
}

