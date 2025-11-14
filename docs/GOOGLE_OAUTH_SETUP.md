# Google OAuth Setup for Supabase

## Overview
Your app already has Google sign-up/login functionality in the code. You just need to configure it in Supabase and Google Cloud Console.

## Step 1: Configure Google OAuth in Supabase

### 1.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**

### 1.2 Get Google OAuth Credentials
You'll need:
- **Client ID** (also called Client Key)
- **Client Secret**

These come from Google Cloud Console (see Step 2 below).

### 1.3 Add Credentials to Supabase
1. In the Google provider settings, paste:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
2. Click **Save**

## Step 2: Create Google OAuth Credentials

### 2.1 Go to Google Cloud Console
1. Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select your project (or create a new one)

### 2.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click **Enable** (if not already enabled)

### 2.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - **User Type**: External (unless you have Google Workspace)
   - **App name**: Paydly
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **Scopes**: Add `email`, `profile`, `openid`
   - **Test users**: Add your email for testing (if in testing mode)
   - Click **Save and Continue** through all steps

### 2.4 Create OAuth Client
1. **Application type**: Web application
2. **Name**: Paydly Web Client
3. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://your-supabase-project.supabase.co` (your Supabase project URL)
   - `https://your-domain.com` (your production domain)
4. **Authorized redirect URIs**:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - Add this exact format: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Find your project ref in Supabase Dashboard → Settings → API

### 2.5 Copy Credentials
1. After creating, you'll see:
   - **Your Client ID** (something like: `123456789-abc.apps.googleusercontent.com`)
   - **Your Client Secret** (a long string)
2. Copy both of these

## Step 3: Configure Redirect URLs in Supabase

### 3.1 Set Redirect URLs
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/callback
   https://your-domain.com/api/auth/callback
   http://localhost:3000/dashboard
   https://your-domain.com/dashboard
   ```

### 3.2 Verify Site URL
Make sure **Site URL** is set correctly:
- Local: `http://localhost:3000`
- Production: `https://your-domain.com`

## Step 4: Update Code (if needed)

Your code already has Google OAuth support in `components/auth/SignupForm.tsx` and `components/auth/LoginForm.tsx`. The callback handler is in `app/api/auth/callback/route.ts`.

### Verify Callback Route
The callback route should handle both email/password and OAuth sign-ins:

```typescript:app/api/auth/callback/route.ts
// ... existing code ...
```

If you need to handle profile creation for Google users, you may need to update the callback to set up the profile table entry.

## Step 5: Test Google Sign-In

### 5.1 Local Testing
1. Start your dev server: `npm run dev`
2. Go to `/signup` or `/login`
3. Click "Sign up with Google" or "Sign in with Google"
4. You should be redirected to Google's consent screen
5. After approving, you'll be redirected back to `/dashboard`

### 5.2 Check Profile Creation
After Google sign-in, verify that:
1. User is created in `auth.users` table
2. Profile is created in `profiles` table (check the callback handler)

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console matches exactly:
- `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### Issue: "Access blocked"
**Solution**: 
- Make sure OAuth consent screen is configured
- If app is in testing mode, add test users
- Verify scopes are correct

### Issue: User not redirected after Google sign-in
**Solution**:
- Check Supabase redirect URLs configuration
- Verify `NEXT_PUBLIC_APP_URL` environment variable
- Check browser console for errors

### Issue: Profile not created for Google users
**Solution**:
- Check if callback route creates profile
- You may need to add database trigger or update callback handler
- See `supabase/migrations/001_initial_schema.sql` for profile creation logic

## Production Checklist
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Credentials added to Supabase
- [ ] OAuth consent screen published (if needed)
- [ ] Production redirect URLs added to Google Cloud Console
- [ ] Production redirect URLs added to Supabase
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] Test Google sign-in in production

