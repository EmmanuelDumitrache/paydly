// @ts-nocheck - Supabase generic types cause issues with type inference
import { getDashboardData } from '@/lib/data/dashboard';
import { createClient } from '@/lib/supabase/server';

type ReminderSchedule = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  reminderType: 'day_7' | 'day_14' | 'day_21';
  scheduledFor: string;
};

const LABELS: Record<ReminderSchedule['reminderType'], string> = {
  day_7: '7-day reminder',
  day_14: '14-day reminder',
  day_21: '21-day reminder',
};

export default async function UpcomingPage() {
  const supabase = createClient();
  const { upcomingReminders } = await getDashboardData(supabase);

  console.log('[UpcomingPage] Rendering with reminders:', upcomingReminders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upcoming Reminders</h1>
        <p className="text-sm text-slate-500">
          {upcomingReminders.length 
            ? `${upcomingReminders.length} reminder${upcomingReminders.length === 1 ? '' : 's'} scheduled to be sent in the next 24 hours` 
            : 'No reminders scheduled for the next 24 hours'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {upcomingReminders.length ? (
          <ul className="space-y-4">
            {upcomingReminders.map((reminder) => (
              <li 
                key={reminder.id} 
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Invoice {reminder.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500">{reminder.clientName}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-indigo-600">
                    {LABELS[reminder.reminderType]}
                  </p>
                  <p>{reminder.scheduledFor}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-sm text-slate-500">
              No reminders scheduled yet. Connect Xero above and click 'Sync now' to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

