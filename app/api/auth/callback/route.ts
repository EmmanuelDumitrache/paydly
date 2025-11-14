import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error);
      // Redirect to login with error
      const loginUrl = new URL('/login', requestUrl);
      loginUrl.searchParams.set('error', 'authentication_failed');
      return NextResponse.redirect(loginUrl);
    }

    // If user was just created (new OAuth signup), ensure profile is set up
    if (data.user) {
      const userId = data.user.id;
      const userEmail = data.user.email;

      // Check if profile exists, if not wait a moment for trigger to create it
      let profile = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist yet, wait a moment and try again (trigger may still be processing)
      if (!profile.data && profile.error?.code === 'PGRST116') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        profile = await supabase
          .from('profiles')
          .select('subscription_status, trial_ends_at')
          .eq('id', userId)
          .maybeSingle();
      }

      // If profile exists but doesn't have trial info, set it up (for OAuth users)
      if (profile.data && !profile.data.trial_ends_at) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt,
          })
          .eq('id', userId);
      }

      // Update email if it's missing (can happen with some OAuth providers)
      if (userEmail) {
        await supabase
          .from('profiles')
          .update({ email: userEmail })
          .eq('id', userId)
          .is('email', null);
      }
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl));
}

