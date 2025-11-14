// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/database';

const PROTECTED_PATHS = ['/dashboard', '/invoices', '/settings', '/overdue', '/upcoming', '/templates'];
const AUTH_PATHS = ['/login', '/signup'];
const ALLOWED_FOR_EXPIRED = ['/billing', '/settings', '/auth/signout'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthRoute = AUTH_PATHS.includes(pathname);
  const isAllowedForExpired = ALLOWED_FOR_EXPIRED.some((path) => pathname.startsWith(path));

  // Redirect to login if not authenticated
  if (!session && isProtected) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check subscription status for protected paths
  if (session && isProtected && !isAllowedForExpired) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile) {
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
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/settings/:path*', '/billing/:path*', '/overdue/:path*', '/upcoming/:path*', '/templates/:path*', '/login', '/signup'],
};

