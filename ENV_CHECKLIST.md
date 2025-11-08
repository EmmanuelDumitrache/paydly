# Environment Variables Checklist

Please verify your `.env.local` file contains all these values:

## ✅ Required for Core Features

```bash
# Supabase (YOU HAVE THESE)
NEXT_PUBLIC_SUPABASE_URL=https://xsvuqporgkddggmkasgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdnVxcG9yZ2tkZGdnbWthc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Nzk4NjIsImV4cCI6MjA3ODA1NTg2Mn0.y9PolcIpMzzllw-pN7AQI5v5J3Fd24LInRbsWCcdk34
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdnVxcG9yZ2tkZGdnbWthc2doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ3OTg2MiwiZXhwIjoyMDc4MDU1ODYyfQ._OZKclzlKHCm4Ka-CnBmjQmBz0zNloRFFfM3DtR8hFk

# Xero OAuth (YOU HAVE THESE)
XERO_CLIENT_ID=12EF2070063F4194838337701C78E4A0
XERO_CLIENT_SECRET=DaIBVTZhqVsRfRpC2wAgh68lUVcTQHYj4mGLsBDbrrm2A_G5

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000

# ⚠️ ACTION NEEDED: Resend Email
# You mentioned you have Resend credentials - please add them:
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=Paydly Reminders <reminders@yourdomain.com>

# ⚠️ ACTION NEEDED: Cron Secret
# Generate a random string for securing the cron endpoint:
# You can use: openssl rand -base64 32
CRON_SECRET=your_random_string_here
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

