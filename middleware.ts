import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/database';

const PROTECTED_PATHS = ['/dashboard', '/invoices', '/settings', '/billing'];
const AUTH_PATHS = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthRoute = AUTH_PATHS.includes(pathname);

  if (!session && isProtected) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/settings/:path*', '/billing/:path*', '/login', '/signup'],
};

