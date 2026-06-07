-- Golyn Nail CMS schema for Supabase.
-- Run this file in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  lang text not null default 'ja',
  title text not null,
  tag text,
  excerpt text,
  content text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at date default current_date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  storage_path text,
  label text not null,
  tag text,
  alt text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_cms_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admins
    where user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

alter table public.cms_admins enable row level security;
alter table public.articles enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists "Admins can read admin list" on public.cms_admins;
create policy "Admins can read admin list"
on public.cms_admins for select
to authenticated
using (public.is_cms_admin());

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select
to anon, authenticated
using (status = 'published');

drop policy if exists "CMS admins can manage articles" on public.articles;
create policy "CMS admins can manage articles"
on public.articles for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "Public can read gallery" on public.gallery_items;
create policy "Public can read gallery"
on public.gallery_items for select
to anon, authenticated
using (true);

drop policy if exists "CMS admins can manage gallery" on public.gallery_items;
create policy "CMS admins can manage gallery"
on public.gallery_items for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'golyn-media',
  'golyn-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read Golyn media" on storage.objects;
create policy "Public can read Golyn media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'golyn-media');

drop policy if exists "CMS admins can upload Golyn media" on storage.objects;
create policy "CMS admins can upload Golyn media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'golyn-media' and public.is_cms_admin());

drop policy if exists "CMS admins can update Golyn media" on storage.objects;
create policy "CMS admins can update Golyn media"
on storage.objects for update
to authenticated
using (bucket_id = 'golyn-media' and public.is_cms_admin())
with check (bucket_id = 'golyn-media' and public.is_cms_admin());

drop policy if exists "CMS admins can delete Golyn media" on storage.objects;
create policy "CMS admins can delete Golyn media"
on storage.objects for delete
to authenticated
using (bucket_id = 'golyn-media' and public.is_cms_admin());

-- After creating your first Supabase Auth user, run this once with that user's UUID:
-- insert into public.cms_admins (user_id) values ('00000000-0000-0000-0000-000000000000');
