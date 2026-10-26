# Paydly

> Automated invoice reminders for freelancers and small service businesses. Connect Xero once and Paydly sends polite nudges at 7, 14, and 21 days overdue so you get paid faster.

## 🚀 Quick Start (Demo Mode)

The app includes an **interactive demo mode with mock data** so you can run and evaluate the full user experience locally without setting up external accounts (Supabase, Xero, Resend, or Stripe):

```bash
# 1. Clone repository
git clone https://github.com/EmmanuelDumitrache/paydly.git
cd paydly

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to see the landing page, or click **"Live Demo"** in the navigation header / **"Explore Live Demo"** on the hero to access the interactive dashboard, invoices list, and settings.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security + Auth)
- **Accounting Integration**: Xero API (OAuth 2.0 + automated token refresh)
- **Email Delivery**: Resend (escalating 7/14/21-day transactional reminders)
- **Subscriptions & Billing**: Stripe Checkout & Customer Portal
- **Hosting & Automation**: Vercel (Edge Middleware + Vercel Cron)

---

## Key Workflows & Architecture

- **Interactive Dashboard (`/dashboard`)**
  - Displays real-time summary cards: overdue invoice count, total overdue amount, reminders sent this month, and money recovered.
  - Quick-action shortcuts to overdue invoices and scheduled upcoming reminders.

- **Invoice Management (`/invoices`, `/overdue`, `/upcoming`)**
  - Filter by status (All / Overdue / Paid) and search by invoice number or client name.
  - Per-invoice reminder pause toggle if a client has requested a payment extension.

- **Automated Reminder Cron (`/api/cron/check-invoices`)**
  - Configured via `vercel.json` to execute daily.
  - Scans active user accounts with connected Xero tenants, finds overdue invoices matching reminder thresholds (7, 14, or 21 days), renders personalized email templates, dispatches via Resend, and records entries in `reminder_logs` to prevent duplicate sends on the same day.
  - Protected with Bearer token authentication (`CRON_SECRET`).

- **Xero OAuth 2.0 Integration (`/api/xero/*`)**
  - `/api/xero/connect` initiates the OAuth flow with required scopes.
  - `/api/xero/callback` exchanges authorization codes for access and refresh tokens, identifies the tenant, and triggers an initial automatic invoice sync.
  - `/api/xero/sync` pulls unpaid invoices with status `AUTHORISED` and `AmountDue > 0`.
  - Token refresh helpers automatically renew expired access tokens before API calls.

- **Settings & Preferences (`/settings`)**
  - Custom reminder intervals: customize or toggle 7, 14, and 21-day triggers.
  - Global pause switch: temporarily halt all automated reminders across all invoices.

---

## Production / Live Setup (With Real Services)

To connect your own live databases and third-party APIs:

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `XERO_CLIENT_ID` & `XERO_CLIENT_SECRET`
- `RESEND_API_KEY` & `RESEND_FROM_EMAIL`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 2. Database Migration
Apply the initial schema to your Supabase project:
- In Supabase Dashboard: go to **SQL Editor** → run `supabase/migrations/001_initial_schema.sql`.

### 3. Deploying to Vercel
1. Import `EmmanuelDumitrache/paydly` in your Vercel Dashboard.
2. Add your environment variables in **Project Settings → Environment Variables**.
3. In your Xero Developer Portal, add your production callback URL:
   `https://<your-project>.vercel.app/api/xero/callback`
4. Deploy! Vercel automatically schedules the daily reminder cron specified in `vercel.json`.

---

## Available Scripts

- `npm run dev` — Run local development server
- `npm run build` — Build production application
- `npm run start` — Run production server locally
- `npm run lint` — Run ESLint checks

---

## License

MIT
