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

create table if not exists public.apo_casais (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.apo_membros_casal (
  couple_id uuid not null references public.apo_casais (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create table if not exists public.apo_convites_casal (
  code uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.apo_casais (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null
);

create table if not exists public.apo_gavetas_compartilhadas (
  couple_id uuid not null references public.apo_casais (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  primary key (couple_id, id)
);

create table if not exists public.apo_itens_compartilhados (
  couple_id uuid not null references public.apo_casais (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  primary key (couple_id, id)
);

alter table public.apo_gavetas enable row level security;
alter table public.apo_itens enable row level security;
alter table public.apo_perfis enable row level security;
alter table public.apo_membros_casal enable row level security;
alter table public.apo_casais enable row level security;
alter table public.apo_convites_casal enable row level security;
alter table public.apo_gavetas_compartilhadas enable row level security;
alter table public.apo_itens_compartilhados enable row level security;

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

revoke all on table public.apo_casais, public.apo_convites_casal, public.apo_membros_casal
  from public, anon, authenticated;
grant select on public.apo_membros_casal to authenticated;

drop policy if exists "Users read their own couple membership" on public.apo_membros_casal;
create policy "Users read their own couple membership"
  on public.apo_membros_casal
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.apo_e_membro_casal(p_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.apo_membros_casal
    where couple_id = p_couple_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.apo_e_membro_casal(uuid) from public;
grant execute on function public.apo_e_membro_casal(uuid) to authenticated;

drop policy if exists "Couple members manage shared drawers" on public.apo_gavetas_compartilhadas;
create policy "Couple members manage shared drawers"
  on public.apo_gavetas_compartilhadas
  for all
  to authenticated
  using (public.apo_e_membro_casal(couple_id))
  with check (public.apo_e_membro_casal(couple_id));

drop policy if exists "Couple members manage shared items" on public.apo_itens_compartilhados;
create policy "Couple members manage shared items"
  on public.apo_itens_compartilhados
  for all
  to authenticated
  using (public.apo_e_membro_casal(couple_id))
  with check (public.apo_e_membro_casal(couple_id));

grant select, insert, update, delete
  on public.apo_gavetas_compartilhadas, public.apo_itens_compartilhados
  to authenticated;

do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array['apo_gavetas_compartilhadas', 'apo_itens_compartilhados'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
end;
$$;

create or replace function public.apo_meu_casal()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', mine.couple_id,
    'memberCount', count(member.user_id),
    'partnerName', coalesce(max(profile.name), '')
  )
  from public.apo_membros_casal as mine
  left join public.apo_membros_casal as member
    on member.couple_id = mine.couple_id
   and member.user_id <> auth.uid()
  left join public.apo_perfis as profile on profile.user_id = member.user_id
  where mine.user_id = auth.uid()
  group by mine.couple_id;
$$;

create or replace function public.apo_criar_convite_casal()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_couple_id uuid;
  v_member_count integer;
  v_code uuid;
begin
  if v_user_id is null then
    raise exception 'É necessário entrar na sua conta.';
  end if;

  select couple_id into v_couple_id
  from public.apo_membros_casal
  where user_id = v_user_id;

  if v_couple_id is null then
    insert into public.apo_casais default values returning id into v_couple_id;
    insert into public.apo_membros_casal (couple_id, user_id)
    values (v_couple_id, v_user_id);
  else
    perform 1 from public.apo_casais where id = v_couple_id for update;
    select count(*) into v_member_count
    from public.apo_membros_casal where couple_id = v_couple_id;
    if v_member_count >= 2 then
      raise exception 'Este perfil já está conectado a outra pessoa.';
    end if;
  end if;

  update public.apo_convites_casal
  set used_at = now()
  where couple_id = v_couple_id and used_at is null;

  insert into public.apo_convites_casal (couple_id, created_by)
  values (v_couple_id, v_user_id)
  returning code into v_code;

  return v_code::text;
end;
$$;

create or replace function public.apo_entrar_com_convite_casal(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code uuid;
  v_couple_id uuid;
  v_member_count integer;
begin
  if v_user_id is null then
    raise exception 'É necessário entrar na sua conta.';
  end if;

  begin
    v_code := p_code::uuid;
  exception when invalid_text_representation then
    raise exception 'Este código de convite é inválido ou expirou.';
  end;

  select couple_id into v_couple_id
  from public.apo_convites_casal
  where code = v_code and used_at is null and expires_at > now();

  if v_couple_id is null then
    raise exception 'Este código de convite é inválido ou expirou.';
  end if;

  perform 1 from public.apo_casais where id = v_couple_id for update;

  select couple_id into v_couple_id
  from public.apo_convites_casal
  where code = v_code and used_at is null and expires_at > now()
  for update;

  if v_couple_id is null then
    raise exception 'Este código de convite é inválido ou expirou.';
  end if;

  if exists (
    select 1 from public.apo_membros_casal where user_id = v_user_id
  ) then
    raise exception 'Este perfil já está conectado a outra pessoa.';
  end if;

  select count(*) into v_member_count
  from public.apo_membros_casal where couple_id = v_couple_id;
  if v_member_count >= 2 then
    raise exception 'Este convite já foi usado.';
  end if;

  insert into public.apo_membros_casal (couple_id, user_id)
  values (v_couple_id, v_user_id);
  update public.apo_convites_casal
  set used_at = now(), used_by = v_user_id
  where code = v_code;

  return public.apo_meu_casal();
end;
$$;

revoke all on function public.apo_meu_casal() from public;
revoke all on function public.apo_criar_convite_casal() from public;
revoke all on function public.apo_entrar_com_convite_casal(text) from public;
grant execute on function public.apo_meu_casal() to authenticated;
grant execute on function public.apo_criar_convite_casal() to authenticated;
grant execute on function public.apo_entrar_com_convite_casal(text) to authenticated;

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
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'shared'
        and public.apo_e_membro_casal(((storage.foldername(name))[2])::uuid)
      )
    )
  );

drop policy if exists "Users upload their own files" on storage.objects;
drop policy if exists "Users upload their own diary files" on storage.objects;
create policy "Users upload their own files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'apo-arquivos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'shared'
        and public.apo_e_membro_casal(((storage.foldername(name))[2])::uuid)
      )
    )
  );

drop policy if exists "Users update their own files" on storage.objects;
drop policy if exists "Users update their own diary files" on storage.objects;
create policy "Users update their own files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'apo-arquivos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'shared'
        and public.apo_e_membro_casal(((storage.foldername(name))[2])::uuid)
      )
    )
  )
  with check (
    bucket_id = 'apo-arquivos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'shared'
        and public.apo_e_membro_casal(((storage.foldername(name))[2])::uuid)
      )
    )
  );

