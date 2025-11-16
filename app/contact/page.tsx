import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Paydly. Have questions about automated invoice reminders, Xero integration, or our services? We\'d love to hear from you.',
  openGraph: {
    title: 'Contact Us • Paydly',
    description: 'Get in touch with Paydly. Have questions about automated invoice reminders or Xero integration?',
    url: '/contact',
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-600">
            Have questions? We&apos;d love to hear from you. Get in touch and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Email</h2>
              <p className="mt-2 text-slate-600">
                <a
                  href="mailto:hello@paydly.io"
                  className="text-indigo-600 hover:text-indigo-500 transition"
                >
                  hello@paydly.io
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Support</h2>
              <p className="mt-2 text-slate-600">
                For technical support or questions about your account, email us at{' '}
                <a
                  href="mailto:support@paydly.io"
                  className="text-indigo-600 hover:text-indigo-500 transition"
                >
                  support@paydly.io
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Follow Us</h2>
              <div className="mt-2 flex gap-4">
                <a
                  href="https://twitter.com/paydly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 transition"
                >
                  Twitter
                </a>
                <a
                  href="https://linkedin.com/company/paydly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Get Started</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ready to automate your invoice reminders? Start your 14-day free trial today.
            </p>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

