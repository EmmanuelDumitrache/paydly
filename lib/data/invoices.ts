// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays, formatISO } from 'date-fns';
import { cookies } from 'next/headers';

import type { SupabaseServerClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';
import { mockInvoices } from './mock';

export type InvoiceStatusFilter = 'all' | 'overdue' | 'paid';

export interface InvoiceQuery {
  status?: InvoiceStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface InvoiceQueryResult {
  invoices: Invoice[];
  total: number;
}

function parseCurrency(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function fetchInvoices(
  supabase: SupabaseServerClient,
  { status = 'all', search, page = 1, pageSize = 20 }: InvoiceQuery
): Promise<InvoiceQueryResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const today = formatISO(new Date(), { representation: 'date' });

  let isDemo = false;
  try {
    isDemo = cookies().get('paydly_demo')?.value === 'true';
  } catch {
    // Ignore
  }

  if (isDemo || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')) {
    let filtered = [...mockInvoices];
    if (status === 'overdue') {
      filtered = filtered.filter((i) => i.days_overdue > 0 && i.status !== 'PAID');
    } else if (status === 'paid') {
      filtered = filtered.filter((i) => i.status === 'PAID');
    }
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (i) => i.invoice_number.toLowerCase().includes(term) || i.contact_name.toLowerCase().includes(term)
      );
    }
    return {
      invoices: filtered.slice(from, to + 1),
      total: filtered.length,
    };
  }

  console.log('[fetchInvoices] Query params:', { status, search, page, pageSize, today });

  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .order('due_date', { ascending: false })
    .range(from, to);

  if (status === 'overdue') {
    query = query.neq('status', 'PAID').lt('due_date', today);
  }

  if (status === 'paid') {
    console.log('[fetchInvoices] Filtering for PAID invoices');
    query = query.eq('status', 'PAID');
  }

  if (search) {
    const term = `%${search}%`;
    query = query.or(`ilike(invoice_number,${term}),ilike(contact_name,${term})`);
  }

  const { data, error, count } = await query;
  
  console.log('[fetchInvoices] Query result:', { 
    status, 
    count, 
    dataLength: data?.length,
    error: error?.message,
    sampleStatuses: data?.slice(0, 3).map(inv => ({ id: inv.id, status: inv.status }))
  });

  if (error) {
    throw error;
  }

  const invoices: Invoice[] = (data ?? []).map((invoice) => ({
    ...invoice,
    amount_due: parseCurrency(invoice.amount_due),
    total_amount: parseCurrency(invoice.total_amount),
    days_overdue:
      invoice.status !== 'PAID'
        ? Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0)
        : 0,
  }));

  return {
    invoices,
    total: count ?? 0,
  };
}

