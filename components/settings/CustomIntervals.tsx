'use client';

import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface CustomIntervalsProps {
  initialIntervals: {
    day_1: number;
    day_2: number;
    day_3: number;
  };
}

export function CustomIntervals({ initialIntervals }: CustomIntervalsProps) {
  const [day1, setDay1] = useState(initialIntervals.day_1);
  const [day2, setDay2] = useState(initialIntervals.day_2);
  const [day3, setDay3] = useState(initialIntervals.day_3);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (day1 < 1 || day1 > 90) return 'First reminder must be between 1-90 days';
    if (day2 < 1 || day2 > 90) return 'Second reminder must be between 1-90 days';
    if (day3 < 1 || day3 > 90) return 'Third reminder must be between 1-90 days';
    if (day2 <= day1) return 'Second reminder must be after first reminder';
    if (day3 <= day2) return 'Third reminder must be after second reminder';
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append('day_1', day1.toString());
      formData.append('day_2', day2.toString());
      formData.append('day_3', day3.toString());

      const response = await fetch('/api/settings/custom-intervals', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save intervals');
      }
    } catch (err) {
      console.error('[CustomIntervals] Error:', err);
      setError('Failed to save intervals');
    } finally {
      setLoading(false);
    }
  };

  const validationError = validate();
  const hasChanges = 
    day1 !== initialIntervals.day_1 || 
    day2 !== initialIntervals.day_2 || 
    day3 !== initialIntervals.day_3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Custom Reminder Schedule</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose when to send reminders after an invoice becomes overdue
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="day_1" className="block text-sm font-medium text-slate-700">
              First Reminder
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="day_1"
                type="number"
                min="1"
                max="90"
                value={day1}
                onChange={(e) => setDay1(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <span className="text-sm text-slate-500">days</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">After due date</p>
          </div>

          <div>
            <label htmlFor="day_2" className="block text-sm font-medium text-slate-700">
              Second Reminder
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="day_2"
                type="number"
                min="1"
                max="90"
                value={day2}
                onChange={(e) => setDay2(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <span className="text-sm text-slate-500">days</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">After due date</p>
          </div>

          <div>
            <label htmlFor="day_3" className="block text-sm font-medium text-slate-700">
              Third Reminder
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="day_3"
                type="number"
                min="1"
                max="90"
                value={day3}
                onChange={(e) => setDay3(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <span className="text-sm text-slate-500">days</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">After due date</p>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
          <p className="mt-2 text-sm text-slate-700">
            Reminders will be sent <strong>{day1} days</strong>, <strong>{day2} days</strong>, and{' '}
            <strong>{day3} days</strong> after an invoice becomes overdue.
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-sm text-rose-700">{validationError}</p>
          </div>
        )}

        {/* API Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-700">Schedule saved successfully!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !hasChanges || validationError !== null}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </form>
    </div>
  );
}