drop policy if exists "Users delete their own files" on storage.objects;
drop policy if exists "Users delete their own diary files" on storage.objects;
create policy "Users delete their own files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'apo-arquivos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'shared'
        and public.apo_e_membro_casal(((storage.foldername(name))[2])::uuid)
      )
    )
  );

-- Recursos da linha do tempo, cartas e datas especiais: sincronizados entre dispositivos.
create table if not exists public.apo_recursos_pessoais (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.apo_recursos_compartilhados (
  couple_id uuid primary key references public.apo_casais (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.apo_recursos_pessoais enable row level security;
alter table public.apo_recursos_compartilhados enable row level security;

drop policy if exists "Users manage their own extras" on public.apo_recursos_pessoais;
create policy "Users manage their own extras"
  on public.apo_recursos_pessoais
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Couple members manage shared extras" on public.apo_recursos_compartilhados;
create policy "Couple members manage shared extras"
  on public.apo_recursos_compartilhados
  for all
  to authenticated
  using (public.apo_e_membro_casal(couple_id))
  with check (public.apo_e_membro_casal(couple_id));

grant select, insert, update, delete on public.apo_recursos_pessoais to authenticated;
grant select, insert, update, delete on public.apo_recursos_compartilhados to authenticated;

do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array['apo_recursos_pessoais', 'apo_recursos_compartilhados'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
end;
$$;
