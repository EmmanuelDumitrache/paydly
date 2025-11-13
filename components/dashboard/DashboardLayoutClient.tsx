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
}

export function DashboardLayoutClient({
  children,
  xeroConnected,
  xeroTenantName,
  lastSyncAt,
  subscriptionStatus,
}: DashboardLayoutClientProps) {
  const { sync, reset, status, message, details, isSyncing } = useSyncInvoices();

  const handleSync = () => {
    if (!xeroConnected) return;
    sync();
  };

  const handleCloseOverlay = () => {
    reset();
  };

  return (
    <>
      <SubscriptionBanner subscriptionStatus={subscriptionStatus} />
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

