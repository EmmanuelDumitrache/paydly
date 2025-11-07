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

  const body = await request.json().catch(() => null);
  const invoiceId = body?.invoice_id as string | undefined;
  const paused = body?.paused as boolean | undefined;

  if (!invoiceId || typeof paused !== 'boolean') {
    return NextResponse.json({ error: 'invoice_id and paused flag are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('invoices')
    .update({ reminders_paused: paused })
    .eq('id', invoiceId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

