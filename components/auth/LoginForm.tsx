// @ts-nocheck - Supabase generic types cause issues with type inference
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(initialError || null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: rememberMe,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    
    console.log('[LoginForm] ========== STARTING GOOGLE OAUTH ==========');
    console.log('[LoginForm] Origin:', process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
    console.log('[LoginForm] Current URL:', window.location.href);
    console.log('[LoginForm] Current cookies:', document.cookie);
    
    try {
      // IMPORTANT: Use client-side OAuth for proper PKCE cookie handling
      // Client-side ensures cookies are set in the browser and persist through redirects
      const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectTo = `${origin}/api/auth/callback`;
      
      console.log('[LoginForm] Redirect URL:', redirectTo);
      console.log('[LoginForm] Calling signInWithOAuth...');
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('[LoginForm] signInWithOAuth response - data:', data);
      console.log('[LoginForm] signInWithOAuth response - error:', signInError);

      if (signInError) {
        console.error('[LoginForm] ❌ Google sign-in error:', signInError);
        console.error('[LoginForm] Error details:', JSON.stringify(signInError, null, 2));
        setError(signInError.message);
        return;
      }

      // CRITICAL: signInWithOAuth returns a URL that we MUST redirect to
      // This starts the OAuth flow and sets the PKCE code verifier cookie
      if (data?.url) {
        console.log('[LoginForm] ✅ Got OAuth URL from Supabase');
        
        // IMPORTANT: Check cookies AFTER signInWithOAuth call
        // Supabase should have set the code verifier cookie at this point
        const cookiesAfterOAuthCall = document.cookie;
        console.log('[LoginForm] Cookies AFTER signInWithOAuth call:', cookiesAfterOAuthCall);
        console.log('[LoginForm] All cookies:', document.cookie.split(';').map(c => c.trim()));
        
        // Parse all cookies to check for code verifier
        const allCookies = cookiesAfterOAuthCall.split(';').map(c => {
          const [name, ...valueParts] = c.trim().split('=');
          return { name, value: valueParts.join('='), full: c.trim() };
        });
        
        console.log('[LoginForm] Parsed cookies:', allCookies);
        
        // Check if Supabase code verifier cookie is present
        const codeVerifierCookies = allCookies.filter(c => 
          c.name.includes('code-verifier') || 
          c.name.includes('code_verifier') ||
          c.name.includes('codeverifier')
        );
        
        if (codeVerifierCookies.length > 0) {
          console.log('[LoginForm] ✅ Code verifier cookie(s) found:', codeVerifierCookies.map(c => c.name));
          codeVerifierCookies.forEach(c => {
            console.log('[LoginForm]   - Cookie name:', c.name);
            console.log('[LoginForm]   - Cookie value length:', c.value.length);
            console.log('[LoginForm]   - Cookie value (first 20 chars):', c.value.substring(0, 20));
          });
        } else {
          console.warn('[LoginForm] ⚠️ WARNING: No code verifier cookie found after signInWithOAuth!');
          console.warn('[LoginForm] This WILL cause authentication to fail!');
          console.warn('[LoginForm] Available cookie names:', allCookies.map(c => c.name).join(', '));
          
          // Check for any Supabase cookies
          const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
          console.log('[LoginForm] Supabase cookies found:', supabaseCookies.map(c => c.name).join(', '));
        }
        
        console.log('[LoginForm] About to redirect to:', data.url);
        console.log('[LoginForm] ==========================================');
        
        window.location.href = data.url;
      } else {
        console.error('[LoginForm] ❌ No OAuth URL returned from Supabase!');
        console.error('[LoginForm] Data object:', JSON.stringify(data, null, 2));
        setError('Failed to get OAuth URL. Please try again.');
      }
    } catch (err) {
      console.error('[LoginForm] ❌ Exception during Google sign-in:', err);
      console.error('[LoginForm] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(err instanceof Error ? err.message : 'Failed to initiate Google sign-in');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
          Remember me
        </label>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
          <p className="mt-2 text-xs text-red-700">
            Please check your browser console (F12) or terminal for detailed logs.
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </form>
  );
}

