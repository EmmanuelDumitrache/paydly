-- Add xero_tenant_name column to profiles table
alter table profiles
add column if not exists xero_tenant_name text;

