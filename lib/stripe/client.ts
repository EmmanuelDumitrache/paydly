import Stripe from 'stripe';

type StripeMode = 'live';

// Always use live mode
const MODE: StripeMode = 'live';

let client: Stripe | null = null;

function getSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY || undefined;
}

function getPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ID || undefined;
}

function getWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET || undefined;
}

export function resolveMode(): StripeMode {
  return MODE;
}

export function getStripeResources() {
  const secret = getSecretKey();
  const priceId = getPriceId();
  const webhookSecret = getWebhookSecret();

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Stripe] getStripeResources', {
      mode: MODE,
      hasSecret: Boolean(secret),
      hasPriceId: Boolean(priceId),
      hasWebhookSecret: Boolean(webhookSecret),
    });
  }

  if (!secret) {
    return { stripe: null as Stripe | null, priceId, webhookSecret };
  }

  if (!client) {
    client = new Stripe(secret, {
      apiVersion: '2023-10-16',
    });
  }

  return {
    stripe: client,
    priceId,
    webhookSecret,
  };
}

