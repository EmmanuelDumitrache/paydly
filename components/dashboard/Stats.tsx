import type { DashboardStats } from '@/types';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
});

interface StatsProps {
  stats: DashboardStats;
}

export function Stats({ stats }: StatsProps) {
  const cards = [
    {
      label: 'Overdue invoices',
      primary: stats.total_overdue_invoices.toLocaleString(),
      secondary: formatter.format(stats.total_overdue_amount),
    },
    {
      label: 'Reminders sent this month',
      primary: stats.reminders_sent_this_month.toLocaleString(),
      secondary: 'Automated',
    },
    {
      label: 'Average days to payment',
      primary: stats.average_days_to_payment.toFixed(1),
      secondary: 'vs. 23 day avg',
    },
    {
      label: 'Money recovered this month',
      primary: formatter.format(stats.money_recovered_this_month),
      secondary: 'Paid via reminders',
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{card.primary}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{card.secondary}</p>
        </div>
      ))}
    </section>
  );
}

