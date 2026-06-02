-- ===========================================================================
-- Esquema de la base de dades — Piscina Comunitària
-- Executa aquest fitxer a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Taula de perfils (un per cada usuari registrat)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'neighbor' check (role in ('admin', 'neighbor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Funció auxiliar: comprova si l'usuari actual és administrador.
-- És SECURITY DEFINER per evitar recursió infinita a les polítiques RLS
-- (consultar "profiles" dins d'una política de "profiles").
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Crea automàticament un perfil quan es registra un usuari nou.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Polítiques RLS de "profiles"
drop policy if exists "Veure el propi perfil o, si ets admin, tots" on public.profiles;
create policy "Veure el propi perfil o, si ets admin, tots"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Actualitzar el propi perfil" on public.profiles;
create policy "Actualitzar el propi perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Taula de controls de l'aigua
-- ---------------------------------------------------------------------------
create table if not exists public.controls (
  id                uuid primary key default gen_random_uuid(),
  measured_at       timestamptz not null default now(),
  ph                numeric(4, 2),
  clor              numeric(4, 2),
  aspiracio         boolean not null default false,
  pastilles_skimmer integer not null default 0 check (pastilles_skimmer between 0 and 20),
  ph_corregit       boolean not null default false,
  clor_afegit       boolean not null default false,
  aigua_omplerta    boolean not null default false,
  estat_depuradora  text check (estat_depuradora in ('blanc', 'verd', 'groc', 'vermell')),
  notes             text,
  fora_de_rang      boolean not null default false,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

alter table public.controls enable row level security;

-- Migració per a bases de dades existents (afegeix les columnes si falten).
alter table public.controls
  add column if not exists pastilles_skimmer integer not null default 0,
  add column if not exists ph_corregit       boolean not null default false,
  add column if not exists clor_afegit       boolean not null default false,
  add column if not exists aigua_omplerta    boolean not null default false,
  add column if not exists estat_depuradora  text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'controls_estat_depuradora_check'
  ) then
    alter table public.controls
      add constraint controls_estat_depuradora_check
      check (estat_depuradora in ('blanc', 'verd', 'groc', 'vermell'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'controls_pastilles_skimmer_check'
  ) then
    alter table public.controls
      add constraint controls_pastilles_skimmer_check
      check (pastilles_skimmer >= 0 and pastilles_skimmer <= 20);
  end if;
end $$;

create index if not exists controls_measured_at_idx
  on public.controls (measured_at desc);

-- Polítiques RLS de "controls"
-- Lectura: qualsevol usuari autenticat (admins i veïns).
drop policy if exists "Tothom autenticat pot veure els controls" on public.controls;
create policy "Tothom autenticat pot veure els controls"
  on public.controls for select
  to authenticated
  using (true);

-- Escriptura: només administradors.
drop policy if exists "Només admins poden inserir controls" on public.controls;
create policy "Només admins poden inserir controls"
  on public.controls for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Només admins poden modificar controls" on public.controls;
create policy "Només admins poden modificar controls"
  on public.controls for update
  to authenticated
  using (public.is_admin());

drop policy if exists "Només admins poden esborrar controls" on public.controls;
create policy "Només admins poden esborrar controls"
  on public.controls for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- Com convertir un usuari en administrador:
--   update public.profiles set role = 'admin' where email = 'admin@exemple.com';
-- (L'usuari ha d'haver entrat almenys un cop perquè existeixi el seu perfil.)
-- ===========================================================================
