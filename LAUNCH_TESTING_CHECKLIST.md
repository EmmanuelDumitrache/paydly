# Launch Testing Checklist

**Date:** _____________  
**Tester:** _____________  
**Environment:** Production (paydly.io)

---

## Critical Path (Must Pass Before Launch)

These 6 items MUST all pass before reaching out to customers. If any fail, stop and fix immediately.

### 1. Sign Up Flow
- [ ] **Create new account**
  - Go to https://paydly.io/signup
  - Enter email and password
  - Click "Sign up"
  - **Expected:** Redirects to /dashboard
  - **Actual:** _____________
  
- [ ] **Trial banner appears**
  - Check top of dashboard
  - **Expected:** "Your trial ends in 14 days" banner visible
  - **Actual:** _____________

- [ ] **Profile created in Supabase**
  - Check Supabase dashboard → profiles table
  - **Expected:** New row with user_id, trial_ends_at (14 days from now)
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

### 2. Xero OAuth Connection
- [ ] **Click "Connect Xero" button**
  - On dashboard, click "Connect Xero" in banner
  - **Expected:** Redirects to Xero login page
  - **Actual:** _____________

- [ ] **Authorize app**
  - Login to Xero (or use existing session)
  - Select organization
  - Click "Authorize"
  - **Expected:** Redirects back to paydly.io/dashboard
  - **Actual:** _____________

- [ ] **Connection status updates**
  - Check dashboard after redirect
  - **Expected:** "Connect Xero" banner disappears, "Sync now" button appears
  - **Actual:** _____________

- [ ] **Tokens saved in Supabase**
  - Check profiles table → xero_access_token, xero_tenant_id populated
  - **Expected:** Non-null values in Xero token fields
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

### 3. Invoice Sync
- [ ] **Click "Sync now" button**
  - In Xero connection card, click "Sync now"
  - **Expected:** Page reloads with success message
  - **Actual:** _____________

- [ ] **Success message appears**
  - Check top of dashboard
  - **Expected:** Green banner: "Successfully synced X invoices"
  - **Actual:** _____________

- [ ] **Stats update**
  - Check dashboard stats cards
  - **Expected:** "Overdue invoices" count > 0 (if you have overdue invoices in Xero)
  - **Actual:** _____________

- [ ] **Overdue page shows invoices**
  - Click "Overdue" in sidebar
  - **Expected:** Table with invoice details (number, client, amount, due date)
  - **Actual:** _____________

- [ ] **Invoices page shows all**
  - Click "Invoices" in sidebar
  - **Expected:** Full list of synced invoices with filters
  - **Actual:** _____________

- [ ] **Data in Supabase**
  - Check invoices table
  - **Expected:** Rows with user_id, xero_invoice_id, contact_email, amount_due, due_date
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

### 4. Send Test Reminder
- [ ] **Navigate to overdue page**
  - Click "Overdue" in sidebar
  - **Expected:** List of overdue invoices
  - **Actual:** _____________

- [ ] **Click "Send Reminder" button**
  - On first invoice, click "Send Reminder"
  - **Expected:** Button changes to "Sending..."
  - **Actual:** _____________

- [ ] **Success message appears**
  - Wait 2-3 seconds
  - **Expected:** Green text: "Reminder sent to [email]"
  - **Actual:** _____________

- [ ] **Email delivers**
  - Check inbox (and spam folder) for email from Paydly
  - **Expected:** Email arrives within 1 minute
  - **Actual:** _____________

- [ ] **Email content correct**
  - Open email
  - Check: Invoice number, amount, due date, company name
  - **Expected:** All details match the invoice
  - **Actual:** _____________

- [ ] **Reminder logged in Supabase**
  - Check reminder_logs table
  - **Expected:** New row with invoice_id, sent_at, reminder_type: 'day_7'
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

### 5. Session Persistence
- [ ] **Logout successfully**
  - Click "Sign out" in header
  - **Expected:** Redirects to landing page (/)
  - **Actual:** _____________

- [ ] **Login with same credentials**
  - Go to /login
  - Enter same email/password
  - Click "Log in"
  - **Expected:** Redirects to /dashboard
  - **Actual:** _____________

- [ ] **Dashboard loads with data**
  - Check stats, invoices, Xero connection
  - **Expected:** All synced data still visible (not reset)
  - **Actual:** _____________

- [ ] **Xero connection still active**
  - Check if "Sync now" button is still available
  - **Expected:** Can sync again without re-authorizing Xero
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

### 6. Settings & Profile
- [ ] **Navigate to Settings**
  - Click "Settings" in sidebar
  - **Expected:** Settings page loads
  - **Actual:** _____________

