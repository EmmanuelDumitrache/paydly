# Environment Variables

Copy these variables into your local `.env.local` and configure production settings before deploying.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Xero OAuth
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=

# Application URLs
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_URL=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL="Paydly Reminders <reminders@paydly.com>"

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cron
CRON_SECRET=

# Analytics
VERCEL_ANALYTICS_ID= # optional, managed by Vercel
```

