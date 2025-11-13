'use client';

import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { SyncOverlay } from '../ui/SyncOverlay';
import { SubscriptionBanner } from './SubscriptionBanner';
import { useSyncInvoices } from '@/lib/hooks/useSyncInvoices';

interface DashboardLayoutClientProps {
  children: ReactNode;
  xeroConnected: boolean;
  xeroTenantName?: string | null;
  lastSyncAt?: string | null;
  subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired';
  trialQuotaReached?: boolean;
  reminderSendCount?: number;
  trialLimit?: number;
  trialDaysLeft?: number | null;
}

export function DashboardLayoutClient({
  children,
  xeroConnected,
  xeroTenantName,
  lastSyncAt,
  subscriptionStatus,
  trialQuotaReached,
  reminderSendCount,
  trialLimit,
  trialDaysLeft,
}: DashboardLayoutClientProps) {
  const { sync, reset, status, message, details, isSyncing } = useSyncInvoices();

  const handleSync = () => {
    console.log('[DashboardLayoutClient] handleSync called', { xeroConnected, isSyncing });
    if (!xeroConnected) {
      console.warn('[DashboardLayoutClient] Sync blocked: Xero not connected');
      return;
    }
    if (isSyncing) {
      console.warn('[DashboardLayoutClient] Sync blocked: Already syncing');
      return;
    }
    console.log('[DashboardLayoutClient] Calling sync()');
    sync();
  };

  const handleCloseOverlay = () => {
    reset();
  };

  return (
    <>
      <SubscriptionBanner
        subscriptionStatus={subscriptionStatus}
        trialQuotaReached={trialQuotaReached}
        reminderSendCount={reminderSendCount}
        trialLimit={trialLimit}
        trialDaysLeft={trialDaysLeft ?? undefined}
      />
      <TopBar
        xeroConnected={xeroConnected}
        xeroTenantName={xeroTenantName}
        lastSyncAt={lastSyncAt}
        onSync={handleSync}
        isSyncing={isSyncing}
      />
      {children}
      <SyncOverlay
        isOpen={status !== 'idle'}
        status={status === 'idle' ? null : status}
        message={message}
        details={details}
        onClose={handleCloseOverlay}
      />
    </>
  );
}

