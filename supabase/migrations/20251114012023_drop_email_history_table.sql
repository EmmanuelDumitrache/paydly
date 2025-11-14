-- Drop the email_history table and its policies
drop policy if exists "Users can view their own email history." on email_history;
drop policy if exists "Users can insert their own email history." on email_history;
drop table if exists email_history;

