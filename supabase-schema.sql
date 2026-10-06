create table if not exists public.apo_gavetas (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  primary key (user_id, id)
);

create table if not exists public.apo_itens (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  primary key (user_id, id)
);

create table if not exists public.apo_perfis (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default ''
);

alter table public.apo_gavetas enable row level security;
alter table public.apo_itens enable row level security;
alter table public.apo_perfis enable row level security;

drop policy if exists "Users manage their own drawers" on public.apo_gavetas;
create policy "Users manage their own drawers"
  on public.apo_gavetas
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own items" on public.apo_itens;
create policy "Users manage their own items"
  on public.apo_itens
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own profile" on public.apo_perfis;
create policy "Users manage their own profile"
  on public.apo_perfis
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete
  on public.apo_gavetas, public.apo_itens, public.apo_perfis
  to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('apo-arquivos', 'apo-arquivos', false, 41943040)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Users read their own files" on storage.objects;
drop policy if exists "Users read their own diary files" on storage.objects;
create policy "Users read their own files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'apo-arquivos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload their own files" on storage.objects;
drop policy if exists "Users upload their own diary files" on storage.objects;
create policy "Users upload their own files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'apo-arquivos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their own files" on storage.objects;
drop policy if exists "Users update their own diary files" on storage.objects;
create policy "Users update their own files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'apo-arquivos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'apo-arquivos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own files" on storage.objects;
drop policy if exists "Users delete their own diary files" on storage.objects;
create policy "Users delete their own files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'apo-arquivos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
