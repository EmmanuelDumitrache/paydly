import Link from 'next/link';
import type { Metadata } from 'next';

import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create account • Paydly',
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Start your 14-day free trial</h2>
        <p className="text-sm text-slate-600">
          Already using Paydly?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-xs text-slate-500">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

