interface XeroConnectProps {
  connected: boolean;
  lastSyncedAt: string | null;
  tenantName?: string | null;
}

export function XeroConnect({ connected, lastSyncedAt, tenantName }: XeroConnectProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Xero connection</h3>
            {connected && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                ✓ Connected
              </span>
            )}
          </div>
          {connected ? (
            <p className="mt-1 text-sm text-slate-600">
              Connected to <strong>{tenantName || 'Xero'}</strong> • Last synced <strong>{lastSyncedAt ?? 'just now'}</strong>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              Connect your Xero account to start syncing invoices and automate reminders.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {connected ? (
            <form action="/api/xero/sync" method="post">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
                type="submit"
              >
                Sync now
              </button>
            </form>
          ) : (
            <form action="/api/xero/connect" method="post">
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Connect Xero
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

