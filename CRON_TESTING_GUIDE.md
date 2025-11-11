# Cron Job Testing Guide

This guide walks you through testing the automated invoice reminder cron job before launch.

---

## ✅ Pre-Flight Checklist

### 1. Verify Configuration

**Cron Schedule (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-invoices",
      "schedule": "0 9 * * *"  // Daily at 9:00 AM UTC (7:00 PM AEST in summer, 8:00 PM AEDT in winter)
    }
  ]
}
```

⚠️ **Note:** Vercel cron uses UTC time. `0 9 * * *` = 9:00 AM UTC.
- **AEST (UTC+10):** 9:00 AM UTC = 7:00 PM AEST
- **AEDT (UTC+11):** 9:00 AM UTC = 8:00 PM AEDT

**Environment Variables Required:**
- ✅ `CRON_SECRET` (in .env.local and Vercel)
- ✅ `RESEND_API_KEY` (for sending emails)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for database access)

---

## 🧪 Manual Testing Steps

### Step 1: Prepare Test Data

1. **Go to Supabase → Table Editor → `invoices`**
2. **Find an invoice** (or create one via Xero sync)
3. **Update the `due_date`** to 7 days ago:
   ```sql
   UPDATE invoices 
   SET due_date = CURRENT_DATE - INTERVAL '7 days'
   WHERE id = 'YOUR_INVOICE_ID';
   ```
4. **Ensure:**
   - `reminders_paused = false`
   - `status != 'PAID'`
   - `contact_email` has a valid email (or will use your account email)

### Step 2: Test Locally (Optional)

1. **Start your local dev server:**
   ```bash
   npm run dev
   ```

2. **Run the test script:**
   ```bash
   ./scripts/testCron.sh local
   ```

3. **Expected output:**
   ```
   ✅ Cron job executed successfully!
   📈 Summary:
     - Reminders sent: 1
     - Reminders failed: 0
     - Invoices synced: X
     - Syncs failed: 0
     - Users processed: 1
   ```

### Step 3: Test Production

1. **Ensure Vercel has all environment variables:**
   - `CRON_SECRET`
   - `RESEND_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - All Xero credentials

2. **Run the production test:**
   ```bash
   ./scripts/testCron.sh
   ```
   (No argument = production)

3. **Check the results:**
   - ✅ Status code 200
   - ✅ Reminders sent > 0
   - ✅ Email received in inbox
   - ✅ Check Supabase `reminder_logs` table for new entry
   - ✅ Check invoice `reminder_count` incremented
   - ✅ Check invoice `last_reminder_sent_at` updated

---

## 🔍 Verification Checklist

After running the cron test, verify:

### Database Changes

