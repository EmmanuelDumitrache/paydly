const FEATURES = [
  {
    title: 'Automatic Xero sync',
    description: 'Invoices update in real-time so you always know who owes you money.',
  },
  {
    title: 'Smart reminders',
    description: 'Polite 7-day nudges, firmer 21-day notices, all personalised for your business.',
  },
  {
    title: 'Pause anytime',
    description: 'Stop reminders for specific clients or invoices with one click.',
  },
  {
    title: 'Track everything',
    description: 'See who pays late, when reminders were sent, and what’s scheduled next.',
  },
  {
    title: 'Set & forget',
    description: 'Runs in the background every day at 00:00 UTC—no workflow changes required.',
  },
  {
    title: 'Unlimited invoices',
    description: 'Send as many reminders as you need. No charge per client or message.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Why teams choose Paydly
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Every reminder handled for you
          </h2>
          <p className="mt-4 text-base text-slate-600">
            From the first friendly nudge to the final notice, Paydly manages the entire follow-up cadence.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                ✓
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

