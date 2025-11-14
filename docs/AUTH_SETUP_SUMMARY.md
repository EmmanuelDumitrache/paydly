# Authentication Setup Summary

## What We've Done

### 1. Signup Email Template
- Created guide: `docs/SIGNUP_EMAIL_SETUP.md`
- The signup email is managed in **Supabase Dashboard** → **Authentication** → **Email Templates**
- You can customize the "Confirm signup" template there

### 2. Google OAuth Setup
- Created guide: `docs/GOOGLE_OAUTH_SETUP.md`
- Updated `app/api/auth/callback/route.ts` to:
  - Handle OAuth errors properly
  - Set up profile with trial information for new Google sign-ups
  - Ensure profile is created even if database trigger hasn't run yet
- Updated `app/(auth)/login/page.tsx` and `components/auth/LoginForm.tsx` to:
  - Display authentication errors from OAuth callbacks

## Next Steps

### Step 1: Edit Signup Email Template
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Click **"Confirm signup"** template
4. Customize the subject and body HTML
5. Use variables like `{{ .ConfirmationURL }}` and `{{ .Email }}`
6. Save your changes

See `docs/SIGNUP_EMAIL_SETUP.md` for detailed instructions and examples.

### Step 2: Set Up Google OAuth
1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback`

2. **Configure in Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google Client ID and Client Secret

3. **Update Redirect URLs:**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Add: `http://localhost:3000/api/auth/callback` (for local)
   - Add: `https://your-domain.com/api/auth/callback` (for production)

See `docs/GOOGLE_OAUTH_SETUP.md` for detailed step-by-step instructions.

### Step 3: Test It
1. **Test Email Signup:**
   - Sign up with a new email
   - Check your email for the confirmation link
   - Verify the email looks correct

2. **Test Google Sign-In:**
   - Click "Sign up with Google" on the signup page
   - Complete Google OAuth flow
   - Verify you're redirected to dashboard
   - Check that profile is created with trial information

## Code Changes Made

### Files Modified:
1. **`app/api/auth/callback/route.ts`**
   - Added error handling for OAuth failures
   - Added profile setup for new OAuth users (trial info, email)
   - Handles database trigger race conditions

2. **`app/(auth)/login/page.tsx`**
   - Added searchParams support to display OAuth errors

3. **`components/auth/LoginForm.tsx`**
   - Added `initialError` prop to display errors from URL params

### Files Created:
1. **`docs/SIGNUP_EMAIL_SETUP.md`** - Guide for editing signup email
2. **`docs/GOOGLE_OAUTH_SETUP.md`** - Guide for Google OAuth setup
3. **`docs/AUTH_SETUP_SUMMARY.md`** - This file

## Important Notes

- **Email confirmations**: Supabase sends confirmation emails automatically. You can disable this in Supabase Dashboard → Authentication → Providers → Email settings.

- **Profile creation**: Database trigger automatically creates profiles. The callback now ensures OAuth users also get trial information set up.

- **Redirect URLs**: Make sure both Google Cloud Console and Supabase have the correct redirect URLs configured.

## Troubleshooting

If Google sign-in doesn't work:
1. Check Google Cloud Console credentials are correct
2. Verify redirect URI matches exactly: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
3. Check Supabase redirect URLs configuration
4. Look at browser console and server logs for errors

If email confirmation doesn't work:
1. Check Supabase email template is saved
2. Verify SMTP settings in Supabase (or use Supabase default)
3. Check spam folder
4. Verify Site URL is set correctly in Supabase

