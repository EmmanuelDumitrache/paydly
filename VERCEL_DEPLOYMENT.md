# Vercel Deployment Guide

## 🚀 Deploy Paydly to Production

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your repository: `EmmanuelDumitrache/paydlyprivate`
5. Click **"Import"**

### Step 2: Configure Project Settings

On the import screen:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add each of these:

#### Required for Core Features

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xsvuqporgkddggmkasgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdnVxcG9yZ2tkZGdnbWthc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Nzk4NjIsImV4cCI6MjA3ODA1NTg2Mn0.y9PolcIpMzzllw-pN7AQI5v5J3Fd24LInRbsWCcdk34
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdnVxcG9yZ2tkZGdnbWthc2doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ3OTg2MiwiZXhwIjoyMDc4MDU1ODYyfQ._OZKclzlKHCm4Ka-CnBmjQmBz0zNloRFFfM3DtR8hFk

# Xero OAuth
XERO_CLIENT_ID=12EF2070063F4194838337701C78E4A0
XERO_CLIENT_SECRET=DaIBVTZhqVsRfRpC2wAgh68lUVcTQHYj4mGLsBDbrrm2A_G5

# App URLs (CHANGE TO YOUR PRODUCTION DOMAIN)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_URL=https://your-app.vercel.app

# Resend Email
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Paydly Reminders <reminders@yourdomain.com>

# Cron Secret (use the same one from .env.local or generate a new one)
CRON_SECRET=your_cron_secret_here
```

#### Optional (Can Add Later)

```bash
# Stripe - Skip for MVP
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Important Notes:**
- ✅ Make sure to **update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_URL`** to your actual Vercel domain
- ✅ You'll get the domain after deployment (e.g., `paydly.vercel.app`)
- ✅ You can update these variables later in Project Settings → Environment Variables

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. You'll see: ✅ **"Deployment successful"**
4. Copy your production URL (e.g., `https://paydly.vercel.app`)

### Step 5: Update Environment Variables

1. Go to **Project Settings** → **Environment Variables**
2. Edit `NEXT_PUBLIC_APP_URL` → Set to your production URL
3. Edit `NEXT_PUBLIC_URL` → Set to your production URL
4. Click **"Save"**
5. Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

### Step 6: Update Xero Redirect URIs

1. Go to https://developer.xero.com/app/manage
2. Select your app
3. Add Redirect URI: `https://your-production-url.vercel.app/api/xero/callback`
4. Save

### Step 7: Verify Cron Job

1. In Vercel dashboard, go to your project
2. Click **Cron Jobs** (or **Functions** tab)
3. You should see: `/api/cron/check-invoices` scheduled for `0 9 * * *` (9am daily)
4. Vercel will automatically call this endpoint every day

**Note**: Cron jobs on Vercel only run on the production branch (not preview deployments).

### Step 8: Test Production Deployment

1. Visit your production URL
2. Sign up for a new account
3. Connect Xero account
4. Sync invoices
5. Check dashboard for real data
6. Test manual reminder (via API)
7. Wait 24 hours and verify cron job ran (check Vercel logs)

---

## 📊 Monitoring & Logs

### Vercel Logs
- Go to **Deployments** → Click on a deployment → **"View Function Logs"**
- See all API calls, errors, and cron job executions

### Supabase Logs
- https://xsvuqporgkddggmkasgh.supabase.co → **Logs**
- Monitor database queries, RLS policy checks, errors

### Resend Dashboard
- https://resend.com/emails
- Track all sent emails, delivery status, opens, clicks

---

## 🔄 Continuous Deployment

Vercel is now watching your GitHub repository. Every time you push to `main`:

1. Vercel automatically detects the push
2. Builds the updated code
3. Deploys to production
4. Takes ~2-3 minutes

**Preview Deployments**: Every pull request gets its own preview URL for testing.

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `NODE_VERSION` if specified

### Cron Job Not Running
- Cron only works on production domain (not preview)
- Check **Functions** tab for cron configuration
- Verify `CRON_SECRET` is set correctly
- Check function logs for errors

### Xero OAuth Fails
- Verify redirect URI is added in Xero app settings
- Must match exactly: `https://your-domain.vercel.app/api/xero/callback`
- Check `XERO_CLIENT_ID` and `XERO_CLIENT_SECRET`

### Emails Not Sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- Ensure sender email is verified in Resend

### Database Errors
- Check Supabase logs for RLS policy issues
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure tables exist (run migration if needed)

---

## 🎉 You're Live!

Once deployed, you have a production-ready B2B SaaS application that:

✅ Syncs invoices from Xero  
✅ Sends automated email reminders  
✅ Runs on autopilot with cron jobs  
✅ Provides real-time dashboard  
✅ Accepts new user signups with 14-day trials  

**Next Steps:**
1. Share with first beta customers
2. Collect feedback
3. Monitor logs for errors
4. Iterate and improve

**Domain Setup (Optional):**
- Go to Vercel → Project Settings → Domains
- Add your custom domain (e.g., `paydly.com`)
- Update DNS records as instructed
- Update env vars with new domain

---

## 📞 Support

If you encounter issues:

1. Check **Vercel Logs** (Deployments → Function Logs)
2. Check **Supabase Logs** (Database → Logs)
3. Check **Resend Dashboard** (for email delivery)
4. Review `TESTING_GUIDE.md` for feature-specific tests

---

**Status**: ✅ Ready to deploy  
**Est. Time**: 10 minutes  
**Cost**: Free (Vercel Hobby plan + Supabase Free tier + Resend Free tier)

