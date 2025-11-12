// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays, format } from 'date-fns';
import Link from 'next/link';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';

import { Stats } from '@/components/dashboard/Stats';
import { XeroConnect } from '@/components/dashboard/XeroConnect';
import { CronMonitor } from '@/components/dashboard/CronMonitor';
import { getDashboardData } from '@/lib/data/dashboard';
import { createClient } from '@/lib/supabase/server';

function TrialBanner({ trialEndsAt }: { trialEndsAt: string | null }) {
  if (!trialEndsAt) return null;
  const daysLeft = differenceInCalendarDays(new Date(trialEndsAt), new Date());
  if (daysLeft < 0) return null;

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-4 text-sm text-indigo-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          Your trial ends in <span className="font-semibold">{daysLeft} days</span>. Add a payment method to keep
          reminders running.
        </p>
        <form action="/api/stripe/checkout" method="post">
          <button className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500">
            Upgrade now
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = createClient();
  const { profile, stats, invoices, upcomingReminders, xeroConnected, xeroTenantName } = await getDashboardData(supabase);

  const lastSyncText = profile?.updated_at
    ? `${format(new Date(profile.updated_at), 'd MMM yyyy, h:mm a')}`
    : 'Not synced yet';

  const syncStatus = typeof searchParams.sync === 'string' ? searchParams.sync : null;
  const syncMessage = typeof searchParams.message === 'string' ? searchParams.message : null;
  const xeroStatus = typeof searchParams.xero === 'string' ? searchParams.xero : null;
  const xeroTenant = typeof searchParams.tenant === 'string' ? decodeURIComponent(searchParams.tenant) : null;

  return (
    <div className="space-y-8">
      {xeroStatus === 'success' && xeroTenant ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Connected to <strong>{xeroTenant}</strong> successfully. You can now sync your invoices.</span>
          </div>
        </div>
      ) : null}

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

      {profile?.subscription_status === 'expired' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              <span className="font-semibold">⚠ Trial ended</span> - Add payment to continue using Paydly
            </p>
            <a
              href="/billing"
              className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500"
            >
              Add Payment Method
            </a>
          </div>
        </div>
      ) : profile?.subscription_status === 'trialing' ? (
        <TrialBanner trialEndsAt={profile.trial_ends_at} />
      ) : null}

      <CronMonitor />

      {!xeroConnected ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              Connect your Xero account to start syncing invoices and automate reminders.
            </p>
            <form action="/api/xero/connect" method="post">
              <button className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-500">
                Connect Xero
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <Stats stats={stats} />
      
      <XeroConnect connected={xeroConnected} lastSyncedAt={lastSyncText} tenantName={xeroTenantName} />

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/overdue"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-100 p-3">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Overdue Invoices</h3>
                <p className="mt-1 text-2xl font-bold text-rose-600">{invoices.length}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {invoices.length > 0 
              ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} need${invoices.length === 1 ? 's' : ''} attention`
              : 'All invoices are up to date'}
          </p>
        </Link>

        <Link
          href="/upcoming"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Reminders</h3>
                <p className="mt-1 text-2xl font-bold text-indigo-600">{upcomingReminders.length}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {upcomingReminders.length > 0
              ? `${upcomingReminders.length} reminder${upcomingReminders.length === 1 ? '' : 's'} scheduled`
              : 'No reminders scheduled'}
          </p>
        </Link>
      </div>
    </div>
  );
}

