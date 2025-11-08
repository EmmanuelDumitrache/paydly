# Paydly MVP Testing Guide

## ✅ Pre-Testing Checklist

Before starting tests, verify:
- [ ] Dev server is running: `npm run dev`
- [ ] `.env.local` has all required credentials (see `ENV_CHECKLIST.md`)
- [ ] You're logged into your Paydly account

---

## Test 1: Xero Connection & Invoice Sync

### Steps:

1. **Navigate to Dashboard**
   - Go to: http://localhost:3000/dashboard
   - Expected: See "Connect Xero" button if not connected

2. **Connect Xero Account**
   - Click "Connect Xero" button
   - Expected: Redirected to Xero OAuth login
   - Log in with your Xero account
   - Authorize Paydly to access invoices
   - Expected: Redirected back to `/dashboard` with success message

3. **Sync Invoices**
   - Go to Settings: http://localhost:3000/settings
   - Click "Sync now" button
   - Expected: Page reloads with confirmation message
   - Check console for any errors

4. **Verify Synced Data**
   - Go back to Dashboard: http://localhost:3000/dashboard
   - Expected: See invoice stats (overdue count, total amount)
   - Expected: See list of recent overdue invoices
   - Go to Invoices page: http://localhost:3000/invoices
   - Expected: See all synced invoices from Xero

### ✅ Success Criteria:
- [x] Xero connection established
- [x] Invoices synced from Xero API
- [x] Dashboard shows real invoice data
- [x] Invoices page displays all synced invoices

### 🐛 Troubleshooting:
- **Xero redirect fails**: Check `XERO_CLIENT_ID` and `XERO_CLIENT_SECRET` in `.env.local`
- **No invoices appear**: Check browser console and terminal for Xero API errors
- **"Unauthorized" error**: Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

## Test 2: Manual Email Reminder

### Steps:

1. **Get Invoice ID**
   - Go to Supabase dashboard: https://xsvuqporgkddggmkasgh.supabase.co
   - Go to Table Editor → `invoices` table
   - Copy any invoice's `id` (UUID format)
   - Example: `550e8400-e29b-41d4-a716-446655440000`

2. **Send Manual Reminder**
   - Open terminal
   - Run this curl command (replace `INVOICE_ID` with the UUID you copied):

   ```bash
   curl -X POST http://localhost:3000/api/reminders/send \
     -H "Content-Type: application/json" \
     -d '{"invoice_id": "INVOICE_ID"}'
   ```

3. **Verify Email Sent**
   - Expected: API returns `{"success": true, "reminder_id": "..."}`
   - Check Resend dashboard: https://resend.com/emails
   - Expected: See the sent email in your Resend dashboard
   - Check the invoice recipient's inbox
   - Expected: Email received with reminder content

4. **Check Reminder Log**
   - Go to Supabase → `reminder_logs` table
   - Expected: New row with the reminder details
   - Verify `sent_at`, `reminder_type`, and `invoice_id` are correct

### ✅ Success Criteria:
- [x] API returns success response
- [x] Email appears in Resend dashboard
- [x] Email received by contact
- [x] Reminder logged in `reminder_logs` table
- [x] Email content matches template (7/14/21 day reminder)

### 🐛 Troubleshooting:
- **"RESEND_API_KEY is not configured"**: Add Resend API key to `.env.local`
- **"No contact email found"**: Invoice doesn't have an email address - use a different invoice
- **Email not received**: Check Resend dashboard for delivery status, verify email is not blocked

---

## Test 3: Cron Job (Automated Reminders)

### Steps:

1. **Generate Cron Secret** (if not already done)
   ```bash
   openssl rand -base64 32
   ```
   - Add output to `.env.local` as `CRON_SECRET`
   - Restart dev server

2. **Run Cron Endpoint Manually**
   ```bash
   curl http://localhost:3000/api/cron/check-invoices \
     -H "Authorization: Bearer YOUR_CRON_SECRET_HERE"
   ```
   - Replace `YOUR_CRON_SECRET_HERE` with the value from `.env.local`

