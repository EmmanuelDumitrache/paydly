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

  const response = NextResponse.redirect(authorizeUrl, { status: 302 });
  response.cookies.set('xero_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: origin.startsWith('https'),
    maxAge: 600,
    sameSite: 'lax',
  });

  return response;
}

