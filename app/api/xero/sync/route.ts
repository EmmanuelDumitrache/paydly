// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

import { fetchXeroInvoices, refreshAccessToken } from '@/lib/xero/client';
import { createClient } from '@/lib/supabase/server';

function isExpired(timestamp: string | null): boolean {
  if (!timestamp) return true;
  return new Date(timestamp).getTime() <= Date.now() + 60 * 1000; // refresh 1 min early
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
  }

  if (!profile.xero_access_token || !profile.xero_refresh_token || !profile.xero_tenant_id) {
    return NextResponse.json({ error: 'Xero is not connected' }, { status: 400 });
  }

  let accessToken = profile.xero_access_token;
  let refreshToken = profile.xero_refresh_token;
  let expiresAt = profile.xero_token_expires_at;

  if (isExpired(expiresAt)) {
    try {
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
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
    } catch (refreshError) {
      return NextResponse.json({ error: 'Failed to refresh Xero tokens' }, { status: 500 });
    }
  }

  try {
    const invoices = await fetchXeroInvoices(accessToken, profile.xero_tenant_id);

    if (!invoices.length) {
      return NextResponse.json({ synced: 0, message: 'No unpaid invoices found in Xero' });
    }

    const rows = invoices
      .filter((invoice) => {
        // Filter out paid invoices and those with no amount due
        return invoice.Status !== 'PAID' && invoice.AmountDue > 0;
      })
      .map((invoice) => {
        // Safely parse the due date
        const dueDate = invoice.DueDate ? 
          new Date(invoice.DueDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];

        return {
          user_id: user.id,
          xero_invoice_id: invoice.InvoiceID,
          invoice_number: invoice.InvoiceNumber || 'N/A',
          contact_name: invoice.Contact?.Name || 'Unknown',
          contact_email: invoice.Contact?.EmailAddress || null,
          amount_due: Number(invoice.AmountDue) || 0,
          total_amount: Number(invoice.Total) || 0,
          currency_code: invoice.CurrencyCode || 'AUD',
          due_date: dueDate,
          status: invoice.Status,
          updated_at: new Date().toISOString(),
        };
      });

    if (!rows.length) {
      return NextResponse.json({ 
        synced: 0, 
        message: 'All invoices are paid or have no amount due' 
      });
    }

    const { error: upsertError } = await supabase
      .from('invoices')
      .upsert(rows, { onConflict: 'user_id,xero_invoice_id' });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      throw upsertError;
    }

    return NextResponse.json({ 
      synced: rows.length,
      message: `Successfully synced ${rows.length} invoice${rows.length === 1 ? '' : 's'}`
    });
  } catch (syncError) {
    console.error('Sync error details:', syncError);
    const message = syncError instanceof Error ? syncError.message : 'Failed to sync invoices';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

