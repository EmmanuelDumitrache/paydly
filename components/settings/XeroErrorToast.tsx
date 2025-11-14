'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function XeroErrorToast() {
  const searchParams = useSearchParams();
  const xeroError = searchParams.get('xero');
  const xeroDetails = searchParams.get('details');

  useEffect(() => {
    if (!xeroError) return;

    if (xeroError === 'tenant_in_use') {
      toast.error('Xero Account Already in Use!', {
        description: xeroDetails || 'This Xero account is already connected to another Paydly account. Please disconnect it from the other account first or use a different Xero account.',
        duration: 6000,
      });
    } else if (xeroError === 'error') {
      toast.error('Failed to Connect Xero', {
        description: 'Please try again.',
        duration: 5000,
      });
    } else if (xeroError === 'missing_params') {
      toast.error('Connection Failed', {
        description: 'Missing connection parameters. Please try connecting again.',
        duration: 5000,
      });
    } else if (xeroError === 'invalid_state') {
      toast.error('Connection Session Expired', {
        description: 'Please try connecting again.',
        duration: 5000,
      });
    } else if (xeroError === 'failed') {
      // Check if details contain tenant_in_use info
      if (xeroDetails && (xeroDetails.toLowerCase().includes('already connected') || xeroDetails.toLowerCase().includes('tenant') || xeroDetails.toLowerCase().includes('in use'))) {
        toast.error('Xero Account Already in Use!', {
          description: xeroDetails,
          duration: 6000,
        });
      } else {
        toast.error('Failed to Connect Xero', {
          description: 'Please try again.',
          duration: 5000,
        });
      }
    }
  }, [xeroError, xeroDetails]);

  return null;
}

