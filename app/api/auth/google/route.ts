import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const redirectTo = `${origin}/api/auth/callback`;

  // Create Supabase client with fresh cookies
  const cookieStore = cookies();
  
  // Force reading cookies to ensure they're available
  cookieStore.getAll();
  
  const supabase = createRouteHandlerClient<Database>({ 
    cookies: () => cookies(), // Fresh cookie store
  });

  console.log('[Auth Google] Initiating OAuth flow, redirectTo:', redirectTo);

  // Initiate OAuth flow server-side - this will set the code verifier cookie server-side
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
    console.error('[Auth Google] Error initiating OAuth:', error);
    return NextResponse.redirect(`${origin}/login?error=oauth_init_failed&details=${encodeURIComponent(error.message)}`);
  }

  if (!data.url) {
    console.error('[Auth Google] No OAuth URL returned');
    return NextResponse.redirect(`${origin}/login?error=no_oauth_url`);
  }

  console.log('[Auth Google] Redirecting to OAuth provider');

  const response = NextResponse.redirect(data.url);

  // Log Set-Cookie headers from the response
  const setCookieHeaders = response.headers.getSetCookie();
  console.log('[Auth Google] Set-Cookie headers from OAuth initiation response:', setCookieHeaders);

  return response;
}

