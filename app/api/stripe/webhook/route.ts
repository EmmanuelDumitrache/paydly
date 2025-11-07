import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createServiceClient } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe/client';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function mapSubscriptionStatus(status: Stripe.Subscription.Status): 'active' | 'trialing' | 'cancelled' | 'past_due' {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'incomplete':
    case 'incomplete_expired':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    default:
      return 'active';
  }
}

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  const signature = headers().get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (userId && customerId) {
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_status: 'active',
          })
          .eq('id', userId);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      if (customerId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: mapSubscriptionStatus(subscription.status),
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          })
          .eq('stripe_customer_id', customerId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      if (customerId) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', customerId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

