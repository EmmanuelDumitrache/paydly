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

  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    // Get current pause status
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('reminders_paused')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Toggle the pause status
    const newPausedStatus = !invoice.reminders_paused;

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ reminders_paused: newPausedStatus })
      .eq('id', invoiceId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      paused: newPausedStatus,
    });
  } catch (error) {
    console.error('[Toggle Pause] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle pause status' },
      { status: 500 }
    );
  }
}

