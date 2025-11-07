import { differenceInCalendarDays, format } from 'date-fns';
import Link from 'next/link';

import { InvoiceList } from '@/components/dashboard/InvoiceList';
import { Stats } from '@/components/dashboard/Stats';
import { UpcomingReminders } from '@/components/dashboard/UpcomingReminders';
import { XeroConnect } from '@/components/dashboard/XeroConnect';
import { getMockDashboardData } from '@/lib/data/mock';

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

export default function DashboardPage() {
  // Using mock data for now - will connect to Supabase after database setup
  const { profile, stats, invoices, upcomingReminders, xeroConnected } = getMockDashboardData();

  const lastSyncText = profile?.updated_at
    ? `${format(new Date(profile.updated_at), 'd MMM yyyy, h:mm a')}`
    : 'Not synced yet';

  return (
    <div className="space-y-8">
      {profile?.subscription_status === 'trialing' ? (
        <TrialBanner trialEndsAt={profile.trial_ends_at} />
      ) : null}

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
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <XeroConnect connected={xeroConnected} lastSyncedAt={lastSyncText} />
          <InvoiceList invoices={invoices} />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Need more control? Manage reminders and billing in{' '}
            <Link href="/settings" className="font-semibold text-indigo-600">
              Settings
            </Link>
            .
          </div>
        </div>
        <UpcomingReminders reminders={upcomingReminders} />
      </div>
    </div>
  );
}

