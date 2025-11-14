# How to Debug OAuth Cookie Issue

## Quick Steps

### 1. Check Your Terminal/Console

When you click "Sign in with Google", you should see messages in:
- **Your terminal** (where you ran `npm run dev`) - look for `[Auth Callback]` messages
- **Your browser console** (press F12 → Console tab) - look for `[LoginForm]` messages

### 2. What to Share With Me

Just copy and paste:
1. **Terminal logs** - All messages that start with `[Auth Callback]`
2. **Browser console logs** - Messages that start with `[LoginForm]`
3. **The error message** - What exactly do you see on screen?

### 3. If You Don't See Logs

Make sure:
- Your dev server is running (`npm run dev`)
- You're trying to sign in while the dev server is running
- You're looking at the right terminal window

### 4. Alternative: Check Browser Cookies

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → select your site (`localhost:3000`)
4. Look for cookies starting with `sb-` (Supabase cookies)
5. Tell me: Do you see any cookies there? What are their names?

## Even Simpler

Just tell me:
- What error message do you see exactly?
- Does it happen immediately or after you click through Google?
- Have you tried clearing your browser cookies and trying again?

