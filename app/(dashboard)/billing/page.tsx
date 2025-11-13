// @ts-nocheck - Supabase generic types cause issues with type inference
'use client';

import { useState, useEffect } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const accessStatus = searchParams.get('access');

  // Fetch profile on mount
  useEffect(() => {
    let isMounted = true;

    fetch('/api/profile', { credentials: 'include' })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.status === 401) {
          setError('Your session has expired. Please sign in again.');
          setProfile(null);
          setTimeout(() => {
            window.location.href = '/login?redirect=/billing';
          }, 1500);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load billing information');
        }
        const data = await res.json();
        setProfile(data.profile);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load billing information');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setLoading(false);
        window.location.href = '/login?redirect=/billing';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setLoading(false);
        window.location.href = '/login?redirect=/billing';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const subscriptionStatus = profile?.subscription_status || 'trialing';
  const trialEndsAt = profile?.trial_ends_at;
  const daysLeft = trialEndsAt ? differenceInCalendarDays(new Date(trialEndsAt), new Date()) : 0;
  const reminderSendCount = profile?.reminder_send_count ?? 0;
  const trialLimit = TRIAL_REMINDER_LIMIT;
  const trialLimitReached = subscriptionStatus === 'trialing' && reminderSendCount >= trialLimit;
  const showTrialExpired = subscriptionStatus === 'expired' || (subscriptionStatus === 'trialing' && daysLeft <= 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your subscription and payment method</p>
      </div>

      {accessStatus === 'blocked' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-900">Subscription Required</h3>
              <p className="mt-1 text-sm text-rose-700">
                Your subscription has expired. Subscribe now to continue using Paydly and access your invoices.
              </p>
            </div>
          </div>
        </div>
      )}

      {accessStatus === 'expired' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Trial Ended</h3>
              <p className="mt-1 text-sm text-amber-700">
                Your 14-day trial has ended. Subscribe now to continue using Paydly.
              </p>
            </div>
          </div>
        </div>
      )}

      {trialLimitReached && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              You've used all {trialLimit} reminder emails included in the trial. Upgrade to unlock unlimited reminders.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Upgrade now'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              {subscriptionStatus === 'active'
                ? 'You have an active subscription'
                : subscriptionStatus === 'trialing'
                ? `Your trial ${daysLeft > 0 ? `ends in ${daysLeft} days` : 'has ended'}`
                : 'Your subscription has expired'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {subscriptionStatus === 'active' && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Check className="mr-1 h-3 w-3" />
                Active
              </span>
            )}
            {subscriptionStatus === 'trialing' && daysLeft > 0 && !trialLimitReached && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                Trial
              </span>
            )}
            {showTrialExpired && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                Expired
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Paydly Professional</h3>
              <p className="mt-1 text-sm text-slate-600">Unlimited invoices & reminders</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Automatic invoice syncing from Xero
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Smart reminders at 7, 14, and 21 days
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Email delivery via Resend
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Dashboard & analytics
                </li>
              </ul>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">$29</div>
              <div className="text-sm text-slate-500">per month</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {subscriptionStatus === 'active' ? (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Loading...' : 'Manage Billing'}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
          )}
        </div>
      </div>

      {/* Payment Method */}
      {subscriptionStatus === 'active' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your payment method in the Stripe billing portal
          </p>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update Payment Method
          </button>
        </div>
      )}

      {/* Billing History */}
      {subscriptionStatus === 'active' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Billing History</h2>
          <p className="mt-1 text-sm text-slate-500">
            View your invoices and payment history in the Stripe billing portal
          </p>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            View Billing History
          </button>
        </div>
      )}
    </div>
  );
}
