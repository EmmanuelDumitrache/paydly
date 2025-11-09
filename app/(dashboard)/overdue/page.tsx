// @ts-nocheck - Supabase generic types cause issues with type inference
import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';

import { getDashboardData } from '@/lib/data/dashboard';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';

function getStatusBadge(status: Invoice['status'], daysOverdue: number) {
  if (status === 'PAID') {
    return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' };
  }

  if (daysOverdue > 0) {
    return { label: 'Overdue', className: 'bg-rose-100 text-rose-700' };
  }

  return { label: 'Due soon', className: 'bg-amber-100 text-amber-700' };
}

export default async function OverduePage() {
  const supabase = createClient();
  const { invoices } = await getDashboardData(supabase);

  console.log('[OverduePage] Rendering with invoices:', invoices);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overdue Invoices</h1>
        <p className="text-sm text-slate-500">
          {invoices.length 
            ? `${invoices.length} overdue invoice${invoices.length === 1 ? '' : 's'} requiring attention` 
            : 'No overdue invoices'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Top 10 Overdue Invoices</h3>
            <p className="text-sm text-slate-500">Invoices past their due date needing attention.</p>
          </div>
          <Link
            href="/invoices"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            View all invoices →
          </Link>
        </div>

        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Invoice</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Client</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Due date</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Days overdue</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Last reminder</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {invoices.map((invoice) => {
                  const badge = getStatusBadge(invoice.status, invoice.days_overdue);
                  return (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="font-medium text-slate-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{invoice.contact_name}</div>
                        <div className="text-xs text-slate-500">{invoice.contact_email ?? 'No email on file'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ${invoice.amount_due.toFixed(2)} {invoice.currency_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(invoice.due_date), 'd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-rose-600">{invoice.days_overdue} days</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {invoice.last_reminder_sent_at
                          ? `${formatDistanceToNowStrict(new Date(invoice.last_reminder_sent_at))} ago`
                          : 'Not sent'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                          >
                            Pause
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-sm text-slate-500">
                No overdue invoices found. Connect Xero and sync your invoices to see overdue items.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

