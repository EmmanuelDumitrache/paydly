import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check your email • Paydly',
};

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const email = typeof searchParams.email === 'string' ? searchParams.email : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Check your inbox</h2>
          <p className="text-sm text-slate-600">
            {email ? (
              <>
                We&apos;ve sent a confirmation email to <span className="font-medium text-slate-900">{email}</span>.
                Please click the link in the email to verify your account.
              </>
            ) : (
              <>
                We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to verify your
                account.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Didn&apos;t receive the email?</strong> Check your spam folder or wait a few minutes for it to
              arrive.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

