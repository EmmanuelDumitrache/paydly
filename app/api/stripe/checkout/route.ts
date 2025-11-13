// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { getStripeResources } from '@/lib/stripe/client';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stripe, priceId } = getStripeResources();

  console.log('[Stripe Checkout] Resources check', {
    hasStripeClient: Boolean(stripe),
    hasPriceId: Boolean(priceId),
    priceId: priceId ?? 'MISSING',
  });

  if (!stripe) {
    console.error('[Stripe Checkout] Missing Stripe secret');
    return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
  }

  if (!priceId) {
    console.error('[Stripe Checkout] Missing price ID');
    return NextResponse.json({ error: 'STRIPE_PRICE_ID not configured' }, { status: 500 });
  }

  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.email ?? user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create checkout session';
    console.error('[Stripe Checkout] Error creating session', {
      priceId,
      message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

