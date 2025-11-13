// @ts-nocheck - Supabase generic types cause issues with type inference
import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';

import { fetchOverdueInvoices } from '@/lib/data/overdue';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';
import { OverdueInvoiceActions } from '@/components/overdue/OverdueInvoiceActions';

const PAGE_SIZE = 10;

function getStatusBadge(status: Invoice['status'], daysOverdue: number) {
  if (status === 'PAID') {
    return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' };
  }

  if (daysOverdue > 0) {
    return { label: 'Overdue', className: 'bg-rose-100 text-rose-700' };
  }

  return { label: 'Due soon', className: 'bg-amber-100 text-amber-700' };
}

function buildLinkParams(params: URLSearchParams, updates: Record<string, string | undefined>) {
  const nextParams = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  });
  return `?${nextParams.toString()}`;
}

export default async function OverduePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pageParam = typeof searchParams.page === 'string' ? Number.parseInt(searchParams.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const supabase = createClient();
  const { invoices, total } = await fetchOverdueInvoices(supabase, {
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: profile } = await supabase.from('profiles').select('email').maybeSingle();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();

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
            <h3 className="text-lg font-semibold text-slate-900">Overdue Invoices</h3>
            <p className="text-sm text-slate-500">Invoices past their due date needing attention.</p>
          </div>
          <Link
            href="/invoices"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            View all invoices →
          </Link>
        </div>

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
              {invoices.length > 0 ? (
                <>
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
                          <OverdueInvoiceActions
                            invoice={invoice}
                            fallbackEmail={profile?.email ?? null}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fill empty rows to maintain consistent height */}
                  {Array.from({ length: Math.max(0, PAGE_SIZE - invoices.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-[73px]">
                      <td className="px-4 py-4" colSpan={7}>&nbsp;</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No overdue invoices yet. Connect Xero above and click &apos;Sync now&apos; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          {total === 0
            ? 'No invoices to display yet.'
            : `Showing ${(page - 1) * PAGE_SIZE + 1} – ${Math.min(page * PAGE_SIZE, total)} of ${total} invoices`}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildLinkParams(params, { page: page > 1 ? String(page - 1) : undefined })}
            aria-disabled={page <= 1}
            className={`rounded-full border border-slate-200 px-3 py-1 font-medium transition ${
              page <= 1 ? 'pointer-events-none opacity-50' : 'hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            Previous
          </Link>
          <span>
            Page {page} of {totalPages}
          </span>
          <Link
            href={buildLinkParams(params, { page: page < totalPages ? String(page + 1) : undefined })}
            aria-disabled={page >= totalPages}
            className={`rounded-full border border-slate-200 px-3 py-1 font-medium transition ${
              page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

