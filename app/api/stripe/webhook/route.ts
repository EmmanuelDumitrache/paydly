// @ts-nocheck - Supabase generic types cause issues with type inference
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createServiceClient } from '@/lib/supabase/service';
import { getStripeResources } from '@/lib/stripe/client';

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
  const signature = headers().get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
  }

  let event: Stripe.Event | null = null;
  let mode: 'live' | 'test' | null = null;

  for (const candidate of ['live', 'test'] as const) {
    const { stripe, webhookSecret } = getStripeResources(candidate);
    if (!stripe || !webhookSecret) continue;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      mode = candidate;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Stripe Webhook] Signature verified', {
          attemptedMode: candidate,
          eventType: event.type,
        });
      }
      break;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Stripe Webhook] Signature verification failed for mode', {
          attemptedMode: candidate,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  if (!event || !mode) {
    console.error('[Stripe Webhook] Unable to verify signature for any mode');
    return NextResponse.json({ error: 'Invalid webhook signature for all configured Stripe modes' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      console.log('[Stripe Webhook] checkout.session.completed', { userId, customerId, mode: session.mode, resolvedMode: mode });

      if (userId && customerId) {
        // If mode is 'subscription', the subscription will be created and we'll get a separate event
        // For now, just save the customer ID
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_status: 'active', // Will be updated by subscription.created event
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        
        console.log('[Stripe Webhook] Updated profile with customer ID', { userId, customerId });
      }
      break;
    }
    
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
      
      console.log('[Stripe Webhook] customer.subscription.created', { 
        customerId, 
        status: subscription.status,
        trialEnd: subscription.trial_end,
        resolvedMode: mode,
      });

      if (customerId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: mapSubscriptionStatus(subscription.status),
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        console.log('[Stripe Webhook] Created subscription for customer', { customerId, status: subscription.status });
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      console.log('[Stripe Webhook] customer.subscription.updated', { 
        customerId, 
        status: subscription.status,
        trialEnd: subscription.trial_end,
        resolvedMode: mode,
      });

      if (customerId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: mapSubscriptionStatus(subscription.status),
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        console.log('[Stripe Webhook] Updated subscription for customer', { customerId, status: subscription.status });
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      console.log('[Stripe Webhook] customer.subscription.deleted', { customerId, resolvedMode: mode });

      if (customerId) {
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        console.log('[Stripe Webhook] Deleted subscription for customer', { customerId });
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      console.log('[Stripe Webhook] invoice.payment_failed', { customerId, invoiceId: invoice.id, resolvedMode: mode });

      if (customerId) {
        // Mark subscription as past_due
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        console.log('[Stripe Webhook] Payment failed for customer', { customerId });
      }
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      console.log('[Stripe Webhook] invoice.payment_succeeded', { customerId, invoiceId: invoice.id, resolvedMode: mode });

      if (customerId) {
        // If payment succeeded, ensure subscription is active
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        console.log('[Stripe Webhook] Payment succeeded for customer', { customerId });
      }
      break;
    }
    
    default:
      console.log('[Stripe Webhook] Unhandled event type:', event.type, { resolvedMode: mode });
      break;
  }

  return NextResponse.json({ received: true });
}

