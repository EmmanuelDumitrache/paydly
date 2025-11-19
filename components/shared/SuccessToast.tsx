'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function SuccessToast() {
  const searchParams = useSearchParams();
  const xeroStatus = searchParams.get('xero');
  const tenantName = searchParams.get('tenant');
  const syncStatus = searchParams.get('sync');
  const syncMessage = searchParams.get('message');

  useEffect(() => {
    // Handle Xero connection success
    if (xeroStatus === 'success') {
      const name = tenantName ? decodeURIComponent(tenantName) : 'Xero';
      toast.success('Xero Connected Successfully!', {
        description: `Connected to ${name}. You can now sync your invoices.`,
        duration: 5000,
      });
    }

    // Handle sync success
    if (syncStatus === 'success' && syncMessage) {
      toast.success('Invoices Synced!', {
        description: syncMessage,
        duration: 5000,
      });
    }

    // Handle sync error
    if (syncStatus === 'error' && syncMessage) {
      toast.error('Sync Failed', {
        description: syncMessage,
        duration: 5000,
      });
    }
  }, [xeroStatus, tenantName, syncStatus, syncMessage]);

  return null;
}

