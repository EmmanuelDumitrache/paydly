export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          xero_tenant_id?: string | null;
          xero_access_token?: string | null;
          xero_refresh_token?: string | null;
          xero_token_expires_at?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: 'trialing' | 'active' | 'cancelled' | 'past_due';
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          xero_tenant_id?: string | null;
          xero_access_token?: string | null;
          xero_refresh_token?: string | null;
          xero_token_expires_at?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: 'trialing' | 'active' | 'cancelled' | 'past_due';
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey' | null;
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          xero_invoice_id: string;
          invoice_number: string;
          contact_name: string;
          contact_email: string | null;
          amount_due: string;
          total_amount: string;
          currency_code: string | null;
          due_date: string;
          status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID';
          last_reminder_sent_at: string | null;
          reminder_count: number;
          reminders_paused: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xero_invoice_id: string;
          invoice_number: string;
          contact_name: string;
          contact_email?: string | null;
          amount_due: string;
          total_amount?: string;
          currency_code?: string | null;
          due_date: string;
          status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID';
          last_reminder_sent_at?: string | null;
          reminder_count?: number;
          reminders_paused?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          xero_invoice_id?: string;
          invoice_number?: string;
          contact_name?: string;
          contact_email?: string | null;
          amount_due?: string;
          total_amount?: string;
          currency_code?: string | null;
          due_date?: string;
          status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID';
          last_reminder_sent_at?: string | null;
          reminder_count?: number;
          reminders_paused?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      reminder_logs: {
        Row: {
          id: string;
          invoice_id: string;
          user_id: string;
          reminder_type: 'day_7' | 'day_14' | 'day_21';
          sent_at: string;
          email_status: 'sent' | 'failed' | 'bounced';
          error_message: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          user_id: string;
          reminder_type: 'day_7' | 'day_14' | 'day_21';
          sent_at?: string;
          email_status?: 'sent' | 'failed' | 'bounced';
          error_message?: string | null;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          user_id?: string;
          reminder_type?: 'day_7' | 'day_14' | 'day_21';
          sent_at?: string;
          email_status?: 'sent' | 'failed' | 'bounced';
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reminder_logs_invoice_id_fkey';
            columns: ['invoice_id'];
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminder_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      reminder_settings: {
        Row: {
          user_id: string;
          day_7_enabled: boolean;
          day_14_enabled: boolean;
          day_21_enabled: boolean;
          day_7_template: string | null;
          day_14_template: string | null;
          day_21_template: string | null;
          send_from_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          day_7_enabled?: boolean;
          day_14_enabled?: boolean;
          day_21_enabled?: boolean;
          day_7_template?: string | null;
          day_14_template?: string | null;
          day_21_template?: string | null;
          send_from_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          day_7_enabled?: boolean;
          day_14_enabled?: boolean;
          day_21_enabled?: boolean;
          day_7_template?: string | null;
          day_14_template?: string | null;
          day_21_template?: string | null;
          send_from_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reminder_settings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

