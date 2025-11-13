'use client';

import { useState } from 'react';
import { Mail, ExternalLink, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceActionButtonsProps {
  invoiceId: string;
  invoiceNumber: string;
  xeroInvoiceId: string;
  isPaid: boolean;
  isPaused: boolean;
  contactEmail?: string | null;
  fallbackEmail?: string | null;
  onSendReminder?: () => Promise<void>;
}

export function InvoiceActionButtons({
  invoiceId,
  invoiceNumber,
  xeroInvoiceId,
  isPaid,
  isPaused,
  contactEmail,
  fallbackEmail,
  onSendReminder,
}: InvoiceActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [localPaused, setLocalPaused] = useState(isPaused);

  const handleSend = async () => {
    if (loading || !onSendReminder) return;
    setLoading(true);
    try {
      await onSendReminder();
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
        body: JSON.stringify({ invoiceId }),
      });

      if (response.ok) {
        const newPaused = !localPaused;
        setLocalPaused(newPaused);
        toast.success(
          newPaused 
            ? `Reminders paused for invoice ${invoiceNumber}` 
            : `Reminders resumed for invoice ${invoiceNumber}`
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

  const xeroUrl = `https://go.xero.com/AccountsReceivable/Edit.aspx?invoiceID=${xeroInvoiceId}`;

  return (
    <div className="flex items-center justify-end gap-1">
      {!isPaid && onSendReminder && (
        <div className="group relative inline-flex">
          <button
            onClick={handleSend}
            disabled={loading || (!contactEmail && !fallbackEmail)}
            title={loading ? 'Sending...' : 'Send reminder'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
          </button>
          <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-max -translate-x-1/2 translate-y-1 transform rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            Send reminder
          </span>
        </div>
      )}
      
      <div className="group relative inline-flex">
        <a
          href={xeroUrl}
          target="_blank"
          rel="noreferrer"
          title="View in Xero"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-max -translate-x-1/2 translate-y-1 transform rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          View in Xero
        </span>
      </div>
      
      {!isPaid && (
        <div className="group relative inline-flex">
          <button
            onClick={handleTogglePause}
            disabled={pauseLoading}
            title={localPaused ? 'Resume reminders' : 'Pause reminders'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {localPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-max -translate-x-1/2 translate-y-1 transform rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            {localPaused ? 'Resume reminders' : 'Pause reminders'}
          </span>
        </div>
      )}
    </div>
  );
}