- [ ] **Profile data loads**
  - Check company name, email fields
  - **Expected:** Fields populated with user data
  - **Actual:** _____________

- [ ] **Reminder toggles visible**
  - Check 7-day, 14-day, 21-day toggles
  - **Expected:** All three toggles present and enabled by default
  - **Actual:** _____________

**Status:** ⬜ PASS / ⬜ FAIL  
**Notes:** _____________

---

## Critical Path Summary

**Total Tests:** 6  
**Passed:** ___ / 6  
**Failed:** ___ / 6

**Ready to Launch?** ⬜ YES / ⬜ NO

---

## Edge Cases (Nice to Have)

Test these after critical path passes. Not blocking for launch.

- [ ] **0 invoices in Xero**
  - Test with Xero account that has no invoices
  - **Expected:** Empty state message: "No invoices yet. Connect Xero and sync to get started."
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Invoice missing email address**
  - Sync invoice with no contact email in Xero
  - Try to send reminder
  - **Expected:** Uses fallback email or shows clear error
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Xero token expired**
  - Wait 30 minutes after connecting Xero (tokens expire after 30 min)
  - Try to sync again
  - **Expected:** Shows "Reconnect Xero" prompt or auto-refreshes token
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Send reminder twice**
  - Send reminder to same invoice
  - Try to send again immediately
  - **Expected:** Either prevents duplicate or allows (document behavior)
  - **Status:** ⬜ PASS / ⬜ FAIL

---

## UI/UX Polish (Post-Launch)

Test these after first customers sign up. Not blocking.

- [ ] **Mobile responsive**
  - Test on iPhone/Android
  - Check: Landing page, dashboard, invoices table
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Footer links work**
  - Click About, Privacy, Terms in footer
  - **Expected:** Pages load (even if basic placeholders)
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **FAQ section readable**
  - Scroll to FAQ on landing page
  - Click to expand/collapse questions
  - **Expected:** Smooth accordion animation, text readable
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Social proof section**
  - Check testimonials on landing page
  - **Expected:** Looks professional (even if generic for now)
  - **Status:** ⬜ PASS / ⬜ FAIL

---

## Analytics (Post-Launch)

Verify tracking after first customers.

- [ ] **Vercel Analytics installed**
  - Check Vercel dashboard → Analytics tab
  - **Expected:** Pageviews tracking
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Signup events logged**
  - Check server logs or Supabase
  - **Expected:** Can see when users sign up
  - **Status:** ⬜ PASS / ⬜ FAIL

- [ ] **Xero connection events**
  - Check logs for OAuth callbacks
  - **Expected:** Can track successful connections
  - **Status:** ⬜ PASS / ⬜ FAIL

---

## Known Issues (Non-Blocking)

These are documented limitations that can be fixed after first customers:

- ✅ **Privacy/Terms pages are basic placeholders** (acceptable for MVP)
- ✅ **Social proof testimonials are generic** (will update with real ones)
- ✅ **No Stripe integration yet** (trial only, payment later)
- ✅ **Pause/Resume buttons don't work** (UI only, functionality later)
- ✅ **"Mark as paid" button doesn't work** (manual workaround: mark in Xero)
- ✅ **Cron job not configured** (reminders are manual only for now)
- ✅ **No email customization** (templates are fixed for MVP)

---

## Blocking Issues Found During Testing

Document any critical bugs that prevent launch:

1. _____________
2. _____________
3. _____________

---

## Testing Instructions

1. **Use a fresh browser/incognito window** to simulate new user
2. **Start from the landing page** (paydly.io)
3. **Go through each critical path item in order**
4. **Mark PASS/FAIL for each section**
5. **If any critical path fails, STOP and report immediately**
6. **Edge cases and polish can wait until after launch**

---

## Success Criteria

**All 6 critical path items must pass:**
1. ✅ Sign up works
2. ✅ Xero connects
3. ✅ Invoices sync
4. ✅ Email sends
5. ✅ Session persists
6. ✅ Settings load

**Once all pass, you're ready to DM 10 people tomorrow! 🚀**

---

## Post-Testing Actions

After all critical tests pass:

- [ ] Push final changes to GitHub
- [ ] Verify production deployment on Vercel
- [ ] Test one more time on production URL
- [ ] Prepare outreach message for 10 prospects
- [ ] Set up monitoring/alerts for errors
- [ ] Document any workarounds for known issues

---

**Tested by:** _____________  
**Date completed:** _____________  
**Ready for launch:** ⬜ YES / ⬜ NO

