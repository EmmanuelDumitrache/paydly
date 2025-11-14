import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const code = requestUrl.searchParams.get('code');

  // Set headers to prevent caching issues that can affect cookie handling
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  if (!code) {
    const redirectResponse = NextResponse.redirect(`${origin}/login?error=missing_code`);
    headers.forEach((value, key) => redirectResponse.headers.set(key, value));
    return redirectResponse;
  }

  console.log('[Auth Callback] Processing callback with code:', code?.substring(0, 10) + '...');
  
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Log cookies to help debug PKCE flow
  const availableCookies = cookieStore.getAll();
  console.log('[Auth Callback] Cookies available:', availableCookies.map(c => c.name).join(', '));
  
  // Check for code verifier cookie specifically
  const codeVerifierCookie = availableCookies.find(c => 
    c.name.includes('code-verifier') || c.name.includes('code_verifier')
  );
  if (codeVerifierCookie) {
    console.log('[Auth Callback] ✅ Code verifier cookie found:', codeVerifierCookie.name);
  } else {
    console.warn('[Auth Callback] ⚠️ Code verifier cookie NOT found!');
    console.warn('[Auth Callback] This will cause exchangeCodeForSession to fail.');
  }

  // Create Supabase client with proper cookie handling using @supabase/ssr
  // For route handlers, only use cookieStore (not request/response cookies)
  // cookieStore automatically sets cookies on the response in Next.js route handlers
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth Callback] Exchange error:', error.message);
    console.error('[Auth Callback] Error details:', JSON.stringify(error, null, 2));

    const errorRedirect = NextResponse.redirect(
      `${origin}/login?error=authentication_failed&details=${encodeURIComponent(error.message)}`
    );
    headers.forEach((value, key) => errorRedirect.headers.set(key, value));
    return errorRedirect;
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
  if (finalProfileResult?.data && !finalProfileResult.data.trial_ends_at) {
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

  console.log('[Auth Callback] Successfully authenticated user:', userId);

  // Create redirect response with cache control headers
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  headers.forEach((value, key) => redirectResponse.headers.set(key, value));

  return redirectResponse;
}

