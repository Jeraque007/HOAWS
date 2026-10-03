-- Run this in the Supabase SQL Editor AFTER supabase/reviews.sql.
-- Emails info@hoaws.co.za whenever a new review/comment is inserted into public.reviews.
--
-- How it works:
--   trigger reviews_email_admin (after insert on public.reviews)
--     -> public.email_admin_on_new_review()
--        -> net.http_post() (pg_net, asynchronous - queued, sent on commit)
--           -> https://formsubmit.co/ajax/info@hoaws.co.za  (forwards the email, no API key)
--
-- Requirements:
--   1. Enable pg_net: Dashboard -> Database -> Extensions -> search "pg_net" -> Enable.
--      (Or run the "create extension" line below - if it errors with a permission
--       message, enable it from the Dashboard first, then re-run this script.)
--   2. FormSubmit.co needs no signup or API key. The FIRST submission triggers a
--      one-time confirmation email to info@hoaws.co.za - click the link in it once;
--      after that every new review is delivered automatically.

create extension if not exists pg_net;

create or replace function public.email_admin_on_new_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://formsubmit.co/ajax/info@hoaws.co.za',
    body := jsonb_build_object(
      '_subject', 'New review received (' || new.rating || '/5) - hoaws.co.za',
      '_template', 'table',
      '_captcha', 'false',
      'review_id', new.id::text,
      'name', new.name,
      'rating', new.rating || ' / 5',
      'message', new.message,
      'status', new.status,
      'submitted_at', to_char(new.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI:SS UTC')
    ),
    headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
  return new;
exception
  -- A failed email call must never break the public review submission.
  when others then
    raise warning 'review email notification failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists reviews_email_admin on public.reviews;
create trigger reviews_email_admin
  after insert on public.reviews
  for each row execute function public.email_admin_on_new_review();

-- Manual test (run as postgres, then delete the row):
--   insert into public.reviews (name, rating, message)
--   values ('Email test', 5, 'Testing the admin email notification');
--   delete from public.reviews where name = 'Email test';
