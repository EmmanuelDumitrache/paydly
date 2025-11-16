export function Problem() {
  return (
    <section id="problem" className="bg-white py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Late payments slow cash flow.</h2>
            <p className="text-lg text-slate-600">
              Checking who’s overdue, writing follow‑ups, and juggling reminders is manual and inconsistent.
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
            <h3 className="text-lg font-semibold">Let invoice reminders run themselves.</h3>
            <p className="mt-4 text-base text-slate-100">
              Paydly automates every follow‑up. Connect Xero once and we’ll send polite invoice reminders at custom intervals until paid.
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

