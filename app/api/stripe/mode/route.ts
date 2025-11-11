import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { resolveMode } from '@/lib/stripe/client';

const COOKIE_NAME = 'stripe_mode';

export async function GET() {
  const cookieStore = cookies();
  const current = cookieStore.get(COOKIE_NAME)?.value;
  const mode = resolveMode(current);

  return NextResponse.json({ mode });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const requestedMode = typeof body?.mode === 'string' ? body.mode : null;

  if (requestedMode !== 'test' && requestedMode !== 'live') {
    return NextResponse.json({ error: 'Invalid mode. Use "test" or "live".' }, { status: 400 });
  }

  const mode = resolveMode(requestedMode);
  const response = NextResponse.json({ mode });

  response.cookies.set(COOKIE_NAME, mode, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  console.log('[Stripe Mode API] Cookie set', {
    mode,
    cookieName: COOKIE_NAME,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}


