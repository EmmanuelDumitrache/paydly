// @ts-nocheck - Supabase generic types cause issues with type inference
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { exchangeCodeForTokens, fetchConnections } from '@/lib/xero/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/settings?xero=error`);
  }

  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code || !stateParam) {
    return NextResponse.redirect(`${origin}/settings?xero=missing_params`);
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get('xero_oauth_state')?.value;

  if (!storedState || storedState !== stateParam) {
    return NextResponse.redirect(`${origin}/settings?xero=invalid_state`);
  }

  const [userId] = stateParam.split(':');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${origin}/login`);
  }

  try {
    const redirectUri = `${origin}/api/xero/callback`;
    const tokenResponse = await exchangeCodeForTokens(code, redirectUri);
    const connections = await fetchConnections(tokenResponse.access_token);

    if (!connections.length) {
      throw new Error('No Xero connections returned');
    }

    const tenant = connections[0];
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xero_access_token: tokenResponse.access_token,
        xero_refresh_token: tokenResponse.refresh_token,
        xero_token_expires_at: expiresAt,
        xero_tenant_id: tenant.tenantId,
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    const response = NextResponse.redirect(`${origin}/dashboard?xero=connected`);
    response.cookies.set('xero_oauth_state', '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (callbackError) {
    const response = NextResponse.redirect(`${origin}/settings?xero=failed`);
    response.cookies.set('xero_oauth_state', '', {
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}

