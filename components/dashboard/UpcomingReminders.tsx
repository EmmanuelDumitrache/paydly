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

interface UpcomingRemindersProps {
  reminders: ReminderSchedule[];
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Upcoming reminders</h3>
          <p className="text-sm text-slate-500">
            {reminders.length ? `${reminders.length} reminders scheduled in the next 24 hours.` : 'No reminders scheduled for tomorrow.'}
          </p>
        </div>
      </div>
      {reminders.length ? (
        <ul className="mt-6 space-y-4">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Invoice {reminder.invoiceNumber}</p>
                <p className="text-xs text-slate-500">{reminder.clientName}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-semibold text-indigo-600">{LABELS[reminder.reminderType]}</p>
                <p>{reminder.scheduledFor}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No reminders are scheduled yet. Connect Xero and we’ll line them up automatically.
        </div>
      )}
    </section>
  );
}

