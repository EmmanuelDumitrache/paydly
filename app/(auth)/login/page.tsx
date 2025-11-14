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
  const errorMessage =
    errorParam === 'authentication_failed'
      ? 'Authentication failed. Please try again.'
      : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Start your free trial
          </Link>
        </p>
      </div>
      <LoginForm initialError={errorMessage} />
    </div>
  );
}

