// components/history/EmailHistoryTable.tsx

'use client';

import { format } from 'date-fns';

interface EmailHistoryEntry {
  id: string;
  sent_at: string;
  reminder_type: string;
  send_method: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
}

interface EmailHistoryTableProps {
  history: EmailHistoryEntry[];
}

export function EmailHistoryTable({ history }: EmailHistoryTableProps) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-500 shadow-sm">
        No email history found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Timestamp
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Reminder Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Method
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Recipient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Error
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {history.map((entry) => (
            <tr key={entry.id} className={entry.status === 'failed' ? 'bg-rose-50' : 'hover:bg-slate-50'}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">Email</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                {format(new Date(entry.sent_at), 'MMM d, yyyy h:mm a')}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{entry.reminder_type.replace(/_/g, ' ')}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{entry.send_method}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{entry.recipient_email}</td>
              <td className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                entry.status === 'sent' ? 'text-emerald-600' : 'text-rose-600'
              }`}>{entry.status}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-rose-500">
                {entry.status === 'failed' && entry.error_message ? entry.error_message : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
