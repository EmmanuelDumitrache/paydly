// @ts-nocheck - Supabase generic types cause issues with type inference
// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays, format } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { GlobalPauseToggle } from '@/components/settings/GlobalPauseToggle';
import { CustomIntervals } from '@/components/settings/CustomIntervals';
import { XeroErrorToast } from '@/components/settings/XeroErrorToast';
import { updateAccountProfile, updateReminderSchedule } from './actions';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: reminderSettings } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const connectedToXero = Boolean(profile?.xero_tenant_id);
  const subscriptionStatus = profile?.subscription_status ?? 'trialing';
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const daysLeft = trialEndsAt ? differenceInCalendarDays(trialEndsAt, new Date()) : null;

  const syncStatus = typeof searchParams.sync === 'string' ? searchParams.sync : null;
  const syncMessage = typeof searchParams.message === 'string' ? searchParams.message : null;
  const xeroError = typeof searchParams.xero === 'string' ? searchParams.xero : null;
  const xeroDetails = typeof searchParams.details === 'string' ? searchParams.details : null;

  // Map Xero error codes to user-friendly messages
  const getXeroErrorMessage = () => {
    if (!xeroError) return null;
    
    if (xeroError === 'tenant_in_use') {
      return xeroDetails || 'Xero account already in use! This account is already connected to another Paydly account. Please disconnect it from the other account first or use a different Xero account.';
    }
    if (xeroError === 'error') {
      return 'Failed to connect Xero. Please try again.';
    }
    if (xeroError === 'missing_params') {
      return 'Missing connection parameters. Please try connecting again.';
    }
    if (xeroError === 'invalid_state') {
      return 'Connection session expired. Please try connecting again.';
    }
    if (xeroError === 'failed') {
      // Check if it's a tenant_in_use error hidden in details
      if (xeroDetails && (xeroDetails.toLowerCase().includes('already connected') || xeroDetails.toLowerCase().includes('tenant'))) {
        return xeroDetails;
      }
      return 'Failed to connect Xero. Please try again.';
    }
    
    return 'Xero connection failed. Please try again.';
  };

  const xeroErrorMessage = getXeroErrorMessage();

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <XeroErrorToast />
      </Suspense>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your reminders, Xero connection, and billing details.</p>
      </div>

      {syncStatus && syncMessage ? (
        <div
          className={`rounded-2xl border px-6 py-4 text-sm ${
            syncStatus === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {syncMessage}
        </div>
      ) : null}

      {xeroErrorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {xeroErrorMessage}
        </div>
      ) : null}

      <GlobalPauseToggle 
        initialPaused={reminderSettings?.reminders_globally_paused ?? false}
        pausedSince={reminderSettings?.updated_at}
      />

      <CustomIntervals 
        initialIntervals={reminderSettings?.custom_intervals ?? { day_1: 7, day_2: 14, day_3: 21 }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Xero connection</h2>
            <p className="mt-1 text-sm text-slate-500">
              {connectedToXero
                ? 'You are connected to Xero. Reminders will continue to run every day.'
                : 'Connect Xero to sync invoices and automate reminders.'}
            </p>
            {connectedToXero ? (
              <p className="mt-2 text-xs text-slate-400">
                Tenant ID: {profile?.xero_tenant_id}
              </p>
            ) : null}
          </div>
          <div className="flex gap-3">
            {connectedToXero ? (
              <>
                <form action="/api/xero/sync" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                  >
                    Sync now
                  </button>
                </form>
                <form action="/api/xero/disconnect" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Disconnect
                  </button>
                </form>
              </>
            ) : (
              <form action="/api/xero/connect" method="post">
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                >
                  Connect Xero
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Email templates</h2>
            <p className="mt-1 text-sm text-slate-500">
              Custom templates are coming soon. For now we’ll use the Paydly defaults.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"
            disabled
          >
            Coming soon
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Account settings</h2>
        <form action={updateAccountProfile} className="mt-6 grid gap-4 sm:max-w-lg">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ''}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="full_name" className="text-sm font-medium text-slate-600">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="company_name" className="text-sm font-medium text-slate-600">
              Company name
            </label>
            <input
              id="company_name"
              name="company_name"
              defaultValue={profile?.company_name ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="ABC Consulting"
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
            <p className="mt-1 text-sm text-slate-500">
              {subscriptionStatus === 'active'
                ? 'You’re on the Paydly Pro plan.'
                : subscriptionStatus === 'trialing'
                ? daysLeft !== null && daysLeft > 0
                  ? `Trialing — ${daysLeft} days left.`
                  : 'Trialing — ends soon.'
                : 'Subscription status: ' + subscriptionStatus}
            </p>
            {trialEndsAt ? (
              <p className="mt-1 text-xs text-slate-400">Trial ends {format(trialEndsAt, 'd MMM yyyy')}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {subscriptionStatus === 'active' ? (
              <>
                <form action="/api/billing/portal" method="post">
                  <button
                    type="submit"
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    Manage subscription
                  </button>
                </form>
                <Link
                  href="/billing"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                >
                  View billing history
                </Link>
              </>
            ) : (
              <form action="/api/stripe/checkout" method="post">
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                >
                  Upgrade now
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

