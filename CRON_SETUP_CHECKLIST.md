# Cron & Auto-Sync Setup Checklist

## ✅ CRON_SECRET
- [x] Set in Vercel: `your_cron_secret_here`

## Required Environment Variables in Vercel

### 1. Supabase (Required for database access)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for cron to access database)

### 2. Xero (Required for invoice syncing)
- [ ] `XERO_CLIENT_ID` - From Xero developer portal
- [ ] `XERO_CLIENT_SECRET` - From Xero developer portal

### 3. Resend (Required for sending reminder emails)
- [ ] `RESEND_API_KEY` - Get from https://resend.com/api-keys
- [ ] `RESEND_FROM_EMAIL` - Your verified sender email (e.g., `reminders@yourdomain.com`)

### 4. Application URL
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://www.paydly.io`)

## Database Setup

### 1. Run Migrations
- [ ] Run `002_reminder_system_improvements.sql` to create `cron_runs` table
- [ ] Run `004_reminder_usage.sql` to create `increment_reminder_send_count` function

### 2. Verify Tables Exist
In Supabase Table Editor, verify these tables exist:
- [ ] `cron_runs` - For logging cron executions
- [ ] `profiles` - User data with Xero tokens
- [ ] `invoices` - Synced invoices
- [ ] `reminder_logs` - Reminder email history
- [ ] `reminder_settings` - User reminder preferences

## Vercel Configuration

### 1. Cron Job
- [x] `vercel.json` configured with schedule `0 0 * * *` (midnight UTC daily)
- [x] Path: `/api/cron/check-invoices`

### 2. Environment Variables
- [ ] All required variables set in Vercel dashboard
- [ ] Variables set for Production environment (not just Preview)

## Testing

### 1. Manual Cron Test
Test the cron endpoint manually:
```bash
curl -X GET https://www.paydly.io/api/cron/check-invoices \
  -H "Authorization: Bearer your_cron_secret_here"
```

Expected response:
```json
{
  "remindersSent": 0,
  "remindersFailed": 0,
  "invoicesSynced": 0,
  "syncsFailed": 0,
  "usersProcessed": 0
}
```

### 2. Verify Cron Runs
After first cron execution (or manual test):
1. Go to Supabase → Table Editor → `cron_runs`
2. Should see a new row with:
   - `status: 'success'` or `'running'`
   - `started_at: [timestamp]`
   - `users_processed: [number]`

### 3. Check Logs
In Vercel dashboard:
1. Go to Functions → Cron Jobs
2. Click on `/api/cron/check-invoices`
3. Check execution logs for any errors

## What Happens Automatically

Once everything is configured:

1. **Daily at Midnight UTC:**
   - Vercel triggers `/api/cron/check-invoices`
   - Cron authenticates with `CRON_SECRET`
   - Fetches all active users with Xero connected
   - For each user:
     - Syncs invoices from Xero
     - Refreshes expired tokens
     - Sends reminders for overdue invoices
   - Logs everything to `cron_runs` table

2. **No User Action Required:**
   - Users don't need to log in
   - Everything runs server-side automatically
   - Works for all active/trial users simultaneously

## Troubleshooting

### Cron Not Running
- Check Vercel → Functions → Cron Jobs for execution history
- Verify `vercel.json` is deployed
- Check Vercel logs for errors

### "Unauthorized" Error
- Verify `CRON_SECRET` in Vercel matches the one in code
- Check Authorization header format: `Bearer [secret]`

### "RESEND_API_KEY is not configured"
- Add `RESEND_API_KEY` to Vercel environment variables
- Verify Resend API key is valid

### "Xero is not connected"
- User needs to connect Xero via OAuth first
- Check `profiles.xero_tenant_id` is not null

### No Reminders Sent
- Check if user has overdue invoices
- Verify `reminder_settings` exist for user
- Check if reminders are globally paused
- Verify trial hasn't expired (for trial users)

