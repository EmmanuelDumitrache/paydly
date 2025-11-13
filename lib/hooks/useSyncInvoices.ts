'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    toast.loading('Syncing invoices...', { id: 'sync' });

    try {
      const response = await fetch('/api/xero/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Sync failed: ${response.status} ${response.statusText}`;
        console.error('[useSyncInvoices] Sync failed:', errorMessage, data);
        setStatus('error');
        setMessage(errorMessage);
        toast.error(errorMessage, { id: 'sync' });
        return;
      }
      
      setStatus('success');
      const successMessage = data.message || `Synced ${data.synced || 0} invoices successfully`;
      setMessage(successMessage);
      setDetails({
        synced: data.synced || 0,
        newInvoices: data.newInvoices || 0,
        updatedInvoices: data.updatedInvoices || 0,
      });
      
      toast.success(successMessage, { id: 'sync' });
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('[useSyncInvoices] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync invoices';
      setStatus('error');
      setMessage(errorMessage);
      toast.error(errorMessage, { id: 'sync' });
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