3. **Verify Cron Logic**
   - Expected: API returns `{"processed": N}` where N is the number of reminders sent
   - Check terminal logs for details:
     - Which invoices were processed
     - Which reminders were sent (7/14/21 day)
     - Any errors

4. **Check Reminder Logs**
   - Go to Supabase → `reminder_logs` table
   - Expected: New rows for each reminder sent
   - Verify `sent_at` is recent (within last minute)

### ✅ Success Criteria:
- [x] Cron endpoint executes without errors
- [x] Correct reminders sent based on days overdue:
  - 7-day reminder: 7-13 days overdue
  - 14-day reminder: 14-20 days overdue
  - 21-day reminder: 21+ days overdue
- [x] Reminders logged in database
- [x] No duplicate reminders sent

### 🐛 Troubleshooting:
- **"Unauthorized"**: Check `CRON_SECRET` matches in `.env.local` and curl command
- **"No invoices to process"**: No invoices are overdue, or all have been reminded already
- **Duplicate emails**: Check `reminder_logs` to ensure logic prevents duplicates

---

## Test 4: Settings & Reminder Schedule

### Steps:

1. **Update Reminder Schedule**
   - Go to Settings: http://localhost:3000/settings
   - Toggle reminder types (7/14/21 day reminders)
   - Click "Save schedule"
   - Expected: Page reloads with confirmation

2. **Verify Settings Saved**
   - Go to Supabase → `reminder_settings` table
   - Expected: Row with your `user_id` shows updated settings
   - Refresh Settings page
   - Expected: Checkboxes reflect saved state

3. **Update Account Profile**
   - In Settings, update "Full name" and "Company name"
   - Click "Save changes"
   - Expected: Page reloads with confirmation
   - Check Supabase → `profiles` table
   - Expected: Row updated with new values

### ✅ Success Criteria:
- [x] Reminder schedule toggles work
- [x] Settings persist in database
- [x] Profile updates save correctly
- [x] Changes reflect immediately after save

---

## Test 5: Xero Disconnect

### Steps:

1. **Disconnect Xero**
   - Go to Settings: http://localhost:3000/settings
   - Click "Disconnect" button
   - Expected: Page reloads, "Connect Xero" button appears

2. **Verify Database Updated**
   - Go to Supabase → `profiles` table
   - Expected: Your row has `xero_tenant_id`, `xero_access_token`, `xero_refresh_token` set to `NULL`

3. **Reconnect Xero**
   - Click "Connect Xero" again
   - Expected: OAuth flow works again

---

## 🚀 All Tests Passed?

If all tests above pass, you're ready to:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Connect all features to real data - MVP ready"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com/dashboard
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to production domain
   - Deploy

3. **Verify Cron in Production:**
   - Check Vercel dashboard → Functions → Cron
   - Expected: `/api/cron/check-invoices` runs daily at 9am AEST
   - Check logs after first run

---

## 📊 Manual Verification Checklist

Before going live:

- [ ] Landing page loads correctly
- [ ] Sign up creates new user + profile + reminder_settings
- [ ] Login works and persists session
- [ ] Dashboard shows real Xero data after sync
- [ ] Invoices page lists all invoices correctly
- [ ] Manual reminder sends email successfully
- [ ] Cron job processes overdue invoices
- [ ] Settings save and persist
- [ ] Xero disconnect/reconnect works
- [ ] Sign out works

---

## 🎯 First Customer Test

Once deployed to production:

1. Invite a test user (friend/colleague)
2. Have them:
   - Sign up for trial
   - Connect their Xero account
   - Sync invoices
   - Wait 24 hours for automated reminders
3. Collect feedback on UX and bugs
4. Monitor Supabase and Resend dashboards for errors

---

## Need Help?

Check these resources:
- Xero API Docs: https://developer.xero.com/documentation/api/accounting/invoices
- Resend Docs: https://resend.com/docs
- Supabase Logs: https://xsvuqporgkddggmkasgh.supabase.co → Logs
- Vercel Logs: Dashboard → Your Project → Logs

