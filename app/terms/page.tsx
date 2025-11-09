import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing and using Paydly, you accept and agree to be bound by the terms and provision
              of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Use of Service</h2>
            <p className="text-slate-600">
              Paydly provides automated invoice reminder services that integrate with your Xero account.
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Service Availability</h2>
            <p className="text-slate-600">
              We strive to provide reliable service but do not guarantee that the service will be
              uninterrupted or error-free. We reserve the right to modify or discontinue the service
              at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Limitation of Liability</h2>
            <p className="text-slate-600">
              Paydly shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Contact</h2>
            <p className="text-slate-600">
              For questions about these Terms of Service, please contact us at{' '}
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

