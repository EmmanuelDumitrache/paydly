// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkActiveSubscription } from '@/lib/auth/subscription';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has active subscription
  const profile = await checkActiveSubscription(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
  }

  const formData = await request.formData();
  const day1 = parseInt(formData.get('day_1') as string);
  const day2 = parseInt(formData.get('day_2') as string);
  const day3 = parseInt(formData.get('day_3') as string);

  // Validate
  if (isNaN(day1) || day1 < 1 || day1 > 90) {
    return NextResponse.json({ error: 'First reminder must be between 1-90 days' }, { status: 400 });
  }
  if (isNaN(day2) || day2 < 1 || day2 > 90) {
    return NextResponse.json({ error: 'Second reminder must be between 1-90 days' }, { status: 400 });
  }
  if (isNaN(day3) || day3 < 1 || day3 > 90) {
    return NextResponse.json({ error: 'Third reminder must be between 1-90 days' }, { status: 400 });
  }
  if (day2 <= day1) {
    return NextResponse.json({ error: 'Second reminder must be after first reminder' }, { status: 400 });
  }
  if (day3 <= day2) {
    return NextResponse.json({ error: 'Third reminder must be after second reminder' }, { status: 400 });
  }

  const customIntervals = {
    day_1: day1,
    day_2: day2,
    day_3: day3,
  };

  const { error } = await supabase
    .from('reminder_settings')
    .upsert(
      {
        user_id: user.id,
        custom_intervals: customIntervals,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[Custom Intervals] Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update intervals' }, { status: 500 });
  }

  return NextResponse.json({ success: true, customIntervals });
}

