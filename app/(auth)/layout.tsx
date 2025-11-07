import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10 lg:mx-0">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back to Paydly</h1>
            <p className="mt-2 text-sm text-slate-600">Automate your invoice reminders and get paid faster.</p>
          </div>
          {children}
        </div>
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="rounded-3xl bg-indigo-600 p-10 text-white shadow-xl">
            <h2 className="text-3xl font-semibold">“Set it once, never chase invoices again.”</h2>
            <p className="mt-6 text-base text-indigo-100">
              Paydly connects to your Xero account, keeps tabs on overdue invoices, and sends polite reminders so you can focus on billable work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

