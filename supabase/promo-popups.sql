-- Run this in the Supabase SQL Editor to enable the home page announcement popup.
--
-- What it creates:
--   * public.promo_popups - one row per popup (text the visitor reads, plus the
--     uploaded MP4 / poster image URLs and an optional schedule window).
--   * the public "promo-media" Storage bucket that holds the uploaded MP4 and
--     poster image.
--
-- Admin access reuses public.review_admins (the moderation allow-list created by
-- supabase/reviews.sql), so run that file first if the reviews feature is not
-- installed yet. It is the one place that names a trusted authenticated user.
--
-- Everything below is idempotent, so re-running the file is safe.

create table if not exists public.promo_popups (
  id uuid default gen_random_uuid() primary key,
  kicker text check (kicker is null or char_length(kicker) <= 60),
  headline text not null check (char_length(headline) between 1 and 120),
  body text check (body is null or char_length(body) <= 1200),
  quote text check (quote is null or char_length(quote) <= 300),
  attribution text check (attribution is null or char_length(attribution) <= 120),
  image_url text,
  video_url text,
  cta_label text check (cta_label is null or char_length(cta_label) <= 60),
  cta_url text,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The visitor-facing lookup is "newest live popup", so index that.
create index if not exists promo_popups_active_created_at_idx
  on public.promo_popups (is_active, created_at desc);

create or replace function public.touch_promo_popup()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists promo_popups_touch on public.promo_popups;
create trigger promo_popups_touch
  before update on public.promo_popups
  for each row execute function public.touch_promo_popup();

alter table public.promo_popups enable row level security;

revoke all on table public.promo_popups from anon, authenticated;
grant select on table public.promo_popups to anon, authenticated;
grant insert, update, delete on table public.promo_popups to authenticated;

-- Visitors may only ever read a popup that is switched on AND inside its window.
drop policy if exists "Public can read live popups" on public.promo_popups;
create policy "Public can read live popups"
  on public.promo_popups
  for select
  to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists "Popup admins can read every popup" on public.promo_popups;
create policy "Popup admins can read every popup"
  on public.promo_popups
  for select
  to authenticated
  using (exists (select 1 from public.review_admins where user_id = auth.uid()));

drop policy if exists "Popup admins can create popups" on public.promo_popups;
create policy "Popup admins can create popups"
  on public.promo_popups
  for insert
  to authenticated
  with check (exists (select 1 from public.review_admins where user_id = auth.uid()));

drop policy if exists "Popup admins can update popups" on public.promo_popups;
create policy "Popup admins can update popups"
  on public.promo_popups
  for update
  to authenticated
  using (exists (select 1 from public.review_admins where user_id = auth.uid()))
  with check (exists (select 1 from public.review_admins where user_id = auth.uid()));

drop policy if exists "Popup admins can delete popups" on public.promo_popups;
create policy "Popup admins can delete popups"
  on public.promo_popups
  for delete
  to authenticated
  using (exists (select 1 from public.review_admins where user_id = auth.uid()));

-- Storage: one public bucket for popup media (MP4 + optional poster image).
-- 25 MB ceiling matches MAX_VIDEO_BYTES in src/lib/promo.js - change both together.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'promo-media',
  'promo-media',
  true,
  26214400,
  array['video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view promo media" on storage.objects;
create policy "Public can view promo media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'promo-media');

drop policy if exists "Popup admins can upload promo media" on storage.objects;
create policy "Popup admins can upload promo media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'promo-media'
    and exists (select 1 from public.review_admins where user_id = auth.uid())
  );

drop policy if exists "Popup admins can update promo media" on storage.objects;
create policy "Popup admins can update promo media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'promo-media'
    and exists (select 1 from public.review_admins where user_id = auth.uid())
  )
  with check (
    bucket_id = 'promo-media'
    and exists (select 1 from public.review_admins where user_id = auth.uid())
  );

drop policy if exists "Popup admins can delete promo media" on storage.objects;
create policy "Popup admins can delete promo media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'promo-media'
    and exists (select 1 from public.review_admins where user_id = auth.uid())
  );

-- To grant popup access, sign in at /promos/admin with an Auth user that is
-- already listed in public.review_admins (see supabase/reviews.sql).