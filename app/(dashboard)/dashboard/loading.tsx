export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

