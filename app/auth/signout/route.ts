import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  // Sign out the user
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Sign Out] Error signing out:', error);
  }

  // Clear all Supabase auth cookies to ensure complete sign out
  const allCookies = cookieStore.getAll();
  const redirectResponse = NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  });

  // Clear all Supabase auth cookies
  allCookies.forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      redirectResponse.cookies.delete(cookie.name);
      redirectResponse.cookies.set(cookie.name, '', {
        path: '/',
        expires: new Date(0), // Set to past date to delete
        httpOnly: true,
        secure: request.nextUrl.protocol === 'https:',
        sameSite: 'lax',
      });
    }
  });

  console.log('[Sign Out] User signed out, cookies cleared');

  return redirectResponse;
}

