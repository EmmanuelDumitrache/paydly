interface XeroConnectProps {
  connected: boolean;
  lastSyncedAt: string | null;
}

export function XeroConnect({ connected, lastSyncedAt }: XeroConnectProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Xero connection</h3>
          {connected ? (
            <p className="mt-1 text-sm text-slate-600">
              ✅ Connected to Xero — Last synced {lastSyncedAt ?? 'just now'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              Connect your Xero account to start syncing invoices and automate reminders.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {connected ? (
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
              type="button"
            >
              Sync now
            </button>
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

