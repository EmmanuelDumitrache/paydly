import { addDays, subDays, formatISO } from 'date-fns';
import type { DashboardStats, Invoice, Profile } from '@/types';

// Mock profile data
export const mockProfile: Profile = {
  id: 'mock-user-id',
  email: 'demo@paydly.com',
  full_name: 'Demo User',
  company_name: 'Demo Company',
  xero_tenant_id: null,
  xero_access_token: null,
  xero_refresh_token: null,
  xero_token_expires_at: null,
  stripe_customer_id: null,
  subscription_status: 'trialing',
  trial_ends_at: addDays(new Date(), 12).toISOString(),
  created_at: subDays(new Date(), 2).toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock dashboard stats
export const mockStats: DashboardStats = {
  total_overdue_invoices: 8,
  total_overdue_amount: 12450.00,
  reminders_sent_this_month: 24,
  average_days_to_payment: 18.5,
  money_recovered_this_month: 8300.00,
};

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    user_id: 'mock-user-id',
    xero_invoice_id: 'INV-001',
    invoice_number: 'INV-2024-001',
    contact_name: 'Acme Corporation',
    contact_email: 'accounts@acme.com',
    amount_due: 2500.00,
    total_amount: 2500.00,
    currency_code: 'AUD',
    due_date: formatISO(subDays(new Date(), 21), { representation: 'date' }),
    status: 'AUTHORISED',
    days_overdue: 21,
    last_reminder_sent_at: subDays(new Date(), 7).toISOString(),
    reminder_count: 2,
    reminders_paused: false,
    created_at: subDays(new Date(), 51).toISOString(),
    updated_at: subDays(new Date(), 7).toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-id',
    xero_invoice_id: 'INV-002',
    invoice_number: 'INV-2024-002',
    contact_name: 'Tech Solutions Ltd',
    contact_email: 'billing@techsolutions.com',
    amount_due: 1850.00,
    total_amount: 1850.00,
    currency_code: 'AUD',
    due_date: formatISO(subDays(new Date(), 14), { representation: 'date' }),
    status: 'AUTHORISED',
    days_overdue: 14,
    last_reminder_sent_at: subDays(new Date(), 1).toISOString(),
    reminder_count: 1,
    reminders_paused: false,
    created_at: subDays(new Date(), 44).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-id',
    xero_invoice_id: 'INV-003',
    invoice_number: 'INV-2024-003',
    contact_name: 'Digital Marketing Co',
    contact_email: 'finance@digitalmarketing.com',
    amount_due: 3200.00,
    total_amount: 3200.00,
    currency_code: 'AUD',
    due_date: formatISO(subDays(new Date(), 12), { representation: 'date' }),
    status: 'AUTHORISED',
    days_overdue: 12,
    last_reminder_sent_at: subDays(new Date(), 5).toISOString(),
    reminder_count: 1,
    reminders_paused: false,
    created_at: subDays(new Date(), 42).toISOString(),
    updated_at: subDays(new Date(), 5).toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-id',
    xero_invoice_id: 'INV-004',
    invoice_number: 'INV-2024-004',
    contact_name: 'Startup Inc',
    contact_email: null,
    amount_due: 950.00,
    total_amount: 950.00,
    currency_code: 'AUD',
    due_date: formatISO(subDays(new Date(), 9), { representation: 'date' }),
    status: 'AUTHORISED',
    days_overdue: 9,
    last_reminder_sent_at: subDays(new Date(), 2).toISOString(),
    reminder_count: 1,
    reminders_paused: false,
    created_at: subDays(new Date(), 39).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-id',
    xero_invoice_id: 'INV-005',
    invoice_number: 'INV-2024-005',
    contact_name: 'Consulting Partners',
    contact_email: 'payables@consulting.com',
    amount_due: 1750.00,
    total_amount: 1750.00,
    currency_code: 'AUD',
    due_date: formatISO(subDays(new Date(), 8), { representation: 'date' }),
    status: 'AUTHORISED',
    days_overdue: 8,
    last_reminder_sent_at: subDays(new Date(), 1).toISOString(),
    reminder_count: 1,
    reminders_paused: false,
    created_at: subDays(new Date(), 38).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
];

// Mock upcoming reminders
export const mockUpcomingReminders = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-006',
    clientName: 'Future Corp',
    reminderType: 'day_7' as const,
    scheduledFor: 'Tomorrow, 9:00 AM',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-007',
    clientName: 'Global Services',
    reminderType: 'day_14' as const,
    scheduledFor: 'Tomorrow, 9:00 AM',
  },
];

// Mock dashboard data function
export function getMockDashboardData() {
  return {
    profile: mockProfile,
    stats: mockStats,
    invoices: mockInvoices,
    upcomingReminders: mockUpcomingReminders,
    xeroConnected: true,
    xeroTenantName: 'Acme Digital Agency (Demo)',
  };
}

