import Stripe from 'stripe';

// Support both test and live modes
const STRIPE_MODE = process.env.STRIPE_MODE || 'live';
const STRIPE_SECRET_KEY = 
  STRIPE_MODE === 'test' 
    ? process.env.STRIPE_TEST_SECRET_KEY 
    : process.env.STRIPE_SECRET_KEY;

// Only initialize Stripe if the key is available
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

// Helper to get the correct price ID based on mode
export function getStripePriceId(): string | undefined {
  return STRIPE_MODE === 'test'
    ? process.env.STRIPE_TEST_PRICE_ID
    : process.env.STRIPE_PRICE_ID;
}

// Helper to get the correct webhook secret based on mode
export function getStripeWebhookSecret(): string | undefined {
  return STRIPE_MODE === 'test'
    ? process.env.STRIPE_TEST_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET;
}

