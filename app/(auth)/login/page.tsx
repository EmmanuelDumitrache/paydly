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
    errorMessage = errorDetails || 'Sign-in failed. Please try again.';
  } else if (errorParam === 'oauth_init_failed') {
    errorMessage = errorDetails || 'Google sign-in failed. Please try again.';
  } else if (errorParam === 'no_oauth_url') {
    errorMessage = errorDetails || 'Unable to start Google sign-in. Please try again.';
  } else if (errorParam === 'missing_code') {
    errorMessage = 'Sign-in session expired. Please try signing in again.';
  } else if (errorParam === 'no_user') {
    errorMessage = 'Account not found. Please try signing up first.';
  } else if (errorParam === 'no_session') {
    errorMessage = 'Sign-in session expired. Please try signing in again.';
  }

  // Convert technical error messages to user-friendly ones
  const getUserFriendlyMessage = (error: string | null): string | null => {
    if (!error) return null;
    
    const lowerError = error.toLowerCase();
    
    // Map common technical errors to user-friendly messages
    if (lowerError.includes('invalid login credentials') || lowerError.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (lowerError.includes('email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for a confirmation email.';
    }
    if (lowerError.includes('too many requests')) {
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    }
    if (lowerError.includes('authentication failed') || lowerError.includes('code verifier')) {
      return 'Sign-in failed. Please try again or use a different sign-in method.';
    }
    if (lowerError.includes('oauth')) {
      return 'Google sign-in failed. Please try again.';
    }
    
    // Return the error as-is if we don't have a friendly message
    return error;
  };

  const friendlyErrorMessage = getUserFriendlyMessage(errorMessage);

  return (
    <div className="space-y-6">
      {friendlyErrorMessage && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{friendlyErrorMessage}</p>
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

