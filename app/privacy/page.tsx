import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Paydly Privacy Policy. Learn how we collect, use, and protect your personal information and Xero account data.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy • Paydly',
    description: 'Paydly Privacy Policy. Learn how we collect, use, and protect your personal information.',
    url: '/privacy',
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
            <p className="text-slate-600">
              We collect information you provide directly to us, including your name, email address,
              company information, and Xero account data necessary to provide our invoice reminder service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Information</h2>
            <p className="text-slate-600">
              We use the information we collect to provide, maintain, and improve our services, including
              syncing invoices from Xero and sending automated reminders to your clients.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Data Security</h2>
            <p className="text-slate-600">
              We take reasonable measures to help protect your personal information from loss, theft,
              misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@paydly.com" className="text-indigo-600 hover:text-indigo-500">
                hello@paydly.com
              </a>
            </p>
          </section>
        </div>

        <div className="pt-8">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

