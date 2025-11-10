# Stripe End-to-End Testing Guide

All 3 critical issues have been implemented and deployed. Here's how to test the complete Stripe subscription flow.

---

## ✅ What's Been Implemented

### Issue 1: Xero Connection Status UI ✅
- Success banner after OAuth: "✓ Connected to [Tenant Name] successfully"
- Green "✓ Connected" badge in XeroConnect component
- Tenant name displayed prominently
- Last sync timestamp

### Issue 2: Automatic Daily Sync ✅
- Cron job syncs invoices BEFORE sending reminders
- Token refresh logic included
- Runs daily at 9am AEST (configured in `vercel.json`)
- Returns: `{ invoicesSynced, syncsFailed, remindersSent, remindersFailed, usersProcessed }`

### Issue 3: Stripe Subscription Flow ✅
- Trial expiry detection and banner
- Billing page with subscription management
- Webhook handlers for all subscription events
- Middleware access control for expired subscriptions

---

## 🧪 Testing Checklist

### 1. Test Xero Connection Status (Issue 1)

**Steps:**
1. Go to `paydly.io/dashboard`
2. Click "Connect Xero"
3. Complete OAuth flow
4. **Expected:**
   - Redirected to dashboard with green success banner
   - Banner shows: "✓ Connected to [Your Xero Org Name] successfully"
   - XeroConnect section shows:
     - Green "✓ Connected" badge
     - "Connected to [Tenant Name] • Last synced [timestamp]"
5. Click "Sync now"
6. **Expected:**
   - Success message: "Successfully synced X invoices"
   - Timestamp updates

**Pass/Fail:** ___

---

### 2. Test Automatic Sync Cron Job (Issue 2)

**Manual Test:**
```bash
# Get your CRON_SECRET from Vercel env vars
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://paydly.io/api/cron/check-invoices
```

**Expected Response:**
```json
{
  "remindersSent": 0,
  "remindersFailed": 0,
  "invoicesSynced": 47,
  "syncsFailed": 0,
  "usersProcessed": 1
}
```

**Verify in Vercel Logs:**
1. Go to Vercel Dashboard → Paydly → Logs
2. Filter for `/api/cron/check-invoices`
3. Look for:
   - `[Cron] Syncing invoices for user [userId]`
   - `[Cron] Synced X invoices for user [userId]`
   - `[Cron] Token refreshed for user [userId]` (if token was expired)

**Pass/Fail:** ___

---

### 3. Test Stripe Subscription Flow (Issue 3)

#### 3.1 Test Trial User Experience

**Steps:**
1. Create a new account (or use existing trial account)
2. Go to `/dashboard`
3. **Expected:**
   - Banner shows: "Your trial ends in X days. Add a payment method to keep reminders running."
   - "Upgrade now" button visible
4. Go to `/billing`
5. **Expected:**
   - Current Plan shows "Trial" badge
   - "Trial ends in X days" message
   - "Subscribe Now" button visible

**Pass/Fail:** ___

#### 3.2 Test Stripe Checkout Flow

**Steps:**
1. From `/billing`, click "Subscribe Now"
2. **Expected:**
   - Redirected to Stripe Checkout page
   - Shows "$29/month" subscription
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
4. Complete payment
5. **Expected:**
   - Redirected to `/dashboard?payment=success`
   - Trial banner is replaced with active subscription status
6. Go to `/billing`
7. **Expected:**
   - Current Plan shows "Active" badge (green)
   - "Manage Billing" button visible
   - No "Subscribe Now" button

**Pass/Fail:** ___

#### 3.3 Test Webhook Events

**Verify in Vercel Logs:**
After completing Stripe checkout, check logs for:

1. `[Stripe Webhook] checkout.session.completed`
   - Should log: `{ userId, customerId, mode: 'subscription' }`
   - Profile updated with `stripe_customer_id`

2. `[Stripe Webhook] customer.subscription.created`
   - Should log: `{ customerId, status: 'active', trialEnd: null }`
   - Profile updated with `subscription_status: 'active'`

**Pass/Fail:** ___

#### 3.4 Test Access Control (Expired Subscription)

**Manual Test (requires Stripe Dashboard access):**

1. In Stripe Dashboard, find your test subscription
2. Cancel the subscription immediately (no grace period)
3. Wait 30 seconds for webhook to fire
4. Try to access `/dashboard`
5. **Expected:**
   - Redirected to `/billing?access=blocked`
   - Red banner: "Subscription Required - Your subscription has expired..."
