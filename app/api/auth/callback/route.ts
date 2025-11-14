import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const code = requestUrl.searchParams.get('code');
  
  console.log('[Auth Callback] Request received:', {
    url: requestUrl.toString(),
    hasCode: !!code,
    origin,
    pathname: requestUrl.pathname,
  });

  if (!code) {
    console.error('[Auth Callback] No code parameter found');
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth Callback] Error exchanging code for session:', error);
    return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
  }

  if (!data.user) {
    console.error('[Auth Callback] No user in session data');
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // If user was just created (new OAuth signup), ensure profile is set up
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

  // Verify session is set before redirecting
  // Get session using the supabase client to ensure cookies are properly set
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('[Auth Callback] No session after exchangeCodeForSession:', sessionError);
    return NextResponse.redirect(`${origin}/login?error=no_session`);
  }

  console.log('[Auth Callback] Successfully authenticated user:', userId);
  console.log('[Auth Callback] Session token exists:', !!session.access_token);

  // Check cookies that should be set by Supabase
  const allCookies = cookieStore.getAll();
  console.log('[Auth Callback] Cookies in cookie store:', allCookies.map(c => c.name));
  
  // Find Supabase auth cookies (they typically start with 'sb-')
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
  console.log('[Auth Callback] Supabase auth cookies found:', supabaseCookies.map(c => c.name));

  // Create redirect response
  // Supabase's createRouteHandlerClient automatically manages cookies in the cookieStore
  // We need to ensure the redirect response includes all cookies from the cookie store
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  
  // Copy ALL cookies from the cookie store to the redirect response
  // This ensures session cookies set by Supabase are preserved across the redirect
  allCookies.forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      // Supabase auth cookies are httpOnly
      httpOnly: cookie.name.startsWith('sb-') || cookie.name.includes('auth'),
      secure: origin.startsWith('https'),
      sameSite: 'lax',
      // Code verifier cookies expire in 10 minutes
      maxAge: cookie.name.includes('code-verifier') ? 600 : undefined,
    });
  });
  
  console.log('[Auth Callback] Redirecting to dashboard');
  console.log('[Auth Callback] Cookies being set on redirect:', redirectResponse.cookies.getAll().map(c => c.name));
  
  return redirectResponse;
}

