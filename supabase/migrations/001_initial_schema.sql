-- MORPH Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
alter database postgres set "app.jwt_secret" to '';

-- Morphs table
create table if not exists public.morphs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  note text,
  category text not null check (category in ('fitness', 'health', 'style', 'space', 'plant', 'project', 'art', 'other')),
  color text not null default '#E8634A',
  before_url text,
  after_url text,
  before_taken_with text check (before_taken_with in ('camera', 'gallery')),
  after_taken_with text check (after_taken_with in ('camera', 'gallery')),
  before_date timestamptz not null default now(),
  after_date timestamptz,
  goal_date timestamptz,
  is_verified boolean not null default false,
  is_ongoing boolean not null default true,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progress photos table (PRO feature)
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  morph_id uuid references public.morphs(id) on delete cascade not null,
  photo_url text not null,
  taken_with text not null check (taken_with in ('camera', 'gallery')),
  taken_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

-- User profiles for PRO status
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_pro boolean not null default false,
  pro_since timestamptz,
  pro_plan text check (pro_plan in ('monthly', 'yearly')),
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_morphs_user_id on public.morphs(user_id);
create index if not exists idx_morphs_category on public.morphs(category);
create index if not exists idx_morphs_created_at on public.morphs(created_at desc);
create index if not exists idx_progress_photos_morph_id on public.progress_photos(morph_id);

-- Row Level Security
alter table public.morphs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.profiles enable row level security;

-- Morphs policies: users can only access their own morphs
create policy "Users can view own morphs" on public.morphs
  for select using (auth.uid() = user_id);

create policy "Users can insert own morphs" on public.morphs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own morphs" on public.morphs
  for update using (auth.uid() = user_id);

create policy "Users can delete own morphs" on public.morphs
  for delete using (auth.uid() = user_id);

-- Progress photos policies
create policy "Users can view own progress photos" on public.progress_photos
  for select using (
    morph_id in (select id from public.morphs where user_id = auth.uid())
  );

create policy "Users can insert own progress photos" on public.progress_photos
  for insert with check (
    morph_id in (select id from public.morphs where user_id = auth.uid())
  );

create policy "Users can delete own progress photos" on public.progress_photos
  for delete using (
    morph_id in (select id from public.morphs where user_id = auth.uid())
  );

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger morphs_updated_at
  before update on public.morphs
  for each row execute procedure public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- Storage bucket for morph photos
insert into storage.buckets (id, name, public)
values ('morph-photos', 'morph-photos', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload own photos" on storage.objects
  for insert with check (
    bucket_id = 'morph-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photos" on storage.objects
  for select using (
    bucket_id = 'morph-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos" on storage.objects
  for delete using (
    bucket_id = 'morph-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
