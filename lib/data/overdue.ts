// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays, formatISO } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Invoice } from '@/types';
import { mockInvoices } from './mock';

function parseCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchOverdueInvoices(
  supabase: SupabaseClient,
  options: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ invoices: Invoice[]; total: number }> {
  const { page = 1, pageSize = 10 } = options;
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const overdue = mockInvoices.filter((i) => i.days_overdue > 0);
    const startIndex = (page - 1) * pageSize;
    return {
      invoices: overdue.slice(startIndex, startIndex + pageSize),
      total: overdue.length,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = formatISO(today, { representation: 'date' });

  // Fetch all overdue invoices with count
  const { data: allInvoicesRows, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .neq('status', 'PAID')
    .lt('due_date', todayISO)
    .order('due_date', { ascending: true });

  if (!allInvoicesRows) {
    return { invoices: [], total: 0 };
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = allInvoicesRows.slice(startIndex, endIndex);

  const invoices: Invoice[] = paginatedRows.map((invoice) => {
    const daysOverdue = Math.max(
      differenceInCalendarDays(new Date(), new Date(invoice.due_date)),
      0
    );

    return {
      ...invoice,
      amount_due: parseCurrency(invoice.amount_due),
      total_amount: parseCurrency(invoice.total_amount),
      days_overdue: daysOverdue,
    };
  });

  return {
    invoices,
    total: count || allInvoicesRows.length,
  };
}

