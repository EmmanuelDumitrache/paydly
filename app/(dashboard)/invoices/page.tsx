import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';

import { fetchInvoices, type InvoiceStatusFilter } from '@/lib/data/invoices';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';

const PAGE_SIZE = 20;
const STATUS_TABS: { value: InvoiceStatusFilter; label: string }[] = [
  { value: 'all', label: 'All invoices' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
];

function getReminderStatus(invoice: Invoice) {
  if (invoice.reminders_paused) {
    return 'Paused';
  }
  if (invoice.last_reminder_sent_at) {
    return `Last sent ${formatDistanceToNowStrict(new Date(invoice.last_reminder_sent_at))} ago`;
  }
  if (invoice.status === 'PAID') {
    return 'Paid';
  }
  return 'Never sent';
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

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const statusParam = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const status = STATUS_TABS.some((tab) => tab.value === statusParam) ? (statusParam as InvoiceStatusFilter) : 'all';
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const pageParam = typeof searchParams.page === 'string' ? Number.parseInt(searchParams.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Using mock data for now - supabase parameter not used
  const { invoices, total } = await fetchInvoices(null as any, {
    status,
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (search) params.set('search', search);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">Manage reminders, pause follow-ups, and keep an eye on overdue invoices.</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1">
          {STATUS_TABS.map((tab) => {
            const tabParams = buildLinkParams(params, { status: tab.value === 'all' ? undefined : tab.value, page: undefined });
            const isActive = status === tab.value;
            return (
              <Link
                key={tab.value}
                href={tabParams}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <form method="get" className="flex w-full max-w-sm items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by client or invoice #"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3">Invoice</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Due date</th>
              <th scope="col" className="px-6 py-3">Days overdue</th>
              <th scope="col" className="px-6 py-3">Reminder status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length ? (
              invoices.map((invoice) => {
                const reminderStatus = getReminderStatus(invoice);
                const overdue = invoice.status !== 'PAID' && invoice.days_overdue > 0;
                const statusClass = overdue
                  ? 'bg-rose-100 text-rose-700'
                  : invoice.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700';

                return (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>
                          {invoice.status === 'PAID' ? 'Paid' : overdue ? 'Overdue' : 'Due soon'}
                        </span>
                        <span className="font-semibold text-slate-900">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{invoice.contact_name}</div>
                      <div className="text-xs text-slate-500">{invoice.contact_email ?? 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${invoice.amount_due.toFixed(2)} {invoice.currency_code}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{format(new Date(invoice.due_date), 'd MMM yyyy')}</td>
                    <td className="px-6 py-4 text-slate-600">{invoice.days_overdue} days</td>
                    <td className="px-6 py-4 text-slate-500">{reminderStatus}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                        >
                          {invoice.reminders_paused ? 'Resume' : 'Pause'}
                        </button>
                        <a
                          href={`https://go.xero.com/AccountsReceivable/Edit.aspx?invoiceID=${invoice.xero_invoice_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                        >
                          View in Xero
                        </a>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                        >
                          Mark as paid
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                  No invoices found. Connect Xero to start syncing invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          Showing {(page - 1) * PAGE_SIZE + 1} –
          {Math.min(page * PAGE_SIZE, total)} of {total} invoices
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

