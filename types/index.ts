export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  xero_tenant_id: string | null;
  xero_access_token: string | null;
  xero_refresh_token: string | null;
  xero_token_expires_at: string | null;
  stripe_customer_id: string | null;
  subscription_status: 'trialing' | 'active' | 'cancelled' | 'past_due';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  xero_invoice_id: string;
  invoice_number: string;
  contact_name: string;
  contact_email: string | null;
  amount_due: number;
  total_amount: number;
  currency_code: string;
  due_date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID';
  days_overdue: number;
  last_reminder_sent_at: string | null;
  reminder_count: number;
  reminders_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  invoice_id: string;
  user_id: string;
  reminder_type: 'day_7' | 'day_14' | 'day_21';
  sent_at: string;
  email_status: 'sent' | 'failed' | 'bounced';
  error_message: string | null;
}

export interface ReminderSettings {
  user_id: string;
  day_7_enabled: boolean;
  day_14_enabled: boolean;
  day_21_enabled: boolean;
  day_7_template: string | null;
  day_14_template: string | null;
  day_21_template: string | null;
  send_from_email: string | null;
  reminders_globally_paused: boolean;
  custom_intervals: {
    day_1: number;
    day_2: number;
    day_3: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CronRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed';
  reminders_sent: number;
  reminders_failed: number;
  invoices_synced: number;
  syncs_failed: number;
  users_processed: number;
  error_message: string | null;
  created_at: string;
}

export interface XeroContact {
  ContactID: string;
  Name: string;
  EmailAddress?: string;
}

export interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber: string;
  Contact: XeroContact;
  Type: 'ACCPAY' | 'ACCREC';
  Status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  DueDate: string;
  AmountDue: number;
  CurrencyCode: string;
  Total: number;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface DashboardStats {
  total_overdue_invoices: number;
  total_overdue_amount: number;
  reminders_sent_this_month: number;
  average_days_to_payment: number;
  money_recovered_this_month: number;
}

