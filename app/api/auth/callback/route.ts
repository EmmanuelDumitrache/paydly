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

  // CRITICAL: Read cookies directly from request headers first
  // This ensures we capture all cookies, including those set by the client-side OAuth flow
  const cookieHeader = request.headers.get('cookie') || '';
  console.log('[Auth Callback] Processing callback with code:', code?.substring(0, 10) + '...');
  console.log('[Auth Callback] Cookie header length:', cookieHeader.length);
  
  // Parse cookies from header manually to see what's available
  const cookieMap: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        cookieMap[name] = valueParts.join('=');
      }
    });
  }
  
  // Check for code verifier cookie
  const codeVerifierCookieName = Object.keys(cookieMap).find(name => 
    name.includes('code-verifier') || name.includes('code_verifier')
  );
  
  if (codeVerifierCookieName) {
    console.log('[Auth Callback] Code verifier cookie found:', codeVerifierCookieName);
  } else {
    console.warn('[Auth Callback] Code verifier cookie NOT found in request headers!');
    console.warn('[Auth Callback] Available cookie names:', Object.keys(cookieMap).join(', '));
  }
  
  // CRITICAL: For proper PKCE cookie handling with Next.js 14+
  // We must pass cookies as a function that returns a fresh cookie store
  // This ensures cookies are read fresh on each access by Supabase
  const cookieStore = cookies();
  
  // Force reading all cookies from request to ensure they're available
  // Next.js lazily evaluates cookies, so we must explicitly read them first
  const allCookies = cookieStore.getAll();
  console.log('[Auth Callback] Cookies from cookieStore:', allCookies.map(c => c.name).join(', '));
  
  // Create Supabase client with proper cookie handling
  // IMPORTANT: The cookies function must return a function that provides cookies
  // This allows Supabase to read cookies fresh on each access
  const supabase = createRouteHandlerClient<Database>({ 
    cookies: () => cookieStore,
  });

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
  // Supabase automatically sets session cookies during exchangeCodeForSession
  // We need to ensure all cookies are preserved in the response
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  
  // Get all cookies after the exchange (Supabase sets new session cookies here)
  // Read from the cookieStore again to get any cookies Supabase may have set
  const cookiesAfterExchange = cookieStore.getAll();
  
  // Preserve all cookies in the redirect response
  cookiesAfterExchange.forEach((cookie) => {
    // Only set cookies that have values
    if (cookie.value && cookie.value.length > 0) {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        httpOnly: cookie.name.startsWith('sb-') || cookie.name.includes('auth'),
        secure: origin.startsWith('https'),
        sameSite: 'lax',
        // Session cookies should persist longer
        maxAge: cookie.name.includes('session') || cookie.name.includes('access') 
          ? 60 * 60 * 24 * 7  // 7 days
          : cookie.name.includes('code-verifier')
          ? undefined  // Don't set maxAge for code verifier (should be short-lived anyway)
          : undefined,
      });
    }
  });
  
  console.log('[Auth Callback] Successfully authenticated user:', userId);
  return redirectResponse;
}

