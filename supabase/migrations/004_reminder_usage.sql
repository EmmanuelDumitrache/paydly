alter table profiles
  add column if not exists reminder_send_count integer not null default 0;

create or replace function increment_reminder_send_count(target_user uuid, delta integer default 1)
returns void
language sql
security definer
as $$
  update profiles
     set reminder_send_count = reminder_send_count + coalesce(delta, 1),
         updated_at = now()
   where id = target_user;
$$;

create unique index if not exists unique_profiles_xero_tenant_id
  on profiles (xero_tenant_id)
  where xero_tenant_id is not null;


