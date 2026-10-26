# Environment Variables Checklist

Please verify your `.env.local` file contains all these values:

## ✅ Required for Core Features

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Xero OAuth
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL="Paydly Reminders <reminders@yourdomain.com>"

# Cron Secret
CRON_SECRET=your_cron_secret_here
```

## 🔵 Optional (Skip for MVP)

```bash
# Stripe - Not needed for MVP, can add later
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Action Items

1. **Add Resend API Key**: 
   - Get your key from https://resend.com/api-keys
   - Add to `RESEND_API_KEY` in `.env.local`
   - Set your from email address in `RESEND_FROM_EMAIL`

2. **Generate Cron Secret**:
   - Run: `openssl rand -base64 32`
   - Add result to `CRON_SECRET` in `.env.local`

3. **Verify File**: Open `.env.local` and confirm all required variables are set

Once complete, restart the dev server: `npm run dev`

