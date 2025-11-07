import { formatISO } from 'date-fns';

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
    amount_due: typeof invoice.amount_due === 'string' ? parseFloat(invoice.amount_due) : invoice.amount_due,
    total_amount: typeof invoice.total_amount === 'string' ? parseFloat(invoice.total_amount) : invoice.total_amount,
  }));

  return {
    invoices,
    total: count ?? 0,
  };
}

