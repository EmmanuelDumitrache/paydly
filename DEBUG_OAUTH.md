# Debug OAuth PKCE Issue

## Step 1: Start Your Dev Server

Open a terminal and run:
```bash
npm run dev
```

Keep this terminal window open - this is where you'll see the logs.

## Step 2: Try Google Sign-In

1. Open your browser and go to your login page (usually `http://localhost:3000/login`)
2. Click "Sign in with Google"
3. Complete the Google OAuth flow

## Step 3: Check the Terminal Logs

After you click "Sign in with Google" and it redirects back, look at your terminal window where `npm run dev` is running.

You should see log messages that start with `[Auth Callback]`. Copy and share these messages with me.

## What to Look For

Look for messages like:
- `[Auth Callback] Processing callback with code: ...`
- `[Auth Callback] Cookie header length: ...`
- `[Auth Callback] Code verifier cookie found: ...` OR `[Auth Callback] Code verifier cookie NOT found!`
- `[Auth Callback] Available cookie names: ...`
- `[Auth Callback] Expected code verifier cookie NOT found: ...`
- `[Auth Callback] Exchange error: ...`

## Step 4: Check Browser DevTools (Optional)

1. Open your browser's Developer Tools (F12 or right-click → Inspect)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Cookies** in the left sidebar
4. Select your domain (e.g., `localhost:3000`)
5. Look for cookies that start with `sb-` (Supabase cookies)
6. Tell me what cookies you see there

## Step 5: Share the Information

Share with me:
1. The log messages from your terminal (the `[Auth Callback]` messages)
2. Any error messages you see
3. The cookies you see in browser DevTools (especially ones starting with `sb-`)

This will help me understand what's happening and fix the issue.

