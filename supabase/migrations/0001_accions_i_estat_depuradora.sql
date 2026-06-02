-- ===========================================================================
-- Migració: accions de manteniment i estat de la depuradora
-- Afegeix tres camps booleans d'accions i el camp d'estat de la depuradora
-- a la taula public.controls.
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

alter table public.controls
  add column if not exists clor_skimmer     boolean not null default false,
  add column if not exists ph_corregit      boolean not null default false,
  add column if not exists aigua_omplerta   boolean not null default false,
  add column if not exists estat_depuradora text;

-- Restricció de valors per a l'estat de la depuradora (només si encara no existeix).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'controls_estat_depuradora_check'
  ) then
    alter table public.controls
      add constraint controls_estat_depuradora_check
      check (estat_depuradora in ('blanc', 'verd', 'groc', 'vermell'));
  end if;
end $$;