1. **`reminder_logs` table:**
   ```sql
   SELECT * FROM reminder_logs 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   - ✅ New entry with `reminder_type = 'day_7'`
   - ✅ `email_status = 'sent'`
   - ✅ Correct `invoice_id` and `user_id`

2. **`invoices` table:**
   ```sql
   SELECT invoice_number, reminder_count, last_reminder_sent_at 
   FROM invoices 
   WHERE id = 'YOUR_INVOICE_ID';
   ```
   - ✅ `reminder_count` incremented by 1
   - ✅ `last_reminder_sent_at` updated to today

### Email Delivery

1. **Check inbox** (client email or your account email)
2. **Verify email contains:**
   - ✅ Correct invoice number
   - ✅ Correct amount due
   - ✅ Professional tone
   - ✅ Company name (if set)

### Logs

1. **Check Vercel logs:**
   - Go to Vercel → Deployments → Latest → Logs
   - Search for `[Cron]`
   - ✅ Should see sync logs and reminder logs
   - ✅ No errors

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Cause:** `CRON_SECRET` mismatch or missing.

**Fix:**
1. Check `.env.local` has `CRON_SECRET`
2. Check Vercel has `CRON_SECRET` environment variable
3. Ensure they match exactly
4. Redeploy after updating Vercel env vars

### Issue: No reminders sent (remindersSent: 0)

**Possible causes:**
1. **No overdue invoices:** Check `invoices` table for invoices with `due_date < today`
2. **Already sent today:** Check `last_reminder_sent_at` - cron won't send twice in one day
3. **Reminders paused:** Check `reminders_paused = false`
4. **Invoice paid:** Check `status != 'PAID'`
5. **User not active:** Check user's `subscription_status` is `'trialing'` or `'active'`
6. **Reminder schedule disabled:** Check `reminder_settings` table

### Issue: Email not received

**Possible causes:**
1. **Resend not configured:** Check `RESEND_API_KEY` in Vercel
2. **Sandbox mode:** Resend sandbox only sends to verified emails
3. **No contact email:** Check invoice has `contact_email` or user has `email`
4. **Spam folder:** Check spam/junk folder

**Debug:**
- Check Vercel logs for `[Resend]` errors
- Check Resend dashboard for delivery status
- Check `reminder_logs` table for `error_message`

### Issue: Xero sync failed

**Possible causes:**
1. **Token expired:** Cron should auto-refresh, check logs for refresh errors
2. **Xero credentials missing:** Check all `XERO_*` env vars in Vercel
3. **No Xero connection:** User must have `xero_tenant_id` set

---

## 📅 Vercel Cron Schedule

Once deployed, Vercel will automatically run the cron job daily at 9:00 AM UTC.

**To verify it's scheduled:**
1. Go to Vercel → Project → Settings → Cron Jobs
2. You should see:
   - Path: `/api/cron/check-invoices`
   - Schedule: `0 9 * * *`
   - Status: Active

**To view cron execution history:**
1. Go to Vercel → Deployments → Select deployment → Logs
2. Filter by time (around 9:00 AM UTC)
3. Search for `[Cron]` to see execution logs

---

## 🚀 Manual Trigger Commands

### Using curl (from terminal):

**Local:**
```bash
curl -X GET http://localhost:3000/api/cron/check-invoices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Production:**
```bash
curl -X GET https://www.paydly.io/api/cron/check-invoices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from `.env.local`.

### Using the test script:

**Local:**
```bash
./scripts/testCron.sh local
```

**Production:**
```bash
./scripts/testCron.sh
```

---

## ✅ Launch Checklist

Before going live, ensure:

- [x] Cron schedule configured in `vercel.json`
- [x] `CRON_SECRET` set in Vercel (all environments)
- [x] Manual test passed (reminders sent successfully)
- [x] Email received and looks professional
- [x] Database updated correctly (`reminder_logs`, `invoices`)
- [x] Xero sync working (invoices synced before reminders)
- [x] Token refresh working (for long-running accounts)
- [x] Vercel cron job shows as "Active" in dashboard
- [x] Test with multiple reminder types (7, 14, 21 days)
- [x] Test with paused reminders (should skip)
- [x] Test with paid invoices (should skip)

---

## 📊 Expected Behavior

**What the cron job does:**

1. **Finds active users** with Xero connected
2. **Refreshes Xero tokens** if expired
3. **Syncs invoices** from Xero to Supabase
4. **Finds overdue invoices** (due_date < today, not paid, not paused)
5. **Determines reminder type** (7, 14, or 21 days based on days overdue)
6. **Checks reminder schedule** (user's settings for enabled days)
7. **Skips if already sent today** (prevents duplicate sends)
8. **Sends email** via Resend
9. **Logs to `reminder_logs`** table
10. **Updates invoice** (`reminder_count`, `last_reminder_sent_at`)

**Frequency:** Once per day at 9:00 AM UTC (7-8 PM Australian time)

**Users included:** Only users with:
- `subscription_status = 'trialing'` OR `'active'`
- `xero_tenant_id` is not null

---

## 🎯 Success Criteria

Your cron job is working correctly if:

✅ Manual test returns 200 OK  
✅ Email is received within 1 minute  
✅ `reminder_logs` table has new entry  
✅ Invoice `reminder_count` incremented  
✅ Invoice `last_reminder_sent_at` updated  
✅ Vercel logs show no errors  
✅ Multiple invoices processed in one run  
✅ Xero invoices synced before reminders sent  

---

## 📞 Support

If you encounter issues during testing:

1. Check Vercel logs for detailed error messages
2. Check Supabase `reminder_logs` table for `error_message` column
3. Verify all environment variables are set correctly
4. Ensure Resend domain is verified (for production emails)
5. Test with a known-good invoice (7 days overdue, valid email)

---

**Ready to test? Run:**

```bash
./scripts/testCron.sh
```

Good luck! 🚀

