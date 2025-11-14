import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error);
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
    }

    // If user was just created (new OAuth signup), ensure profile is set up
    if (data.user) {
      const userId = data.user.id;
      const userEmail = data.user.email;

      // Check if profile exists, if not wait a moment for trigger to create it
      const profileResult = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist yet, wait a moment and try again (trigger may still be processing)
      let finalProfileResult = profileResult;
      if (profileResult.error?.code === 'PGRST116') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        finalProfileResult = await supabase
          .from('profiles')
          .select('subscription_status, trial_ends_at')
          .eq('id', userId)
          .maybeSingle();
      }

      // If profile exists but doesn't have trial info, set it up (for OAuth users)
      // @ts-ignore - TypeScript has trouble with Supabase query result types after reassignment
      if (finalProfileResult?.data && !finalProfileResult.data.trial_ends_at) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('profiles')
          // @ts-expect-error - TypeScript type inference issue with Supabase update
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
          // @ts-expect-error - TypeScript type inference issue with Supabase update
          .update({ email: userEmail })
          .eq('id', userId)
          .is('email', null);
      }
    }
  }

  // Redirect to dashboard after successful auth
  // The cookies should already be set by exchangeCodeForSession via createRouteHandlerClient
  // Copy cookies from the cookie store to the redirect response to ensure they're sent
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  
  const allCookies = cookieStore.getAll();
  allCookies.forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  
  return redirectResponse;
}

