'use client';

import { useState } from 'react';
import { Mail, ExternalLink, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface InvoicesPageActionsProps {
  invoice: {
    id: string;
    invoice_number: string;
    xero_invoice_id: string;
    status: string;
    reminders_paused: boolean;
    contact_email?: string | null;
  };
}

export function InvoicesPageActions({ invoice }: InvoicesPageActionsProps) {
  const [loading, setLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [localPaused, setLocalPaused] = useState(invoice.reminders_paused);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isPaid = invoice.status === 'PAID';
  const xeroUrl = `https://go.xero.com/AccountsReceivable/Edit.aspx?invoiceID=${invoice.xero_invoice_id}`;

  const handleSendReminder = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoice.id, force: true }),
      });

      if (response.ok) {
        const successMsg = `Reminder sent to ${invoice.contact_email}`;
        setMessage({ type: 'success', text: 'Reminder sent' });
        toast.success(successMsg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        const errorMsg = data.error || 'Failed to send reminder';
        setMessage({ type: 'error', text: errorMsg });
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Network error - please try again';
      setMessage({ type: 'error', text: 'Network error' });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    if (pauseLoading) return;
    setPauseLoading(true);

    try {
      const response = await fetch('/api/invoices/toggle-pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (response.ok) {
        const newPaused = !localPaused;
        setLocalPaused(newPaused);
        toast.success(
          newPaused 
            ? `Reminders paused for invoice ${invoice.invoice_number}` 
            : `Reminders resumed for invoice ${invoice.invoice_number}`
        );
      } else {
        toast.error('Failed to update reminder status');
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error);
      toast.error('Network error - please try again');
    } finally {
      setPauseLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {!isPaid && (
          <button
            onClick={handleSendReminder}
            disabled={loading || !invoice.contact_email}
            title={loading ? 'Sending...' : 'Send reminder'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
          </button>
        )}

        <a
          href={xeroUrl}
          target="_blank"
          rel="noreferrer"
          title="View in Xero"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        {!isPaid && (
          <button
            onClick={handleTogglePause}
            disabled={pauseLoading}
            title={localPaused ? 'Resume reminders' : 'Pause reminders'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {localPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        )}
      </div>
      {message && (
        <span className={`text-xs ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}

