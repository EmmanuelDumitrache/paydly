import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if a user has an active subscription (trialing or active)
 * Returns the profile if valid, null otherwise
 */
export async function checkActiveSubscription(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  // Check if trialing and trial has expired
  if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
    const trialEndsAt = new Date(profile.trial_ends_at);
    const now = new Date();
    
    if (now > trialEndsAt) {
      // Trial expired
      await supabase
        .from('profiles')
        .update({ subscription_status: 'expired' })
        .eq('id', userId);
      
      return null;
    }
  }

  // Check if subscription is active or trialing
  if (profile.subscription_status === 'trialing' || profile.subscription_status === 'active') {
    return profile;
  }

  // Subscription is expired, past_due, or cancelled
  return null;
}

