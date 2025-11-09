const { createClient } = require('@supabase/supabase-js');

const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';

async function refreshToken(profile, clientId, clientSecret) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: profile.xero_refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function fetchInvoices(accessToken, tenantId) {
  const params = new URLSearchParams({
    where: 'Status!="PAID"&&AmountDue>0',
    order: 'DueDate ASC',
  });

  const res = await fetch(`${XERO_API_BASE}/Invoices?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Xero invoices: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return json.Invoices || [];
}

function parseXeroDate(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.startsWith('/Date(')) {
    const match = value.match(/\/Date\((\d+)/);
    if (match) {
      const timestamp = Number(match[1]);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }
  }
  return new Date(value);
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const userId = process.env.USER_ID;
  if (!serviceKey || !clientId || !clientSecret || !userId) {
    throw new Error('Missing required environment variables');
  }

  const supabase = createClient('https://xsvuqporgkddggmkasgh.supabase.co', serviceKey, {
    auth: { persistSession: false },
  });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(`Profile not found: ${profileError?.message}`);
  }

  if (!profile.xero_access_token || !profile.xero_refresh_token || !profile.xero_tenant_id) {
    throw new Error('Xero connection not configured for this user');
  }

  let accessToken = profile.xero_access_token;
  let refreshTokenValue = profile.xero_refresh_token;
  let expiresAt = profile.xero_token_expires_at ? new Date(profile.xero_token_expires_at).getTime() : 0;

  const now = Date.now();
  if (!expiresAt || expiresAt <= now + 60 * 1000) {
    console.log('Refreshing Xero tokens...');
    const refreshed = await refreshToken(profile, clientId, clientSecret);
    accessToken = refreshed.access_token;
    refreshTokenValue = refreshed.refresh_token;
    expiresAt = now + refreshed.expires_in * 1000;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xero_access_token: accessToken,
        xero_refresh_token: refreshTokenValue,
        xero_token_expires_at: new Date(expiresAt).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }
  }

  console.log('Fetching invoices from Xero...');
  const invoices = await fetchInvoices(accessToken, profile.xero_tenant_id);
  console.log(`Fetched ${invoices.length} invoices`);

  console.log('[runXeroSync] Raw invoice sample:', invoices.slice(0, 5).map(inv => ({
    InvoiceNumber: inv.InvoiceNumber,
    DueDate: inv.DueDate,
    Status: inv.Status,
    AmountDue: inv.AmountDue,
    Contact: {
      Name: inv.Contact?.Name,
      EmailAddress: inv.Contact?.EmailAddress,
      EmailAddresses: inv.Contact?.EmailAddresses,
      FirstName: inv.Contact?.FirstName,
      LastName: inv.Contact?.LastName,
    }
  })));

  const rows = invoices
    .filter((invoice) => invoice.Status !== 'PAID' && invoice.AmountDue > 0)
    .map((invoice) => {
      const due = parseXeroDate(invoice.DueDate);
      console.log('[runXeroSync] Parsed due date:', { invoice: invoice.InvoiceNumber, raw: invoice.DueDate, parsed: due ? due.toISOString() : null });
      const dueDate = due ? due.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const contactNameRaw = invoice.Contact?.Name?.trim() ?? '';
      const contactEmailRaw = invoice.Contact?.EmailAddress?.trim() ?? '';
      const fallbackEmailFromName =
        contactNameRaw && contactNameRaw.includes('@') ? contactNameRaw : null;
      const contactEmail = contactEmailRaw || fallbackEmailFromName;
      const derivedNameFromParts = `${invoice.Contact?.FirstName ?? ''} ${invoice.Contact?.LastName ?? ''}`.trim();
      const contactName =
        (contactNameRaw && !contactNameRaw.includes('@') && contactNameRaw) ||
        (derivedNameFromParts.length ? derivedNameFromParts : '') ||
        contactEmail ||
        'Unknown';

      console.log('[runXeroSync] Contact parsing:', {
        invoice: invoice.InvoiceNumber,
        contactNameRaw,
        contactEmailRaw,
        fallbackEmailFromName,
        contactEmail,
        contactName,
      });

      return {
        user_id: userId,
        xero_invoice_id: invoice.InvoiceID,
        invoice_number: invoice.InvoiceNumber || 'N/A',
        contact_name: contactName,
        contact_email: contactEmail,
        amount_due: Number(invoice.AmountDue) || 0,
        total_amount: Number(invoice.Total) || 0,
        currency_code: invoice.CurrencyCode || 'AUD',
        due_date: dueDate,
        status: invoice.Status,
        reminders_paused: false,
        reminder_count: invoice.ReminderCount ?? 0,
        updated_at: new Date().toISOString(),
      };
    });

  console.log(`Upserting ${rows.length} invoices into Supabase...`);
  const { error: upsertError } = await supabase
    .from('invoices')
    .upsert(rows, { onConflict: 'user_id,xero_invoice_id' });

  if (upsertError) {
    throw new Error(`Failed to upsert invoices: ${upsertError.message}`);
  }

  console.log('Sync complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
