import Link from 'next/link';

const FEATURES = [
  'Unlimited invoices and reminders',
  'Xero integration included',
  'Daily reminder automation at 7 / 14 / 21 days',
  'Email support from real humans',
  'Cancel anytime during the trial',
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Simple pricing
        </span>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
          $29/month. Flat. Unlimited.
        </h2>
        <p className="mt-4 text-base text-slate-600">
          Start with a 14-day free trial. No card required. Keep Paydly running for $29/month once you see faster payments.
        </p>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-left shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Paydly Pro</p>
              <div className="mt-2 flex items-end gap-2 text-slate-900">
                <span className="text-5xl font-semibold">$29</span>
                <span className="pb-2 text-sm text-slate-500">per month</span>
              </div>
            </div>
            <Link
              href="/signup"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Start free trial
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">14-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

