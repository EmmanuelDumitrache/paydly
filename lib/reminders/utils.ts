import type { ReminderType } from '@/lib/email/templates';

export interface ReminderSchedule {
  day_7_enabled: boolean;
  day_14_enabled: boolean;
  day_21_enabled: boolean;
}

export function nextReminderType(
  daysOverdue: number,
  reminderCount: number,
  schedule: ReminderSchedule
): ReminderType | null {
  if (daysOverdue >= 21 && reminderCount < 3 && schedule.day_21_enabled) {
    return 'day_21';
  }
  if (daysOverdue >= 14 && reminderCount < 2 && schedule.day_14_enabled) {
    return 'day_14';
  }
  if (daysOverdue >= 7 && reminderCount < 1 && schedule.day_7_enabled) {
    return 'day_7';
  }
  return null;
}

export function alreadySentToday(timestamp: string | null) {
  if (!timestamp) return false;
  const sent = new Date(timestamp);
  const today = new Date();
  return sent.toDateString() === today.toDateString();
}

