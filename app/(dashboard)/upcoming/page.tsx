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
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Days Until Due
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {upcomingInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {invoice.contact_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {invoice.currency_code} ${invoice.amount_due.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(invoice.due_date).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {invoice.days_until_due} {invoice.days_until_due === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
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

