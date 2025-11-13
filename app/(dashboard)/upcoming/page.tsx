// @ts-nocheck - Supabase generic types cause issues with type inference
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchUpcomingInvoices } from '@/lib/data/upcoming';
import { UpcomingInvoiceActions } from '@/components/upcoming/UpcomingInvoiceActions';

const PAGE_SIZE = 10;

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

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pageParam = typeof searchParams.page === 'string' ? Number.parseInt(searchParams.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const supabase = createClient();
  const { invoices: upcomingInvoices, total } = await fetchUpcomingInvoices(supabase, {
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();

  console.log('[UpcomingPage] Rendering with', upcomingInvoices.length, 'upcoming invoices');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upcoming Invoices</h1>
        <p className="text-sm text-slate-500">
          {upcomingInvoices.length 
            ? `${upcomingInvoices.length} invoice${upcomingInvoices.length === 1 ? '' : 's'} due in the future` 
            : 'No upcoming invoices'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Invoice
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Client
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Due Date
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Days Until Due
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {upcomingInvoices.length > 0 ? (
                <>
                  {upcomingInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="max-w-[200px] truncate">{invoice.contact_name}</div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {invoice.currency_code} ${invoice.amount_due.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {new Date(invoice.due_date).toLocaleDateString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {invoice.days_until_due} {invoice.days_until_due === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        <UpcomingInvoiceActions invoice={invoice} />
                      </td>
                    </tr>
                  ))}
                  {/* Fill empty rows to maintain consistent height */}
                  {Array.from({ length: Math.max(0, PAGE_SIZE - upcomingInvoices.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-[73px]">
                      <td className="px-4 py-4" colSpan={6}>&nbsp;</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No upcoming invoices yet. Connect Xero above and click &apos;Sync now&apos; to get started.
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

