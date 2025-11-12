'use client';

import { useState } from 'react';
import { Pause, Play, AlertTriangle } from 'lucide-react';

interface GlobalPauseToggleProps {
  initialPaused: boolean;
  pausedSince?: string | null;
}

export function GlobalPauseToggle({ initialPaused, pausedSince }: GlobalPauseToggleProps) {
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = async () => {
    // If pausing, show confirmation
    if (!isPaused) {
      setShowConfirm(true);
      return;
    }

    // If resuming, just do it
    await performToggle();
  };

  const performToggle = async () => {
    setLoading(true);
    setShowConfirm(false);

    try {
      const formData = new FormData();
      formData.append('paused', (!isPaused).toString());

      const response = await fetch('/api/settings/global-pause', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsPaused(!isPaused);
      } else {
        alert('Failed to update pause status');
      }
    } catch (error) {
      console.error('[GlobalPauseToggle] Error:', error);
      alert('Failed to update pause status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Global Reminder Control</h3>
              {isPaused && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  <Pause className="h-3 w-3" />
                  Paused
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {isPaused
                ? 'All automated reminders are currently paused. No emails will be sent until you resume.'
                : 'Automated reminders are active. Paydly will send reminders daily at 9am AEST.'}
            </p>
            {isPaused && pausedSince && (
              <p className="mt-1 text-xs text-slate-500">
                Paused since {new Date(pausedSince).toLocaleDateString('en-AU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${
              isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-amber-600 text-white hover:bg-amber-500'
            }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Updating...</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="h-4 w-4" />
                <span>Resume Reminders</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause All Reminders</span>
              </>
            )}
          </button>
        </div>

        {isPaused && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Reminders are paused</p>
                <p className="mt-1">
                  Your clients will not receive any payment reminders while paused. Remember to resume when you&apos;re ready.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Pause all reminders?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  This will stop all automated reminder emails from being sent. You can resume at any time.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={performToggle}
                disabled={loading}
                className="flex-1 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
              >
                {loading ? 'Pausing...' : 'Yes, Pause'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