6. Try to access `/invoices`, `/overdue`, `/upcoming`
7. **Expected:**
   - All redirect to `/billing?access=blocked`
8. Access `/settings` or `/billing`
9. **Expected:**
   - Access is allowed (these pages are in ALLOWED_FOR_EXPIRED list)

**Pass/Fail:** ___

#### 3.5 Test Trial Expiry Detection

**Manual Test (requires database access):**

1. In Supabase, update your profile:
   ```sql
   UPDATE profiles
   SET trial_ends_at = NOW() - INTERVAL '1 day',
       subscription_status = 'trialing'
   WHERE id = 'YOUR_USER_ID';
   ```
2. Try to access `/dashboard`
3. **Expected:**
   - Middleware detects expired trial
   - Updates `subscription_status` to `'expired'`
   - Redirects to `/billing?access=expired`
   - Amber banner: "Trial Ended - Your 14-day trial has ended..."

**Pass/Fail:** ___

---

## 🔧 Stripe Configuration Checklist

Before testing, ensure these are configured in Vercel:

### Environment Variables
- [x] `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- [x] `STRIPE_PRICE_ID` - Your $29/month price ID (starts with `price_`)
- [x] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
- [x] `NEXT_PUBLIC_APP_URL` - `https://paydly.io`

### Stripe Dashboard
1. **Create Product & Price:**
   - Go to Products → Create Product
   - Name: "Paydly Professional"
   - Price: $29/month recurring
   - Copy the Price ID → add to `STRIPE_PRICE_ID` env var

2. **Configure Webhook:**
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://paydly.io/api/stripe/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - Copy the Signing Secret → add to `STRIPE_WEBHOOK_SECRET` env var

3. **Test Mode:**
   - Ensure you're in Test Mode (toggle in top right)
   - Use test card: `4242 4242 4242 4242`

---

## 🐛 Common Issues & Fixes

### Issue: Webhook not firing
**Fix:** Check Stripe Dashboard → Developers → Webhooks → Recent deliveries
- If failing, check the error message
- Verify `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret

### Issue: Subscription status not updating
**Fix:** Check Vercel logs for webhook errors
- Look for `[Stripe Webhook]` logs
- Verify `stripe_customer_id` is saved in profiles table

### Issue: Access not blocked after cancellation
**Fix:** 
1. Check middleware is running (look for middleware logs in Vercel)
2. Verify subscription_status in database is `'expired'` or `'past_due'`
3. Clear browser cache and cookies

### Issue: Trial banner still showing after subscription
**Fix:**
1. Check `subscription_status` in database (should be `'active'`)
2. Verify webhook `customer.subscription.created` fired successfully
3. Hard refresh the page (Cmd+Shift+R)

---

## 📊 Expected Database State

After successful subscription:

```sql
-- Check your profile
SELECT 
  subscription_status,
  stripe_customer_id,
  trial_ends_at
FROM profiles
WHERE id = 'YOUR_USER_ID';

-- Expected:
-- subscription_status: 'active'
-- stripe_customer_id: 'cus_...' (not null)
-- trial_ends_at: null (or past date)
```

---

## ✅ Final Verification

Before going live:

- [ ] All 5 tests in section 3 pass
- [ ] Stripe webhooks show successful deliveries
- [ ] Can subscribe and access is granted
- [ ] Can cancel and access is blocked
- [ ] Trial expiry is detected and handled
- [ ] Billing page shows correct status
- [ ] Cron job syncs invoices daily

---

## 🚀 Next Steps

Once all tests pass:

1. **Switch to Live Mode in Stripe:**
   - Create live product & price
   - Update `STRIPE_PRICE_ID` with live price ID
   - Update `STRIPE_SECRET_KEY` with live key (starts with `sk_live_`)
   - Create new webhook for live mode
   - Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

2. **Test with Real Card:**
   - Use your own card to test the full flow
   - Verify charge appears in Stripe Dashboard
   - Verify access is granted

3. **Launch to Customers:**
   - All critical features are now working
   - Users can sign up, connect Xero, sync invoices, send reminders
   - Subscriptions are enforced
   - Daily automation is running

---

## 📞 Support

If you encounter issues:
1. Check Vercel logs for errors
2. Check Stripe Dashboard → Webhooks → Recent deliveries
3. Verify all environment variables are set correctly
4. Check Supabase database for correct data

**All 3 critical issues are now complete and ready for testing!** 🎉

