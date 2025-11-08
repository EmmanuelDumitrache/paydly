import { differenceInCalendarDays, formatISO } from 'date-fns';

import type { SupabaseServerClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types';

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

  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .order('due_date', { ascending: false })
    .range(from, to);

  if (status === 'overdue') {
    query = query.neq('status', 'PAID').lt('due_date', today);
  }

  if (status === 'paid') {
    query = query.eq('status', 'PAID');
  }

  if (search) {
    const term = `%${search}%`;
    query = query.or(`ilike(invoice_number,${term}),ilike(contact_name,${term})`);
  }

  const { data, error, count } = await query;

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

