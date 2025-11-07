# Paydly Implementation Blueprint

## 1. Product Overview

- **Tagline**: “Get paid faster. Automate invoice reminders.”
- **Target user**: Freelancers and small service businesses (1–20 clients) using Xero who dislike chasing late payments.
- **Core value**: Connect Xero once and let Paydly automatically email overdue clients at 7, 14 and 21 days.

## 2. Architecture Summary

| Concern | Implementation |
| --- | --- |
| Frontend | Next.js 14 App Router + TypeScript + Tailwind |
| Auth & Data | Supabase (PostgreSQL + Auth) |
| Integrations | Xero API (OAuth 2.0), Stripe, Resend |
| Background jobs | Vercel Cron invoking `/api/cron/check-invoices` |
| Hosting | Vercel (includes analytics + edge cron) |

### Directory Structure

```
app/
  (auth)/login, signup
  (dashboard)/dashboard, invoices, settings, billing
  api/… (auth callback, xero, invoices, reminders, cron, stripe)
components/
  landing/, dashboard/, shared/, auth/
lib/
  supabase/, xero/, email/, reminders/, data/, stripe/
types/
supabase/migrations/
docs/
```

### Key Modules

- `lib/supabase` – browser/server/service clients (service uses service-role key for cron/webhooks)
- `lib/xero` – OAuth helpers, invoice fetchers, token refresh
- `lib/email` – reminder templates and Resend sender
- `lib/reminders/utils` – reminder scheduling helpers shared by cron/manual APIs
- `lib/data` – reusable data loaders for dashboard & invoices
- API routes implement all external workflows (Xero connect/callback/sync, manual reminders, pause, cron, Stripe checkout/portal/webhook)

## 3. Data Model

Tables are defined in `supabase/migrations/001_initial_schema.sql` with RLS enabling per-user isolation.

- `profiles` – mirrors `auth.users` with Xero tokens, Stripe metadata, trial fields
- `invoices` – synced from Xero (stores `amount_due`, `total_amount`, `days_overdue`, reminder metadata)
- `reminder_logs` – audit trail of every reminder attempt
- `reminder_settings` – per-user toggles/templates for 7/14/21 cadence

Trigger `handle_new_user` auto-seeds `profiles` and `reminder_settings` entries when a Supabase auth user is created.

## 4. Environment Configuration

See `docs/environment.md` for detailed variable list. Critical values:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Xero: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Resend: `RESEND_API_KEY`, optional `RESEND_FROM_EMAIL`
- Cron: `CRON_SECRET`
- URLs: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_URL`

## 5. API Surface

### Xero
- `POST /api/xero/connect` – start OAuth, set state cookie
- `GET /api/xero/callback` – exchange code, fetch tenant, persist tokens
- `POST /api/xero/sync` – refresh token if needed and upsert open invoices
- `POST /api/xero/disconnect` – clear stored credentials

### Invoices & Reminders
- `GET /api/invoices` – paginated list with status/search filters
- `POST /api/reminders/send` – manual reminder trigger
- `POST /api/reminders/pause` – pause/resume invoice reminders
- `GET /api/cron/check-invoices` – secured by `CRON_SECRET`, sends daily reminders via Resend

### Stripe
- `POST /api/stripe/checkout` – create subscription checkout session
- `POST /api/billing/portal` – billing portal redirect
- `POST /api/stripe/webhook` – reconcile checkout + subscription lifecycle events

### Auth
- Supabase Auth handles signup/login in `app/(auth)` routes. Middleware enforces access to dashboard/invoices/settings/billing.

## 6. Frontend Pages

- Landing (`/`) – hero, problem, how-it-works, features, social proof, pricing, CTA
- Dashboard (`/dashboard`) – stats, Xero status, recent invoices, upcoming reminders, trial upgrade CTA
- Invoices (`/invoices`) – filters (all/overdue/paid), search, paginated table, action buttons (pause/view in Xero/mark paid placeholder)
- Settings (`/settings`) – Xero connection, schedule toggles, account form, billing controls, template placeholder
- Billing (`/billing`) – simple placeholder redirecting to settings portal
- Auth (`/login`, `/signup`) – forms using Supabase browser client

## 7. Background Jobs

- Vercel cron (configured in `vercel.json`) hits `/api/cron/check-invoices` daily at 09:00 UTC. Endpoint verifies `authorization: Bearer ${CRON_SECRET}` and processes all active/trial users sequentially.

## 8. Deployment Workflow

1. Create Supabase project, run migrations (`npx supabase db push`).
2. Configure Xero OAuth app redirect to `{APP_URL}/api/xero/callback`.
3. Create Stripe product + price, webhook to `{APP_URL}/api/stripe/webhook`.
4. Provision Resend sender domain.
5. Set all env vars in Vercel (and Supabase edge functions if needed).
6. Deploy via Vercel (`vercel --prod`).
7. Configure Vercel cron + Stripe webhook secret.
8. Smoke test flows: signup, Xero connect, sync, reminder send (manual + cron), Stripe upgrade, billing portal.

## 9. Testing & QA

- Manual smoke tests per critical flow
- `npm run lint` for static analysis
- For full E2E coverage, integrate Playwright/Cypress scenarios (future work).
- Use Supabase test data or seed script (to be added) for local fixtures.

## 10. Go-To-Market Snapshot

- **Week 1**: warm network outreach (20 freelancers)
- **Week 1**: Reddit posts (`r/freelance`, `r/Entrepreneur`)
- **Week 1**: Twitter thread highlighting late payment problem & product screenshots
- **Week 2**: LinkedIn DMs (50 consultants)
- **Week 3-4**: Content marketing (blog post, Indie Hackers, Slack communities)

Success metrics to monitor post-launch: signup→Xero connect rate (>60%), trial→paid conversion (>30%), retention (>80% at month 2), reminders sent per user (5–15/month), average invoices per user (~10).

## 11. Backlog & Future Enhancements

- Custom reminder template editor
- Pause/reminder actions from UI (with optimistic updates)
- Advanced analytics (late payment cohorts, trends)
- Additional integrations (QuickBooks, email providers)
- Multi-user/team access
- SMS/WhatsApp reminders

---

This document stays as the canonical reference for Paydly’s MVP scope, architecture, and deployment checklists. Update it whenever features ship or roadmap priorities shift.

