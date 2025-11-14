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
  // Create response object first to set cookies on it
  const response = NextResponse.next();
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // CRITICAL: Parse cookies directly from request headers to ensure we get ALL cookies
  // Sometimes Next.js cookies() doesn't catch all cookies, especially ones set by browser
  const requestCookies: Array<{ name: string; value: string }> = [];
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        const value = valueParts.join('=');
        requestCookies.push({ name, value });
      }
    });
  }
  
  // Force reading all cookies from request to ensure they're available
  // Next.js lazily evaluates cookies, so we must explicitly read them first
  const allCookies = cookieStore.getAll();
  console.log('[Auth Callback] Cookies from cookieStore:', allCookies.map(c => c.name).join(', '));
  console.log('[Auth Callback] Cookies from request header:', requestCookies.map(c => c.name).join(', '));
  
  // Create Supabase client with proper cookie handling using @supabase/ssr
  // IMPORTANT: We merge cookies from both cookieStore and request headers to ensure we don't miss any
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // CRITICAL: Supabase expects cookies in format { name: string, value: string }
        // We prioritize request header cookies as they're the actual cookies sent by browser
        const cookieMap = new Map<string, { name: string; value: string }>();
        
        // First add cookies from cookieStore (these are parsed by Next.js)
        const storeCookies = cookieStore.getAll();
        storeCookies.forEach(c => {
          if (c.value && c.value.length > 0) {
            cookieMap.set(c.name, { name: c.name, value: c.value });
          }
        });
        
        // Then add/override with cookies from request headers (these are raw cookies from browser)
        // This ensures we capture cookies that Next.js might not have parsed correctly
        requestCookies.forEach(c => {
          if (c.value && c.value.length > 0) {
            cookieMap.set(c.name, c);
          }
        });
        
        const allCookies = Array.from(cookieMap.values());
        console.log('[Auth Callback] Supabase getAll() returning cookies:', allCookies.map(c => c.name).join(', '));
        return allCookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          // Also set on response for redirect
          response.cookies.set(name, value, {
            ...options,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? origin.startsWith('https'),
          });
        });
      },
    },
  });

  // Before exchanging, log all available cookies one more time
  const finalCookies = cookieStore.getAll();
  console.log('[Auth Callback] Final cookies before exchange:', finalCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value && c.value.length > 0,
    valueLength: c.value?.length || 0,
  })));
  
  // Check specifically for Supabase code verifier cookie pattern
  // Supabase uses pattern: sb-<project-ref>-auth-token-code-verifier
  const supabaseProjectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const expectedCodeVerifierName = supabaseProjectRef 
    ? `sb-${supabaseProjectRef}-auth-token-code-verifier`
    : null;
  
  if (expectedCodeVerifierName) {
    const codeVerifierCookie = finalCookies.find(c => c.name === expectedCodeVerifierName);
    if (codeVerifierCookie && codeVerifierCookie.value) {
      console.log('[Auth Callback] Found expected code verifier cookie:', expectedCodeVerifierName);
    } else {
      console.error('[Auth Callback] Expected code verifier cookie NOT found:', expectedCodeVerifierName);
      console.error('[Auth Callback] Available cookie names:', finalCookies.map(c => c.name).join(', '));
    }
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth Callback] Exchange error:', error.message);
    console.error('[Auth Callback] Error details:', JSON.stringify(error, null, 2));
    
    // Log comprehensive debugging info
    console.error('[Auth Callback] ========== DEBUG INFO ==========');
    console.error('[Auth Callback] Code received:', code?.substring(0, 20) + '...');
    console.error('[Auth Callback] All cookies in request:', Object.keys(cookieMap).join(', '));
    console.error('[Auth Callback] Code verifier cookie present:', !!codeVerifierCookieName);
    console.error('[Auth Callback] Expected code verifier name:', expectedCodeVerifierName);
    console.error('[Auth Callback] Final cookies count:', finalCookies.length);
    console.error('[Auth Callback] =================================');
    
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

  // Create redirect response
  // Supabase automatically sets session cookies during exchangeCodeForSession
  // The cookies are already set on the response object via setAll callback
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`);
  // Add cache control headers
  headers.forEach((value, key) => redirectResponse.headers.set(key, value));
  
  // Copy all cookies from cookieStore to redirect response
  // This ensures all cookies set by Supabase are preserved
  const cookiesAfterExchange = cookieStore.getAll();
  cookiesAfterExchange.forEach((cookie) => {
    if (cookie.value && cookie.value.length > 0) {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        httpOnly: cookie.name.startsWith('sb-') || cookie.name.includes('auth'),
        secure: origin.startsWith('https'),
        sameSite: 'lax',
        // Session cookies should persist longer
        maxAge: cookie.name.includes('session') || cookie.name.includes('access') 
          ? 60 * 60 * 24 * 7  // 7 days
          : undefined,
      });
    }
  });
  
  console.log('[Auth Callback] Successfully authenticated user:', userId);
  return redirectResponse;
}

