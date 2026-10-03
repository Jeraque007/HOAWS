-- HOAWS: migrate public.reviews from a bigint identity primary key to UUID.
--
-- Why: sequential bigint IDs can be enumerated; UUIDs cannot. Fresh installs
-- created from the updated supabase/reviews.sql already use UUIDs and must
-- NOT run this file.
--
-- Where: Supabase Dashboard > SQL Editor. Run ONCE, as a single execution
-- ("bulk" run). Everything runs in one transaction: it either completes fully
-- or rolls back completely (safe to re-run after a failed attempt).
--
-- Works on either database shape:
--   * Databases that already have public.review_notifications: both tables
--     are migrated together.
--   * Older databases where the notification feature was never installed:
--     those steps are skipped automatically. Run supabase/reviews.sql
--     afterwards to install the feature - it creates the table with UUID
--     columns matching the migrated reviews table.
--
-- What it does:
--   1. Adds a UUID column to public.reviews and fills every existing row.
--   2. Maps each public.review_notifications.review_id to its review's new
--      UUID so admin alert links are preserved.
--   3. Swaps public.reviews onto the UUID primary key.
--   4. Swaps public.review_notifications onto the UUID column and re-creates
--      its unique index and cascade foreign key.
--
-- Verify afterwards (both queries must return "uuid"):
--   select data_type from information_schema.columns
--    where table_schema = 'public' and table_name = 'reviews' and column_name = 'id';
--   select data_type from information_schema.columns
--    where table_schema = 'public' and table_name = 'review_notifications' and column_name = 'review_id';

begin;

do $$
begin
  -- Already migrated (or a fresh UUID install): exit cleanly and do nothing.
  if (select c.data_type
        from information_schema.columns c
       where c.table_schema = 'public'
         and c.table_name = 'reviews'
         and c.column_name = 'id') = 'uuid' then
    raise notice 'public.reviews.id is already uuid - nothing to migrate';
    return;
  end if;

  -- 1. New UUID column for existing reviews.
  execute 'alter table public.reviews add column if not exists id_uuid uuid';
  update public.reviews
     set id_uuid = gen_random_uuid()
   where id_uuid is null;

  -- 2. Map notifications onto the new UUIDs before anything is swapped.
  --    Skipped automatically when the notification feature was never installed.
  if to_regclass('public.review_notifications') is null then
    raise notice 'public.review_notifications not found - skipping notification id migration (run supabase/reviews.sql afterwards to install it)';
  else
    execute 'alter table public.review_notifications add column if not exists review_uuid uuid';
    update public.review_notifications n
       set review_uuid = r.id_uuid
      from public.reviews r
     where n.review_id = r.id
       and n.review_uuid is null;

    if exists (select 1 from public.review_notifications where review_uuid is null) then
      raise exception 'some review_notifications rows have no matching review - nothing was changed';
    end if;

    execute 'alter table public.review_notifications drop constraint if exists review_notifications_review_id_fkey';
  end if;

  -- 3. Promote the UUID column to be the reviews primary key.
  execute 'alter table public.reviews drop constraint if exists reviews_pkey';
  execute 'alter table public.reviews drop column id';
  execute 'alter table public.reviews rename column id_uuid to id';
  execute 'alter table public.reviews alter column id set not null';
  execute 'alter table public.reviews alter column id set default gen_random_uuid()';
  execute 'alter table public.reviews add primary key (id)';

  -- 4. Retire the bigint notification column and activate the UUID one.
  --    (Dropping review_id also removes its old unique index.)
  if to_regclass('public.review_notifications') is not null then
    execute 'alter table public.review_notifications drop column review_id';
    execute 'alter table public.review_notifications rename column review_uuid to review_id';
    execute 'alter table public.review_notifications alter column review_id set not null';
    execute 'create unique index if not exists review_notifications_review_id_idx on public.review_notifications (review_id)';
    execute 'alter table public.review_notifications add constraint review_notifications_review_id_fkey foreign key (review_id) references public.reviews (id) on delete cascade';
  end if;

  raise notice 'public.reviews migrated to uuid primary keys';
end $$;

commit;
