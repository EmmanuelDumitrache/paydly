// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays } from 'date-fns';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mockUpcomingReminders } from './mock';

export interface UpcomingInvoice {
  id: string;
  invoice_number: string;
  contact_name: string;
  contact_email: string | null;
  amount_due: number;
  currency_code: string;
  due_date: string;
  days_until_due: number;
  status: string;
}

export async function fetchUpcomingInvoices(
  supabase: SupabaseClient,
  options: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ invoices: UpcomingInvoice[]; total: number }> {
  const { page = 1, pageSize = 10 } = options;
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isDemo = false;
  try {
    isDemo = cookies().get('paydly_demo')?.value === 'true';
  } catch {
    // Ignore
  }

  if (!user || isDemo) {
    const mockUpcoming: UpcomingInvoice[] = mockUpcomingReminders.map((r, idx) => ({
      id: r.id,
      invoice_number: r.invoiceNumber,
      contact_name: r.clientName,
      contact_email: 'accounts@client.com',
      amount_due: 1450.00 + idx * 500,
      currency_code: 'AUD',
      due_date: new Date(Date.now() + 86400000 * (idx + 1)).toISOString().split('T')[0],
      days_until_due: idx + 1,
      status: 'AUTHORISED',
    }));
    return { invoices: mockUpcoming, total: mockUpcoming.length };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];

  // Fetch invoices that are due in the future (not yet due) with count
  const { data: invoices, error, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .neq('status', 'PAID')
    .gt('due_date', todayISO)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('[fetchUpcomingInvoices] Error:', error);
    return { invoices: [], total: 0 };
  }

  if (!invoices || invoices.length === 0) {
    return { invoices: [], total: 0 };
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

  // Calculate days until due for each invoice
  const upcomingInvoices: UpcomingInvoice[] = paginatedInvoices.map((invoice) => {
    const dueDate = new Date(invoice.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntilDue = differenceInCalendarDays(dueDate, today);

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      contact_name: invoice.contact_name,
      contact_email: invoice.contact_email,
      amount_due: typeof invoice.amount_due === 'string' 
        ? parseFloat(invoice.amount_due) 
        : invoice.amount_due,
      currency_code: invoice.currency_code || 'AUD',
      due_date: invoice.due_date,
      days_until_due: daysUntilDue,
      status: invoice.status,
    };
  });

  console.log('[fetchUpcomingInvoices] Found', upcomingInvoices.length, 'upcoming invoices (page', page, 'of', Math.ceil((count || invoices.length) / pageSize), ')');

  return {
    invoices: upcomingInvoices,
    total: count || invoices.length,
  };
}

