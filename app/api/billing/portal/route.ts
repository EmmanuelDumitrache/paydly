// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { createClient } from '@/lib/supabase/server';
import { getStripeResources, resolveMode } from '@/lib/stripe/client';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieStore = cookies();
  const modeCookie = cookieStore.get('stripe_mode')?.value;
  const mode = resolveMode(modeCookie);

  const { stripe } = getStripeResources(mode);

  if (!stripe) {
    console.error('[Billing Portal] Missing Stripe client for mode', mode);
    return NextResponse.json({ error: 'Stripe not configured for selected mode' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer on file' }, { status: 400 });
  }

  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create billing portal session';
    console.error('[Billing Portal] Error creating session', { mode, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

