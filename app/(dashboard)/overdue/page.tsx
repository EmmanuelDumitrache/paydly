// @ts-nocheck - Supabase generic types cause issues with type inference
import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';

import { getDashboardData } from '@/lib/data/dashboard';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';
import { SendReminderButton } from '@/components/overdue/SendReminderButton';

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
  const { invoices, profile } = await getDashboardData(supabase);

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
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Client</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Due date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Days overdue</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Last reminder</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {invoices.map((invoice) => {
                  const badge = getStatusBadge(invoice.status, invoice.days_overdue);
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-900">{invoice.invoice_number}</span>
                          <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[180px]">
                          <div className="text-sm font-medium text-slate-900 truncate">{invoice.contact_name}</div>
                          <div className="text-xs text-slate-500 truncate">{invoice.contact_email ?? 'No email'}</div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        ${invoice.amount_due.toFixed(2)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(invoice.due_date), 'd MMM')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-rose-600">
                        {invoice.days_overdue}d
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                        {invoice.last_reminder_sent_at
                          ? `${formatDistanceToNowStrict(new Date(invoice.last_reminder_sent_at))} ago`
                          : 'Not sent'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col gap-2 items-end">
                          <SendReminderButton
                            invoiceId={invoice.id}
                            invoiceNumber={invoice.invoice_number}
                            contactEmail={invoice.contact_email}
                            fallbackEmail={profile?.email ?? null}
                          />
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
                No overdue invoices yet. Connect Xero above and click &apos;Sync now&apos; to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

