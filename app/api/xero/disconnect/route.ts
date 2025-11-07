import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      xero_access_token: null,
      xero_refresh_token: null,
      xero_token_expires_at: null,
      xero_tenant_id: null,
    })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ disconnected: true });
}

