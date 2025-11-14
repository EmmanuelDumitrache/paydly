// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

import { buildAuthorizeUrl, generateState } from '@/lib/xero/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const redirectUri = `${origin}/api/xero/callback`;
  const state = `${user.id}:${generateState()}`;
  const authorizeUrl = buildAuthorizeUrl(state, redirectUri);

  console.log('[Xero Connect] Initiating OAuth for user:', user.id);
  console.log('[Xero Connect] State:', state.substring(0, 20) + '...');
  console.log('[Xero Connect] Redirect URI:', redirectUri);

  const response = NextResponse.redirect(authorizeUrl, { status: 302 });
  
  // Set cookie with proper domain handling for both www and non-www
  const cookieOptions: any = {
    path: '/',
    httpOnly: true,
    secure: origin.startsWith('https'),
    maxAge: 600, // 10 minutes
    sameSite: 'lax',
  };
  
  // Set domain to work with both www and non-www if on paydly.io
  if (origin.includes('paydly.io')) {
    cookieOptions.domain = '.paydly.io';
  }
  
  response.cookies.set('xero_oauth_state', state, cookieOptions);
  
  console.log('[Xero Connect] Cookie set with options:', {
    path: cookieOptions.path,
    domain: cookieOptions.domain,
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    maxAge: cookieOptions.maxAge,
  });

  return response;
}

