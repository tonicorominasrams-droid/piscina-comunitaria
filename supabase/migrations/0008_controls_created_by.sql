-- ===========================================================================
-- 0008 — Autoria dels controls (columna "Qui" de l'històric)
-- ===========================================================================
-- L'històric mostra QUI ha registrat cada control fent un join amb "profiles"
-- a través de controls.created_by (incrustat profiles!created_by a la consulta
-- de PostgREST). En bases de dades creades abans d'aquesta funcionalitat la
-- columna "created_by" no existia, i el bloc "add column if not exists" de
-- schema.sql no la incloïa: per això la columna "Qui" sortia buida.
--
-- Aquesta migració garanteix que:
--   1) La columna "created_by" existeix.
--   2) Té la clau forana cap a "profiles" (sense ella PostgREST no pot resoldre
--      la relació i l'incrustat torna buit).
--   3) PostgREST recarrega l'esquema perquè reconegui la relació immediatament.
-- ---------------------------------------------------------------------------

alter table public.controls
  add column if not exists created_by uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'controls_created_by_fkey'
  ) then
    alter table public.controls
      add constraint controls_created_by_fkey
      foreign key (created_by) references public.profiles(id);
  end if;
end $$;

-- Recarrega la memòria cau de l'esquema de PostgREST (l'API de Supabase) perquè
-- la nova relació estigui disponible sense haver de reiniciar el projecte.
notify pgrst, 'reload schema';
