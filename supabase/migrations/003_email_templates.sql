-- Email templates table
create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  template_type text not null check (template_type in ('day_7', 'day_14', 'day_21', 'pre_reminder')),
  subject text not null,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, template_type)
);

-- Index for faster lookups
create index if not exists idx_email_templates_user_id on email_templates (user_id);

-- Enable RLS
alter table email_templates enable row level security;

-- RLS policies
create policy "Users can view own templates" on email_templates
  for select using (auth.uid() = user_id);

create policy "Users can insert own templates" on email_templates
  for insert with check (auth.uid() = user_id);

create policy "Users can update own templates" on email_templates
  for update using (auth.uid() = user_id);

create policy "Users can delete own templates" on email_templates
  for delete using (auth.uid() = user_id);

