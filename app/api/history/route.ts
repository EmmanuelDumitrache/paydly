// app/api/history/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: emailHistory, error } = await supabase
    .from('email_history')
    .select('id, sent_at, reminder_type, send_method, recipient_email, status, error_message')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('[API /api/history] Error fetching email history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ emailHistory });
}
