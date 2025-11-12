// @ts-nocheck - Supabase generic types cause issues with type inference
import { createClient } from '@/lib/supabase/server';
import { fetchUpcomingInvoices } from '@/lib/data/upcoming';
import { SendPreReminderButton } from '@/components/upcoming/SendPreReminderButton';

export default async function UpcomingPage() {
  const supabase = createClient();
  const upcomingInvoices = await fetchUpcomingInvoices(supabase);

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
        {upcomingInvoices.length ? (
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
                      <SendPreReminderButton invoice={invoice} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-sm text-slate-500">
                No upcoming invoices yet. Connect Xero above and click &apos;Sync now&apos; to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

