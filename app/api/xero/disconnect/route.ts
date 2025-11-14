// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

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

  const { error } = await supabase
    .from('profiles')
    .update({
      xero_access_token: null,
      xero_refresh_token: null,
      xero_token_expires_at: null,
      xero_tenant_id: null,
      xero_tenant_name: null,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[Xero Disconnect] Error:', error);
    return NextResponse.redirect(`${origin}/settings?xero=disconnect_failed&details=${encodeURIComponent('Failed to disconnect Xero. Please try again.')}`);
  }

  console.log('[Xero Disconnect] Successfully disconnected Xero for user:', user.id);
  
  // Redirect to settings with success message
  return NextResponse.redirect(`${origin}/settings?xero=disconnected`);
}

