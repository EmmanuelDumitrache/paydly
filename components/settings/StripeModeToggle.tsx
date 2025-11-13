'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type StripeMode = 'live' | 'test';

export function StripeModeToggle() {
  const [mode, setMode] = useState<StripeMode>('live');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    console.log('[Stripe Toggle] Fetching current mode…');

    fetch('/api/stripe/mode')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.mode === 'test' || data?.mode === 'live') {
          setMode(data.mode);
          console.log('[Stripe Toggle] Loaded mode', data.mode);
        } else {
          console.warn('[Stripe Toggle] Unexpected mode payload', data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load Stripe mode');
          console.error('[Stripe Toggle] Failed to fetch current mode');
        }
      })
      .finally(() => {
        if (isMounted) setInitializing(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (nextMode: StripeMode) => {
    if (loading || nextMode === mode) return;

    console.log('[Stripe Toggle] Attempting mode change', { from: mode, to: nextMode });

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to update mode');
      }

      const data = await res.json();
      if (data?.mode === 'test' || data?.mode === 'live') {
        setMode(data.mode);
        console.log('[Stripe Toggle] Mode updated', { previous: mode, current: data.mode });
        toast.success(`Stripe mode updated to ${data.mode === 'test' ? 'Test' : 'Live'}`);
      } else {
        console.warn('[Stripe Toggle] Unexpected response when updating mode', data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('[Stripe Toggle] Failed to update mode', err);
    } finally {
      setLoading(false);
    }
  };

  const isTest = mode === 'test';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stripe mode</h2>
          <p className="mt-1 text-sm text-slate-500">
            Toggle between live and test mode. Test mode uses Stripe&apos;s sandbox (card 4242 4242 4242 4242).
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Current: <span className={isTest ? 'text-emerald-600' : 'text-indigo-600'}>{isTest ? 'Test' : 'Live'}</span>
          </p>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => handleToggle('live')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              !isTest ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            disabled={loading || initializing}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => handleToggle('test')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isTest ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            disabled={loading || initializing}
          >
            Test
          </button>
        </div>
      </div>
      {initializing ? (
        <p className="mt-3 text-xs text-slate-400">Loading current mode...</p>
      ) : !loading ? (
        <p className="mt-3 text-xs text-slate-400">
          {isTest
            ? 'Using STRIPE_TEST_* environment variables. Remember to switch back before inviting customers.'
            : 'Using live Stripe keys. Switch to test mode before testing with sandbox cards.'}
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Updating…</p>
      )}
    </div>
  );
}


