import type { ReactNode } from 'react';
import Link from 'next/link';

import { SidebarNav } from '@/components/dashboard/SidebarNav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
                Paydly
              </Link>
              <p className="mt-1 text-sm text-slate-500">Automated invoice reminders</p>
            </div>
            <SidebarNav />
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              Reminders run daily at 9am AEST. Keep your Xero connection active for best results.
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}

