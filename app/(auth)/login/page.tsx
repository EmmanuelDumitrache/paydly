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
      {errorMessage && (
        <div className="rounded-md bg-red-50 border-2 border-red-300 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-red-800 mb-2">⚠️ Authentication Error</h3>
              <div className="text-sm text-red-700 space-y-2">
                <p className="font-medium bg-red-100 p-2 rounded">{errorMessage}</p>
                <p className="text-xs text-red-600">
                  <strong>Please copy and share:</strong> The full error message above AND the URL shown above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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

