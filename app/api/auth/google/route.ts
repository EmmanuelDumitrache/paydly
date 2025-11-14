// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const redirectTo = `${origin}/api/auth/callback`;

  console.log('[Auth Google] Initiating server-side Google OAuth');
  console.log('[Auth Google] Redirect URL:', redirectTo);

  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create Supabase client with proper cookie handling
  // Server-side initiation ensures cookies are set correctly for PKCE
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, {
            ...options,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? origin.startsWith('https'),
            // Set domain to work with both www and non-www
            domain: options?.domain || (origin.includes('paydly.io') ? '.paydly.io' : undefined),
          });
        });
      },
    },
  });

  // Generate OAuth URL server-side - this ensures PKCE code verifier is set in cookies
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
    console.error('[Auth Google] OAuth initiation error:', error);
    return NextResponse.redirect(`${origin}/login?error=oauth_init_failed&details=${encodeURIComponent(error.message)}`);
  }

  if (!data?.url) {
    console.error('[Auth Google] No OAuth URL returned');
    return NextResponse.redirect(`${origin}/login?error=no_oauth_url`);
  }

  // Log cookies after OAuth URL generation
  const cookiesAfterInit = cookieStore.getAll();
  console.log('[Auth Google] Cookies after OAuth init:', cookiesAfterInit.map(c => c.name).join(', '));
  
  const codeVerifierCookie = cookiesAfterInit.find(c => 
    c.name.includes('code-verifier') || c.name.includes('code_verifier')
  );
  
  if (codeVerifierCookie) {
    console.log('[Auth Google] ✅ Code verifier cookie set:', codeVerifierCookie.name);
  } else {
    console.warn('[Auth Google] ⚠️ Code verifier cookie NOT set!');
    console.warn('[Auth Google] Available cookies:', cookiesAfterInit.map(c => c.name).join(', '));
  }

  // Redirect to Google OAuth
  // The code verifier cookie should now be set in the response
  const response = NextResponse.redirect(data.url, { status: 302 });
  
  // Ensure cookies are preserved in the redirect response
  cookiesAfterInit.forEach((cookie) => {
    if (cookie.value) {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        secure: origin.startsWith('https'),
        domain: origin.includes('paydly.io') ? '.paydly.io' : undefined,
        httpOnly: cookie.name.includes('auth') || cookie.name.includes('sb-'),
      });
    }
  });

  return response;
}

