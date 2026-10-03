-- Grant an existing Supabase Auth user access to the private workspaces:
--   /reviews/admin  and  /promos/admin
--
-- Run this in the Supabase SQL Editor AFTER supabase/reviews.sql (which creates
-- public.review_admins) and after the user exists in Authentication > Users.
--
-- Replace the email on the next line with your admin login, then run the block.
-- It is safe to re-run: it does nothing when the grant already exists, and it
-- stops with a clear message when the Auth user has not been created yet.

do $$
declare
  admin_email text := 'info@hoaws.co.za';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);

  if admin_id is null then
    raise exception
      'No Auth user found for "%". Create it first in Authentication > Users > Add user (tick "Auto Confirm User"), then run this block again.',
      admin_email;
  end if;

  insert into public.review_admins (user_id)
  values (admin_id)
  on conflict (user_id) do nothing;

  raise notice 'Done. % can now sign in at /reviews/admin and /promos/admin.', admin_email;
end $$;

-- Check it worked - should list the row you just added:
select ra.user_id, u.email, ra.created_at
from public.review_admins ra
join auth.users u on u.id = ra.user_id;