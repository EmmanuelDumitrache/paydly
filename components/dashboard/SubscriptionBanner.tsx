'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface SubscriptionBannerProps {
  subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired';
}

export function SubscriptionBanner({ subscriptionStatus }: SubscriptionBannerProps) {
  // Only show banner for expired or past_due subscriptions
  if (subscriptionStatus !== 'expired' && subscriptionStatus !== 'past_due') {
    return null;
  }

  const isExpired = subscriptionStatus === 'expired';
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-rose-300 bg-rose-600 px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-white" />
          <div className="text-sm font-medium text-white">
            {isExpired && 'Your subscription has expired. Subscribe now to continue using Paydly.'}
            {isPastDue && 'Payment failed. Please update your payment method to continue using Paydly.'}
          </div>
        </div>
        <Link
          href="/billing"
          className="flex-shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
        >
          {isExpired ? 'Subscribe Now' : 'Update Payment'}
        </Link>
      </div>
    </div>
  );
}

