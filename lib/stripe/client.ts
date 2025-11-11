import Stripe from 'stripe';

type StripeMode = 'live' | 'test';

const DEFAULT_MODE: StripeMode =
  (process.env.STRIPE_MODE === 'test' ? 'test' : 'live');

const clients: Partial<Record<StripeMode, Stripe>> = {};

function getSecretKey(mode: StripeMode): string | undefined {
  if (mode === 'test') {
    return process.env.STRIPE_TEST_SECRET_KEY || undefined;
  }
  return process.env.STRIPE_SECRET_KEY || undefined;
}

function getPriceId(mode: StripeMode): string | undefined {
  if (mode === 'test') {
    return process.env.STRIPE_TEST_PRICE_ID || undefined;
  }
  return process.env.STRIPE_PRICE_ID || undefined;
}

function getWebhookSecret(mode: StripeMode): string | undefined {
  if (mode === 'test') {
    return process.env.STRIPE_TEST_WEBHOOK_SECRET || undefined;
  }
  return process.env.STRIPE_WEBHOOK_SECRET || undefined;
}

export function resolveMode(
  override?: string | null | undefined
): StripeMode {
  if (override === 'test' || override === 'live') return override;
  return DEFAULT_MODE;
}

export function getStripeResources(mode: StripeMode) {
  const secret = getSecretKey(mode);
  const priceId = getPriceId(mode);
  const webhookSecret = getWebhookSecret(mode);

  if (!secret) {
    return { stripe: null as Stripe | null, priceId, webhookSecret };
  }

  if (!clients[mode]) {
    clients[mode] = new Stripe(secret, {
      apiVersion: '2023-10-16',
    });
  }

  return {
    stripe: clients[mode] ?? null,
    priceId,
    webhookSecret,
  };
}

