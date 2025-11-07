export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Manage your Paydly subscription and view upcoming invoices.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Billing history and invoice downloads are coming soon. In the meantime, use the “Manage subscription” button in settings to update payment details or cancel.
        </p>
      </div>
    </div>
  );
}

