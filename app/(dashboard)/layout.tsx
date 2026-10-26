// @ts-nocheck - Supabase generic types cause issues with type inference
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import Link from 'next/link';
import { cookies } from 'next/headers';
import { differenceInCalendarDays } from 'date-fns';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';
import { PlanUsageCard } from '@/components/dashboard/PlanUsageCard';
import { createClient } from '@/lib/supabase/server';
import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[DashboardLayout] Auth user:', { userId: user?.id, email: user?.email });

  let xeroConnected = false;
  let xeroTenantName = null;
  let lastSyncAt = null;
  let subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired' = 'trialing';
  let reminderSendCount = 0;
  let trialEndsAt: string | null = null;

  let profile: any = null;

  let isDemo = false;
  try {
    isDemo = cookies().get('paydly_demo')?.value === 'true';
  } catch {
    // Ignore
  }

  if (user && !isDemo) {
    try {
      // ⚠️ IMPORTANT: Use exact same query pattern as getDashboardData (lib/data/dashboard.ts)
      // DO NOT add .eq('id', user.id) - let RLS handle user filtering
      // DO NOT use specific column selects - use .select('*') for consistency
      // See docs/XERO_CONNECTION_STATUS_FIX.md for details
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .maybeSingle();

      if (profileError) {
        console.error('[DashboardLayout] Profile query error:', profileError);
        // Continue with default values if profile query fails
      } else {
        profile = profileRow;

        console.log('[DashboardLayout] Profile query result:', {
          userId: user.id,
          profileData: profile,
          xero_tenant_id: profile?.xero_tenant_id,
          xero_tenant_name: profile?.xero_tenant_name,
        });

        xeroConnected = Boolean(profile?.xero_tenant_id);
        lastSyncAt = profile?.updated_at || null;
        subscriptionStatus =
          (profile?.subscription_status as 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired') || 'trialing';
        reminderSendCount = profile?.reminder_send_count ?? 0;

        trialEndsAt = profile?.trial_ends_at ?? null;

        if (xeroConnected && profile?.xero_tenant_name) {
          xeroTenantName = profile.xero_tenant_name;
        }
      }

      console.log('[DashboardLayout] Computed values:', {
        xeroConnected,
        xeroTenantName,
        lastSyncAt,
        subscriptionStatus,
      });
    } catch (error) {
      console.error('[DashboardLayout] Unexpected error fetching profile:', error);
      // Continue with default values on error
    }
  } else {
    // Demo Mode defaults
    xeroConnected = true;
    xeroTenantName = 'Acme Digital Agency (Demo)';
    subscriptionStatus = 'trialing';
    reminderSendCount = 3;
    trialEndsAt = new Date(Date.now() + 10 * 86400000).toISOString();
  }

  const trialLimit = TRIAL_REMINDER_LIMIT;
  const trialQuotaReached = subscriptionStatus === 'trialing' && reminderSendCount >= trialLimit;
  const daysLeft =
    subscriptionStatus === 'trialing' && trialEndsAt
      ? Math.max(differenceInCalendarDays(new Date(trialEndsAt), new Date()), 0)
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardLayoutClient
        xeroConnected={xeroConnected}
        xeroTenantName={xeroTenantName}
        lastSyncAt={lastSyncAt}
        subscriptionStatus={subscriptionStatus}
        trialQuotaReached={trialQuotaReached}
        reminderSendCount={reminderSendCount}
        trialLimit={trialLimit}
        trialDaysLeft={daysLeft}
      >
        <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <SidebarNav />
              <PlanUsageCard
                subscriptionStatus={subscriptionStatus}
                reminderSendCount={reminderSendCount}
                trialLimit={trialLimit}
                trialDaysLeft={daysLeft}
              />
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </aside>
          <main className="flex-1 space-y-8">
            {!user || isDemo ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-xs text-indigo-700 flex items-center justify-between">
                <span>⚡ <strong>Demo Mode:</strong> You are viewing interactive sample data. (To connect real Xero &amp; Supabase accounts, configure <code className="font-mono bg-indigo-100 px-1 rounded">.env.local</code>).</span>
                <Link href="/" className="font-semibold underline hover:text-indigo-900 ml-2 whitespace-nowrap">Home</Link>
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </DashboardLayoutClient>
    </div>
  );
}

