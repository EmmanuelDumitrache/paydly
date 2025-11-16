import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-indigo-600 py-20 text-white">
      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl">Automate invoice reminders from Xero.</h2>
        <p className="mt-4 text-base text-indigo-100">
          Automate payment follow‑ups from Xero with custom intervals. Start in minutes—no credit card needed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-100 animate-glow-soft"
          >
            Start free trial
          </Link>
          <span className="text-sm text-indigo-100">Cancel anytime. No credit card required.</span>
        </div>
      </div>
    </section>
  );
}

