-- Cron run history table
create table if not exists cron_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running', -- 'running', 'success', 'failed'
  reminders_sent integer default 0,
  reminders_failed integer default 0,
  invoices_synced integer default 0,
  syncs_failed integer default 0,
  users_processed integer default 0,
  error_message text,
  created_at timestamptz default now()
);

-- Add global pause and custom intervals to reminder_settings
alter table reminder_settings 
  add column if not exists reminders_globally_paused boolean default false,
  add column if not exists custom_intervals jsonb default '{"day_1": 7, "day_2": 14, "day_3": 21}'::jsonb;

-- Add last cron run tracking to profiles
alter table profiles
  add column if not exists last_cron_run_at timestamptz;

-- Index for cron_runs
create index if not exists idx_cron_runs_started_at on cron_runs (started_at desc);

-- Enable RLS on cron_runs (admin only, but good practice)
alter table cron_runs enable row level security;

-- Allow service role to manage cron_runs
create policy "Service role can manage cron_runs" on cron_runs
  for all using (true);

