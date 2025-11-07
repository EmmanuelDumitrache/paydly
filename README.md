# Paydly

> Automate invoice reminders for freelancers and small service businesses. Connect Xero once and Paydly sends polite nudges at 7/14/21 days overdue so you get paid faster.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- Supabase (PostgreSQL + Auth)
- Xero API (OAuth 2.0) for invoice sync
- Resend for transactional email delivery
- Stripe for subscriptions
- Vercel for hosting, cron, and analytics

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn/bun) and Git
- Supabase project & CLI (for running migrations)
- Xero developer account + connected test organisation
- Resend account with verified sender domain
- Stripe account with subscription product & price

Refer to `docs/environment.md` for the full list of required environment variables.

## Local Setup

```bash
git clone <repo>
cd paydly

# install dependencies
npm install

# copy env template & populate secrets
cp docs/environment.md .env.local  # or copy values manually

# run initial Supabase migration
npx supabase db push

# start dev server
npm run dev
```

Visit `http://localhost:3000` to view the landing page. Auth, dashboard, invoices, reminder settings, and billing routes are all available under the `/dashboard` group.

## Available Scripts

- `npm run dev` – local development
- `npm run build` – production build
- `npm run start` – start production server locally
- `npm run lint` – run ESLint over the codebase

## Key Workflows

- **Auth** – Supabase Auth handles email/password sign up and login. New accounts are placed on a 14-day trial automatically.
- **Xero Integration** – `/api/xero/connect` launches OAuth, `/api/xero/callback` stores tokens, and `/api/xero/sync` upserts invoices. Tokens refresh automatically when expired.
- **Reminders** – `/api/cron/check-invoices` (secured with `CRON_SECRET`) finds overdue invoices, renders the appropriate template, sends via Resend, logs history, and increments reminder counts.
- **Billing** – Stripe Checkout (`/api/stripe/checkout`), billing portal (`/api/billing/portal`), and webhooks (`/api/stripe/webhook`) keep `profiles.subscription_status` in sync.

## Deployment Checklist

1. Create a Vercel project and link the repository.
2. Add all environment variables (Supabase, Xero, Resend, Stripe, Cron secret) in Vercel settings.
3. Upload the `vercel.json` cron configuration.
4. Configure the Stripe webhook endpoint (`/api/stripe/webhook`) with the signing secret.
5. Generate a Vercel cron token and set `CRON_SECRET` both locally and in Vercel.
6. Deploy (`vercel --prod`) and verify:
   - Supabase auth + dashboard access
   - Xero connect, sync, and reminder scheduling
   - Resend emails landing inboxes
   - Stripe checkout and billing portal flows

## Additional Documentation

- `docs/environment.md` – environment variable reference
- `docs/paydly-implementation-plan.md` – implementation roadmap and architecture summary (created separately)

## License

Proprietary – internal use for Paydly MVP development.
