// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  supabase: SupabaseClient
): Promise<UpcomingInvoice[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];

  // Fetch invoices that are due in the future (not yet due)
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'PAID')
    .gt('due_date', todayISO)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('[fetchUpcomingInvoices] Error:', error);
    return [];
  }

  if (!invoices || invoices.length === 0) {
    return [];
  }

  // Calculate days until due for each invoice
  const upcomingInvoices: UpcomingInvoice[] = invoices.map((invoice) => {
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

  console.log('[fetchUpcomingInvoices] Found', upcomingInvoices.length, 'upcoming invoices');

  return upcomingInvoices;
}

