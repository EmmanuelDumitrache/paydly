import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

interface PlanUsageCardProps {
  subscriptionStatus: 'trialing' | 'active' | 'cancelled' | 'past_due' | 'expired';
  reminderSendCount: number;
  trialLimit?: number;
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
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-base font-semibold text-slate-900">{planLabel}</span>
        <span
          className={`text-xs font-medium ${
            isPremium ? 'text-emerald-600' : subscriptionStatus === 'past_due' || subscriptionStatus === 'expired'
              ? 'text-rose-600'
              : 'text-indigo-600'
          }`}
        >
          {isPremium ? 'Unlimited reminders' : `${trialLimit} reminder emails`}
        </span>
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
          <p className="text-xs text-slate-500">
            {trialLimit - clampedUsed > 0
              ? `${trialLimit - clampedUsed} reminder${trialLimit - clampedUsed === 1 ? '' : 's'} remaining in trial`
              : 'Trial limit reached — upgrade for unlimited reminders'}
          </p>
        )}
      </div>
    </div>
  );
}


