# Signup Email Template Setup

## Overview
The signup/confirmation email is managed in Supabase's dashboard, not in the codebase. Supabase sends automatic email confirmations when users sign up.

## How to Edit the Signup Email Template

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com) and log in
2. Select your project (paydly)
3. Navigate to **Authentication** → **Email Templates** in the left sidebar

### Step 2: Customize the "Confirm signup" Template
1. Click on **"Confirm signup"** template
2. You'll see two editable sections:
   - **Subject**: Email subject line
   - **Body**: Email body (HTML)

### Step 3: Available Variables
You can use these variables in your template:
- `{{ .ConfirmationURL }}` - The confirmation link users click to verify their email
- `{{ .Token }}` - The confirmation token (if you need the raw token)
- `{{ .TokenHash }}` - Hashed token
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app's site URL (configured in Authentication → URL Configuration)

### Step 4: Example Custom Template

**Subject:**
```
Confirm your Paydly account
```

**Body (HTML):**
```html
<h2>Welcome to Paydly!</h2>

<p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>Best regards,<br>The Paydly Team</p>
```

### Step 5: Configure Redirect URL
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL (e.g., `http://localhost:3000` for local, or your production URL)
3. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://your-domain.com/api/auth/callback` (for production)
   - `http://localhost:3000/dashboard` (optional, for direct dashboard redirect)
   - `https://your-domain.com/dashboard` (optional, for production)

### Step 6: Email Provider Setup
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (or use Supabase's default)
3. Recommended providers:
   - **Resend** (already used for reminder emails)
   - **SendGrid**
   - **AWS SES**
   - **Postmark**

### Step 7: Enable/Disable Email Confirmations
1. Go to **Authentication** → **Providers**
2. Under **Email** provider settings:
   - **Enable email confirmations**: Toggle this ON/OFF
   - When OFF: Users can sign up without email confirmation
   - When ON: Users must confirm email before accessing the app

## Current Configuration
Based on your code, the app currently:
- Redirects to `/dashboard` after signup (regardless of email confirmation)
- Uses `/api/auth/callback` for OAuth callbacks (Google, etc.)

## Testing
1. Sign up with a new email
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Verify it redirects to the correct URL

## Google OAuth Setup
See `docs/GOOGLE_OAUTH_SETUP.md` for Google sign-in configuration.

