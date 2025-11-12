'use client';

import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { SyncOverlay } from '../ui/SyncOverlay';
import { useSyncInvoices } from '@/lib/hooks/useSyncInvoices';

interface DashboardLayoutClientProps {
  children: ReactNode;
  xeroConnected: boolean;
  xeroTenantName?: string | null;
  lastSyncAt?: string | null;
}

export function DashboardLayoutClient({
  children,
  xeroConnected,
  xeroTenantName,
  lastSyncAt,
}: DashboardLayoutClientProps) {
  const { sync, reset, status, message, isSyncing } = useSyncInvoices();

  const handleSync = () => {
    if (!xeroConnected) return;
    sync();
  };

  const handleCloseOverlay = () => {
    reset();
  };

  return (
    <>
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
        onClose={handleCloseOverlay}
      />
    </>
  );
}

