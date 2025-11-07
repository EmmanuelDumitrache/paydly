import { formatISO } from 'date-fns';

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

// Mock version for development - returns mock data with filtering
export function fetchInvoicesMock({ status = 'all', search, page = 1, pageSize = 20 }: InvoiceQuery): InvoiceQueryResult {
  let filtered = [...mockInvoices];

  // Filter by status
  if (status === 'overdue') {
    filtered = filtered.filter(inv => inv.status !== 'PAID' && inv.days_overdue > 0);
  } else if (status === 'paid') {
    filtered = filtered.filter(inv => inv.status === 'PAID');
  }

  // Filter by search term
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      inv => inv.invoice_number.toLowerCase().includes(term) ||
             inv.contact_name.toLowerCase().includes(term)
    );
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginated = filtered.slice(from, to);

  return {
    invoices: paginated,
    total: filtered.length,
  };
}

export async function fetchInvoices(
  supabase: SupabaseServerClient,
  { status = 'all', search, page = 1, pageSize = 20 }: InvoiceQuery
): Promise<InvoiceQueryResult> {
  // Use mock data for now - will switch to real Supabase queries later
  return Promise.resolve(fetchInvoicesMock({ status, search, page, pageSize }));

  /* Real Supabase implementation - uncomment when database is ready
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
  */
}

