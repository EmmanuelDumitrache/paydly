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

  const formData = await request.formData();
  const paused = formData.get('paused') === 'true';

  const updates: any = {
    reminders_globally_paused: paused,
  };

  // If pausing, record the timestamp in updated_at
  // (we don't have a separate paused_since field, but updated_at can serve this purpose)

  const { error } = await supabase
    .from('reminder_settings')
    .upsert(
      {
        user_id: user.id,
        ...updates,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[Global Pause] Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }

  return NextResponse.json({ success: true, paused });
}

