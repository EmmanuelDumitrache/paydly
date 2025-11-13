import Link from 'next/link';

import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

interface PlanUsageCardProps {
  subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired';
  reminderSendCount: number;
  trialLimit?: number;
  trialDaysLeft?: number | null;
}

function getPlanLabel(status: PlanUsageCardProps['subscriptionStatus']) {
  switch (status) {
    case 'active':
      return 'Premium';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Trial';
  }
}

export function PlanUsageCard({
  subscriptionStatus,
  reminderSendCount,
  trialLimit = TRIAL_REMINDER_LIMIT,
  trialDaysLeft = null,
}: PlanUsageCardProps) {
  const planLabel = getPlanLabel(subscriptionStatus);
  const isPremium = subscriptionStatus === 'active';
  const effectiveLimit = isPremium ? Infinity : trialLimit;
  const used = reminderSendCount ?? 0;
  const clampedUsed = isFinite(effectiveLimit) ? Math.min(used, effectiveLimit) : used;
  const progressPercent = isFinite(effectiveLimit)
    ? Math.min(100, Math.round((clampedUsed / effectiveLimit) * 100))
    : 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</div>
          <span className="mt-1 block text-base font-semibold text-slate-900">{planLabel}</span>
        </div>
        <a
          href="/billing"
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            isPremium
              ? 'border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isPremium ? 'Manage plan' : 'Upgrade now'}
        </a>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Reminder emails sent</span>
          <span className="font-medium text-slate-600">
            {isFinite(effectiveLimit) ? `${clampedUsed}/${trialLimit}` : `${used} sent`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${isPremium ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-indigo-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {!isPremium && (
          <div className="text-xs text-slate-500">
            {trialLimit - clampedUsed > 0
              ? `${trialLimit - clampedUsed} reminder${trialLimit - clampedUsed === 1 ? '' : 's'} remaining in trial`
              : 'Trial limit reached — upgrade for unlimited reminders'}
            {typeof trialDaysLeft === 'number' && (
              <div className="mt-1 text-slate-400">
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in trial`
                  : 'Trial has ended'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


