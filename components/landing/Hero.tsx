import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 text-white" id="hero">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-transparent to-slate-900" />
        <div className="absolute -bottom-48 right-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-24 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Get paid faster
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Stop chasing late payments. Get paid 40% faster with Paydly.
          </h1>
          <p className="max-w-xl text-lg text-indigo-100">
            Paydly connects to your Xero account, tracks overdue invoices, and sends polite reminders at 7, 14, and 21 days overdue. Set it once and focus on billable work.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="relative rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-indigo-100 animate-glow"
            >
              Start 14-day free trial
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Unlimited invoices & reminders
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              No credit card required
            </div>
          </div>
        </div>
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-indigo-200">Automations in progress</p>
            <ul className="space-y-3 text-sm text-indigo-100">
              <li className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">Invoice INV-0234</span>
                <span className="text-xs text-indigo-200">14-day reminder sent</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">Invoice INV-0198</span>
                <span className="text-xs text-indigo-200">Scheduled for tomorrow</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">Invoice INV-0156</span>
                <span className="text-xs text-indigo-200">Payment received</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

