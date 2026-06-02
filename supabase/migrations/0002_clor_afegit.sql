-- ===========================================================================
-- Migració: acció "S'ha afegit clor"
-- Afegeix el camp booleà clor_afegit a la taula public.controls.
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

alter table public.controls
  add column if not exists clor_afegit boolean not null default false;
