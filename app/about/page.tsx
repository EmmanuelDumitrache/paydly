import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Paydly — Automated Invoice Reminders for Small Businesses',
  description:
    'Paydly helps small businesses get paid faster by automatically sending friendly reminders to clients with overdue invoices. We integrate seamlessly with Xero to sync invoices and send timely reminders.',
  openGraph: {
    title: 'About Paydly — Automated Invoice Reminders',
    description:
      'Paydly helps small businesses get paid faster by automatically sending friendly reminders to clients with overdue invoices.',
    url: '/about',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">About Paydly</h1>
          <p className="mt-4 text-lg text-slate-600">
            Automated invoice reminders for small businesses using Xero.
          </p>
        </div>

        <div className="space-y-6 text-slate-600">
          <p>
            Paydly helps small businesses get paid faster by automatically sending friendly reminders
            to clients with overdue invoices.
          </p>
          
          <p>
            We integrate seamlessly with Xero to sync your invoices and send timely reminders at 7, 14,
            and 21 days overdue - completely hands-free.
          </p>

          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

