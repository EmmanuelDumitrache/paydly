import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  
  // Get the redirect URL from query params or use default
  const redirectTo = url.searchParams.get('redirect_to') || `${origin}/api/auth/callback`;
  
  // Create Supabase client with proper cookie handling for route handlers
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ 
    cookies: () => cookieStore,
  });
  
  // Get OAuth URL with proper PKCE handling
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Google Auth] Error initiating OAuth:', error);
    return NextResponse.redirect(
      `${origin}/login?error=oauth_init_failed&details=${encodeURIComponent(error.message)}`
    );
  }

  if (!data?.url) {
    console.error('[Google Auth] No OAuth URL returned');
    return NextResponse.redirect(`${origin}/login?error=no_oauth_url`);
  }

  // Create redirect response to Google OAuth
  // IMPORTANT: We need to preserve cookies set by Supabase during signInWithOAuth
  // The code verifier cookie must be included in this redirect so it's available
  // when Google redirects back to our callback route
  const redirectResponse = NextResponse.redirect(data.url);
  
  // Copy all cookies from the cookie store to the redirect response
  // This ensures the PKCE code verifier cookie is preserved during the redirect
  const allCookies = cookieStore.getAll();
  allCookies.forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      httpOnly: cookie.name.startsWith('sb-') || cookie.name.includes('auth'),
      secure: origin.startsWith('https'),
      sameSite: 'lax',
      maxAge: cookie.name.includes('code-verifier') ? 600 : undefined, // 10 minutes for code verifier
    });
  });
  
  return redirectResponse;
}

