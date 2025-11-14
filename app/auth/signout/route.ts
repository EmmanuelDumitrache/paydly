import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
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

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Sign Out] Error signing out:', error);
      // Continue anyway to clear cookies
    }

    // Get origin for redirect
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

    // Create redirect response with 303 status (See Other) for POST redirects
    const redirectUrl = new URL('/', origin);
    const redirectResponse = NextResponse.redirect(redirectUrl, {
      status: 303,
    });

    // Clear all Supabase auth cookies
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        redirectResponse.cookies.delete(cookie.name);
        redirectResponse.cookies.set(cookie.name, '', {
          path: '/',
          expires: new Date(0), // Set to past date to delete
          httpOnly: true,
          secure: redirectUrl.protocol === 'https:',
          sameSite: 'lax',
        });
      }
    });

    // Also clear any Xero OAuth state cookies
    const xeroStateCookie = cookieStore.get('xero_oauth_state');
    if (xeroStateCookie) {
      redirectResponse.cookies.delete('xero_oauth_state');
      redirectResponse.cookies.set('xero_oauth_state', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: redirectUrl.protocol === 'https:',
        sameSite: 'lax',
      });
    }

    console.log('[Sign Out] User signed out, cookies cleared');

    return redirectResponse;
  } catch (error) {
    console.error('[Sign Out] Unexpected error:', error);
    // Even if there's an error, redirect to home page
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
    return NextResponse.redirect(new URL('/', origin), {
      status: 303,
    });
  }
}

