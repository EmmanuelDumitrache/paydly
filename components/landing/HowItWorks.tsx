import { Link2, MailCheck, RefreshCcw } from 'lucide-react';

const STEPS = [
  {
    title: 'Connect your Xero account',
    description: 'Authorize Paydly with Xero in 30 seconds. We securely sync your organization and unpaid invoices.',
    icon: Link2,
  },
  {
    title: 'Choose your reminder timings',
    description: 'Set custom intervals that fit your workflow—weekly, bi‑weekly, or your own schedule.',
    icon: RefreshCcw,
  },
  {
    title: 'Paydly sends polite follow-ups',
    description: 'We email polite invoice reminders automatically until paid, and log a clear history for you.',
    icon: MailCheck,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-900 py-20 text-white">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Automate once
          </span>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">How Paydly works</h2>
          <p className="mt-4 text-base text-slate-200">
            Three simple steps to remove late-payment stress for good.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Step {index + 1}</p>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-slate-200">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

