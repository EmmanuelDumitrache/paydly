import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // IMPORTANT: Force Next.js to read all cookies before exchangeCodeForSession
  // Next.js lazily evaluates cookies, so we must explicitly read them first
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll(); // Force reading all cookies from request
  
  // Create Supabase client with cookie store
  // The client will use this cookie store to read and set cookies
  const supabase = createRouteHandlerClient<Database>({ 
    cookies: () => cookieStore,
  });
  
  
  // Log cookies for debugging - check if code_verifier is present
  const cookieHeader = request.headers.get('cookie') || '';
  console.log('[Auth Callback] Cookie header length:', cookieHeader.length);
  console.log('[Auth Callback] Cookies from cookieStore:', allCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value && c.value.length > 0,
  })));
  
  // Check for code_verifier in request headers directly (for debugging)
  const codeVerifierMatch = cookieHeader.match(/sb-[^=]*-auth-token-code-verifier=([^;]*)/);
  if (codeVerifierMatch && codeVerifierMatch[1] && codeVerifierMatch[1].length > 0) {
    console.log('[Auth Callback] Code verifier found in cookie header, length:', codeVerifierMatch[1].length);
  } else {
    console.warn('[Auth Callback] Code verifier NOT found in cookie header!');
    console.warn('[Auth Callback] Available cookies:', allCookies.map(c => c.name).join(', '));
    // Note: Supabase's exchangeCodeForSession might still work if the cookie is read differently
    // We'll let it try and handle the error if it fails
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=authentication_failed&details=${encodeURIComponent(error.message)}`
    );
  }

  if (!data.user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

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
  // @ts-expect-error - TypeScript type inference issue with Supabase query result types
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

  // Create redirect response
  // Supabase sets cookies automatically during exchangeCodeForSession
  // We need to ensure the response includes all cookies from the request
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  
  // Copy all cookies from the request to the redirect response
  // This ensures session cookies set by Supabase are preserved
  const cookiesAfterExchange = cookieStore.getAll();
  cookiesAfterExchange.forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      httpOnly: cookie.name.startsWith('sb-') || cookie.name.includes('auth'),
      secure: origin.startsWith('https'),
      sameSite: 'lax',
      maxAge: cookie.name.includes('session') ? 60 * 60 * 24 * 7 : undefined, // 7 days for session cookies
    });
  });
  
  return redirectResponse;
}

