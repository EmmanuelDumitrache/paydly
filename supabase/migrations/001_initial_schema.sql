-- Users table is managed by Supabase Auth (auth.users)

-- User profiles
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  xero_tenant_id text unique,
  xero_access_token text,
  xero_refresh_token text,
  xero_token_expires_at timestamptz,
  stripe_customer_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default now() + interval '14 days',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoices synced from Xero
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  xero_invoice_id text not null,
  invoice_number text not null,
  contact_name text not null,
  contact_email text,
  amount_due numeric(10, 2) not null,
  total_amount numeric(10, 2) not null default 0,
  currency_code text default 'AUD',
  due_date date not null,
  status text not null,
  days_overdue integer generated always as (
    case
      when status != 'PAID' and due_date < current_date then current_date - due_date
      else 0
    end
  ) stored,
  last_reminder_sent_at timestamptz,
  reminder_count integer default 0,
  reminders_paused boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, xero_invoice_id)
);

-- Reminder history
create table if not exists reminder_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  reminder_type text not null,
  sent_at timestamptz default now(),
  email_status text default 'sent',
  error_message text
);

-- User settings
create table if not exists reminder_settings (
  user_id uuid primary key references profiles (id) on delete cascade,
  day_7_enabled boolean default true,
  day_14_enabled boolean default true,
  day_21_enabled boolean default true,
  day_7_template text,
  day_14_template text,
  day_21_template text,
  send_from_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Triggers to create profile and settings on new auth user
create or replace function public.handle_new_user()
returns trigger as
$$
begin
  insert into profiles (id, email)
  values (new.id, new.email);

  insert into reminder_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Indexes
create index if not exists idx_invoices_user_id on invoices (user_id);
create index if not exists idx_invoices_status on invoices (status);
create index if not exists idx_invoices_due_date on invoices (due_date);
create index if not exists idx_invoices_overdue on invoices (user_id, status, due_date)
  where status != 'PAID' and due_date < current_date;
create index if not exists idx_reminder_logs_invoice_id on reminder_logs (invoice_id);

-- Enable row-level security
alter table profiles enable row level security;
alter table invoices enable row level security;
alter table reminder_logs enable row level security;
alter table reminder_settings enable row level security;

-- RLS policies
create policy if not exists "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy if not exists "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy if not exists "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy if not exists "Users can view own invoices" on invoices
  for select using (auth.uid() = user_id);

create policy if not exists "Users can update own invoices" on invoices
  for update using (auth.uid() = user_id);

create policy if not exists "Users can view own reminder logs" on reminder_logs
  for select using (auth.uid() = user_id);

create policy if not exists "Users can view own settings" on reminder_settings
  for select using (auth.uid() = user_id);

create policy if not exists "Users can update own settings" on reminder_settings
  for update using (auth.uid() = user_id);

create policy if not exists "Users can insert own settings" on reminder_settings
  for insert with check (auth.uid() = user_id);

