create table email_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  sent_at timestamp with time zone default now() not null,
  reminder_type text not null, -- e.g., 'pre_reminder', '7_day_follow_up', 'manual'
  send_method text not null, -- e.g., 'manual', 'automated'
  recipient_email text not null,
  status text default 'sent' not null, -- 'sent' or 'failed'
  error_message text
);

alter table email_history enable row level security;

create policy "Users can view their own email history." on email_history
  for select to authenticated using (user_id = auth.uid());

create policy "Users can insert their own email history." on email_history
  for insert to authenticated with check (user_id = auth.uid());
