import Link from 'next/link';
import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in • Paydly',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const errorParam = typeof searchParams.error === 'string' ? searchParams.error : null;
  const errorDetails = typeof searchParams.details === 'string' ? searchParams.details : null;
  
  let errorMessage = null;
  if (errorParam === 'authentication_failed') {
    errorMessage = errorDetails 
      ? `Authentication failed: ${errorDetails}`
      : 'Authentication failed. Please try again.';
  } else if (errorParam === 'oauth_init_failed') {
    errorMessage = errorDetails 
      ? `OAuth initialization failed: ${errorDetails}`
      : 'Failed to initialize Google sign-in. Please try again.';
  } else if (errorParam === 'no_oauth_url') {
    errorMessage = 'Failed to get OAuth URL. Please try again.';
  } else if (errorParam === 'missing_code') {
    errorMessage = 'Missing authentication code. Please try signing in again.';
  } else if (errorParam === 'no_user') {
    errorMessage = 'No user found after authentication. Please try again.';
  } else if (errorParam === 'no_session') {
    errorMessage = 'Session could not be established. Please try signing in again.';
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Start your free trial
          </Link>
        </p>
      </div>
      <LoginForm initialError={errorMessage} />
    </div>
  );
}

