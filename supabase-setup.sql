-- Tables for impro app
create table if not exists profs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists courses (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict do nothing;

-- Allow public read access to photos
create policy "Public read photos" on storage.objects
  for select using (bucket_id = 'photos');

-- Allow authenticated upload
create policy "Allow upload photos" on storage.objects
  for insert with check (bucket_id = 'photos');
