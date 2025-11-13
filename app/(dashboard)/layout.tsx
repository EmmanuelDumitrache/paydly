// @ts-nocheck - Supabase generic types cause issues with type inference
import type { ReactNode } from 'react';
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

  let xeroConnected = false;
let xeroTenantName = null;
let lastSyncAt = null;
let subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired' = 'trialing';
let reminderSendCount = 0;

let profile: any = null;

if (user) {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('xero_tenant_id, updated_at, subscription_status, reminder_send_count')
    .eq('id', user.id)
    .maybeSingle();

  profile = profileData;

  xeroConnected = Boolean(profile?.xero_tenant_id);
  lastSyncAt = profile?.updated_at || null;
  subscriptionStatus = (profile?.subscription_status as 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired') || 'trialing';
  reminderSendCount = profile?.reminder_send_count ?? 0;

  // Fetch tenant name if connected
  if (xeroConnected && profile?.xero_tenant_id) {
    // For now, we'll just use a placeholder. In production, you'd fetch this from Xero or store it.
    xeroTenantName = 'Xero Account';
  }
}

const trialLimit = TRIAL_REMINDER_LIMIT;
const trialQuotaReached = subscriptionStatus === 'trialing' && reminderSendCount >= trialLimit;

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
      >
        <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <SidebarNav />
              <PlanUsageCard
                subscriptionStatus={subscriptionStatus}
                reminderSendCount={reminderSendCount}
                trialLimit={trialLimit}
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
          <main className="flex-1 space-y-8">{children}</main>
        </div>
      </DashboardLayoutClient>
    </div>
  );
}

