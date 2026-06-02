-- ===========================================================================
-- Migració: nombre de pastilles de clor a l'skimer
-- Substitueix el camp booleà clor_skimmer per un enter pastilles_skimmer
-- (0 = cap pastilla afegida, mínim 0, màxim 20).
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

-- 1) Afegeix la nova columna entera (si no existeix).
alter table public.controls
  add column if not exists pastilles_skimmer integer not null default 0;

-- 2) Migra les dades existents: si abans s'havia marcat clor_skimmer = true,
--    assumim com a mínim 1 pastilla; en cas contrari, 0.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'controls'
      and column_name = 'clor_skimmer'
  ) then
    update public.controls
      set pastilles_skimmer = case when clor_skimmer then 1 else 0 end;

    alter table public.controls drop column clor_skimmer;
  end if;
end $$;

-- 3) Restringeix el rang permès (0–20).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'controls_pastilles_skimmer_check'
  ) then
    alter table public.controls
      add constraint controls_pastilles_skimmer_check
      check (pastilles_skimmer >= 0 and pastilles_skimmer <= 20);
  end if;
end $$;
