'use client';

import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SyncDetails {
  synced: number;
  newInvoices: number;
  updatedInvoices: number;
}

interface SyncOverlayProps {
  isOpen: boolean;
  status: 'syncing' | 'success' | 'error' | null;
  message?: string;
  details?: SyncDetails | null;
  onClose?: () => void;
}

export function SyncOverlay({ isOpen, status, message, details, onClose }: SyncOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'syncing') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (status === 'success' || status === 'error') {
      setProgress(100);
      if (onClose) {
        const timeout = setTimeout(onClose, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [status, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center">
          {status === 'syncing' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
          {status === 'success' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <XCircle className="h-8 w-8 text-rose-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-center text-lg font-semibold text-slate-900">
          {status === 'syncing' && 'Syncing invoices...'}
          {status === 'success' && 'Sync complete!'}
          {status === 'error' && 'Sync failed'}
        </h3>

        {/* Message */}
        {message && (
          <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
        )}

        {/* Progress Bar */}
        {status === 'syncing' && (
          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Fetching invoices from Xero...
            </p>
          </div>
        )}

        {/* Success/Error Details */}
        {status === 'success' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-center text-sm font-medium text-emerald-700">
                Your invoices are up to date
              </p>
            </div>
            {details && (details.newInvoices > 0 || details.updatedInvoices > 0) && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="space-y-2 text-sm">
                  {details.newInvoices > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">New invoices detected:</span>
                      <span className="font-semibold text-indigo-600">{details.newInvoices}</span>
                    </div>
                  )}
                  {details.updatedInvoices > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Invoices updated:</span>
                      <span className="font-semibold text-slate-900">{details.updatedInvoices}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="font-medium text-slate-700">Total synced:</span>
                    <span className="font-bold text-slate-900">{details.synced}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3">
            <p className="text-center text-sm text-rose-700">
              {message || 'Please try again or contact support'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

