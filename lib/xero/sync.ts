// @ts-nocheck - Supabase generic types cause issues with type inference
import type { SupabaseServerClient } from '@/lib/supabase/server';

import { fetchXeroInvoices, refreshAccessToken } from './client';

function isExpired(timestamp: string | null): boolean {
  if (!timestamp) return true;
  return new Date(timestamp).getTime() <= Date.now() + 60 * 1000; // refresh 1 min early
}

function parseXeroDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;

  if (typeof raw === 'string') {
    const match = raw.match(/\/Date\((\d+)([+-]\d+)?\)\//);
    if (match) {
      const timestamp = Number(match[1]);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }
  }

  const parsed = new Date(raw as string);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export async function syncXeroInvoicesForUser(
  supabase: SupabaseServerClient,
  userId: string
): Promise<{ synced: number; message: string }> {
  console.info('[xero-sync] Starting invoice sync', { userId });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  if (!profile.xero_access_token || !profile.xero_refresh_token || !profile.xero_tenant_id) {
    throw new Error('Xero is not connected');
  }

  let accessToken = profile.xero_access_token;
  let refreshToken = profile.xero_refresh_token;
  let expiresAt = profile.xero_token_expires_at;

  if (isExpired(expiresAt)) {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    refreshToken = refreshed.refresh_token;
    expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xero_access_token: accessToken,
        xero_refresh_token: refreshToken,
        xero_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }
  }

  const invoices = await fetchXeroInvoices(accessToken, profile.xero_tenant_id);

  console.info('[xero-sync] Invoices fetched from Xero', {
    userId,
    count: invoices.length,
  });

  if (!invoices.length) {
    return {
      synced: 0,
      message: 'No unpaid invoices found in Xero',
    };
  }

  const rows = invoices
    .filter((invoice) => invoice.Status !== 'PAID' && invoice.AmountDue > 0)
    .map((invoice) => {
      const rawDueDate = invoice.DueDate ?? null;
      const parsedDueDate = parseXeroDate(rawDueDate);

      if (!parsedDueDate) {
        console.warn('[xero-sync] Invalid or missing due date, using fallback', {
          userId,
          invoiceId: invoice.InvoiceID,
          invoiceNumber: invoice.InvoiceNumber,
          rawDueDate,
        });
      }

      const dueDateIso = parsedDueDate
        ? parsedDueDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const amountDue = Number(invoice.AmountDue);
      const totalAmount = Number(invoice.Total);

      if (!Number.isFinite(amountDue) || !Number.isFinite(totalAmount)) {
        console.warn('[xero-sync] Non-numeric amount detected', {
          userId,
          invoiceId: invoice.InvoiceID,
          invoiceNumber: invoice.InvoiceNumber,
          amountDue: invoice.AmountDue,
          totalAmount: invoice.Total,
        });
      }

      return {
        user_id: userId,
        xero_invoice_id: invoice.InvoiceID,
        invoice_number: invoice.InvoiceNumber || 'N/A',
        contact_name: invoice.Contact?.Name || 'Unknown',
        contact_email: invoice.Contact?.EmailAddress || null,
        amount_due: Number.isFinite(amountDue) ? amountDue : 0,
        total_amount: Number.isFinite(totalAmount) ? totalAmount : 0,
        currency_code: invoice.CurrencyCode || 'AUD',
        due_date: dueDateIso,
        status: invoice.Status,
        updated_at: new Date().toISOString(),
      };
    });

  console.info('[xero-sync] Prepared invoice rows for upsert', {
    userId,
    rows: rows.length,
  });

  if (!rows.length) {
    return {
      synced: 0,
      message: 'All invoices are paid or have no amount due',
    };
  }

  const { error: upsertError } = await supabase
    .from('invoices')
    .upsert(rows, { onConflict: 'user_id,xero_invoice_id' });

  if (upsertError) {
    console.error('[xero-sync] Supabase upsert error', {
      userId,
      error: upsertError,
    });
    throw upsertError;
  }

  await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userId);

  console.info('[xero-sync] Sync completed successfully', {
    userId,
    synced: rows.length,
  });

  return {
    synced: rows.length,
    message: `Successfully synced ${rows.length} invoice${rows.length === 1 ? '' : 's'}`,
  };
}

