// @ts-nocheck - Supabase generic types cause issues with type inference
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('fullName')?.toString().trim() ?? '';
    const companyName = formData.get('companyName')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          company_name: companyName || null,
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt,
        })
        .eq('id', userId);
    }

    router.replace(`/check-email?email=${encodeURIComponent(email)}`);
    router.refresh();
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    
    try {
      // Use server-side OAuth initiation for proper PKCE cookie handling
      const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const oauthUrl = `${origin}/api/auth/google`;
      
      // Redirect to server-side OAuth route
      window.location.href = oauthUrl;
    } catch (err) {
      setError('Failed to initiate Google sign-up. Please try again.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Jane Smith"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="ABC Consulting"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Create a secure password"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
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
        onClick={handleGoogleSignUp}
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
        Sign up with Google
      </button>

      <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 font-medium text-slate-500">Recruiter &amp; Portfolio Demo</span>
        </div>
      </div>

      <Link
        href="/dashboard?demo=true"
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-indigo-300 bg-indigo-50/70 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:border-indigo-400"
      >
        <span>⚡ Skip Login &amp; View Demo Dashboard</span>
        <span aria-hidden="true">→</span>
      </Link>
    </form>
  );
}

