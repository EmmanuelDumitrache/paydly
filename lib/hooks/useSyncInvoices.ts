'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncDetails {
  synced: number;
  newInvoices: number;
  updatedInvoices: number;
}

export function useSyncInvoices() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<SyncDetails | null>(null);
  const router = useRouter();

  const sync = useCallback(async () => {
    setStatus('syncing');
    setMessage('');
    setDetails(null);

    try {
      const response = await fetch('/api/xero/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      
      setStatus('success');
      setMessage(data.message || `Synced ${data.synced || 0} invoices successfully`);
      setDetails({
        synced: data.synced || 0,
        newInvoices: data.newInvoices || 0,
        updatedInvoices: data.updatedInvoices || 0,
      });
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('[useSyncInvoices] Error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to sync invoices');
    }
  }, [router]);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage('');
    setDetails(null);
  }, []);

  return {
    sync,
    reset,
    status,
    message,
    details,
    isSyncing: status === 'syncing',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

