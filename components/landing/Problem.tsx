export function Problem() {
  return (
    <section id="problem" className="bg-white py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Chasing late payments wastes hours every week.
            </h2>
            <p className="text-lg text-slate-600">
              Freelancers spend 2–3 hours weekly checking who owes them, writing awkward follow-up emails, and juggling reminders.
              Meanwhile, cash flow stalls and admin work piles up.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                The manual process
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Manually checking Xero to see who’s overdue</li>
                <li>• Writing reminder emails from scratch</li>
                <li>• Following up multiple times to get paid</li>
                <li>• Money stuck in invoices that should already be paid</li>
              </ul>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-900 p-10 text-white">
            <h3 className="text-lg font-semibold">What if invoices chased themselves?</h3>
            <p className="mt-4 text-base text-slate-100">
              Paydly automates every follow-up. Connect your Xero account once and we’ll send polite reminders at 7, 14, and 21 days overdue.
            </p>
            <p className="mt-6 text-sm text-slate-300">
              Spend more time on billable work and less time copy/pasting invoice numbers into emails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

