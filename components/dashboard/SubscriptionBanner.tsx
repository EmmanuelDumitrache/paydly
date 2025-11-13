'use client';

import Link from 'next/link';
import { AlertCircle, AlertTriangle } from 'lucide-react';

import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

interface SubscriptionBannerProps {
  subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired';
  trialQuotaReached?: boolean;
  reminderSendCount?: number;
  trialLimit?: number;
  trialDaysLeft?: number;
}

export function SubscriptionBanner({
  subscriptionStatus,
  trialQuotaReached = false,
  reminderSendCount = 0,
  trialLimit = TRIAL_REMINDER_LIMIT,
  trialDaysLeft,
}: SubscriptionBannerProps) {
  const isExpired = subscriptionStatus === 'expired';
  const isPastDue = subscriptionStatus === 'past_due';

  if (isExpired || isPastDue) {
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

  if (trialQuotaReached) {
    return (
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-amber-300 bg-amber-500 px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-white" />
            <div className="text-sm font-medium text-white">
              {`Trial limit reached (${reminderSendCount}/${trialLimit} reminders sent)${typeof trialDaysLeft === 'number' ? ` • ${Math.max(trialDaysLeft, 0)} day${trialDaysLeft === 1 ? '' : 's'} left` : ''}. Upgrade to keep automating follow-ups.`}
            </div>
          </div>
          <Link
            href="/billing"
            className="flex-shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow-sm transition hover:bg-amber-50"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

