// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

import { createRouteClient } from '@/lib/supabase/route';
import { getStripeResources } from '@/lib/stripe/client';

export async function POST(request: Request) {
  const supabase = createRouteClient();
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

  let customerId = profile?.stripe_customer_id ?? null;
  const customerEmail = profile?.email ?? user.email;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error) {
      console.warn('[Stripe Checkout] Stored customer not found, clearing and retrying', {
        customerId,
        message: error instanceof Error ? error.message : error,
      });
      await supabase.from('profiles').update({ stripe_customer_id: null }).eq('id', user.id);
      customerId = null;
    }
  }

  const sessionParams: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
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
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = customerEmail;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create checkout session';
    console.error('[Stripe Checkout] Error creating session', {
      priceId,
      message,
    });

    if (customerId && (error as any)?.code === 'resource_missing') {
      console.log('[Stripe Checkout] Retrying without stored customer');
      await supabase.from('profiles').update({ stripe_customer_id: null }).eq('id', user.id);
      const fallbackParams = { ...sessionParams };
      delete fallbackParams.customer;
      fallbackParams.customer_email = customerEmail;

      const fallbackSession = await stripe.checkout.sessions.create(fallbackParams);
      return NextResponse.json({ url: fallbackSession.url });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

