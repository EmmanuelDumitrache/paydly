import type { ReminderType } from '@/lib/email/templates';

export interface ReminderSchedule {
  day_7_enabled: boolean;
  day_14_enabled: boolean;
  day_21_enabled: boolean;
}

export interface CustomIntervals {
  day_1: number;
  day_2: number;
  day_3: number;
}

export function nextReminderType(
  daysOverdue: number,
  reminderCount: number,
  schedule: ReminderSchedule,
  customIntervals?: CustomIntervals
): ReminderType | null {
  // Use custom intervals if provided, otherwise use defaults
  const intervals = customIntervals || { day_1: 7, day_2: 14, day_3: 21 };

  // Third reminder (day_21)
  if (daysOverdue >= intervals.day_3 && reminderCount < 3 && schedule.day_21_enabled) {
    return 'day_21';
  }
  
  // Second reminder (day_14)
  if (daysOverdue >= intervals.day_2 && reminderCount < 2 && schedule.day_14_enabled) {
    return 'day_14';
  }
  
  // First reminder (day_7)
  if (daysOverdue >= intervals.day_1 && reminderCount < 1 && schedule.day_7_enabled) {
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

