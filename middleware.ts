// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

const PROTECTED_PATHS = ['/dashboard', '/invoices', '/settings', '/overdue', '/upcoming', '/templates'];
const AUTH_PATHS = ['/login', '/signup'];
const ALLOWED_FOR_EXPIRED = ['/billing', '/settings', '/auth/signout'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In demo mode or if Supabase is not configured, allow browsing demo dashboard
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo')) {
    return response;
  }
  
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, {
            ...options,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? request.nextUrl.protocol === 'https:',
          });
        });
      },
    },
  });
  
  // Get session - this will refresh if needed
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthRoute = AUTH_PATHS.includes(pathname);
  const isAllowedForExpired = ALLOWED_FOR_EXPIRED.some((path) => pathname.startsWith(path));

  // Log session errors for debugging (only in non-production if needed)
  if (sessionError) {
    console.error('[Middleware] Session error:', sessionError.message);
  }

  // Redirect to login if not authenticated
  if (!session && isProtected) {
    // Don't redirect if already on login page (avoid redirect loops)
    if (pathname !== '/login') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check subscription status for protected paths
  if (session && isProtected && !isAllowedForExpired) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', session.user.id)
      .maybeSingle();

    // If there's an error getting the profile, log it but don't block access
    // This prevents issues with OAuth users who might have timing issues with profile creation
    if (profileError) {
      console.error('[Middleware] Profile fetch error:', profileError.message);
      // Continue - don't block access if we can't fetch profile
    } else if (profile) {
      // Check if trial has expired
      if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
        const trialEndsAt = new Date(profile.trial_ends_at);
        const now = new Date();
        
        if (now > trialEndsAt) {
          // Trial has expired, update status
          await supabase
            .from('profiles')
            .update({ subscription_status: 'expired' })
            .eq('id', session.user.id);
          
          // Redirect to billing
          const redirectUrl = new URL('/billing', request.url);
          redirectUrl.searchParams.set('access', 'expired');
          return NextResponse.redirect(redirectUrl);
        }
      }

      // Block access if subscription is expired or past_due
      if (profile.subscription_status === 'expired' || profile.subscription_status === 'past_due') {
        const redirectUrl = new URL('/billing', request.url);
        redirectUrl.searchParams.set('access', 'blocked');
        return NextResponse.redirect(redirectUrl);
      }
    }
    // If no profile exists, allow access (let the app handle profile creation)
  }

  // Redirect authenticated users from landing page to dashboard
  // This handles cases where OAuth redirects to Site URL instead of callback
  if (session && pathname === '/') {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/settings/:path*', '/billing/:path*', '/overdue/:path*', '/upcoming/:path*', '/templates/:path*', '/login', '/signup', '/'],
};

