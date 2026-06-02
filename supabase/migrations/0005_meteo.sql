-- ===========================================================================
-- Migració: dades meteorològiques de cada control
--
-- Afegeix dues columnes a "controls" per desar, de manera automàtica, el temps
-- que feia a Castellar del Vallès en el moment de registrar el control:
--   · temperatura  → temperatura actual en graus Celsius
--   · codi_meteo   → codi de condició meteorològica (estàndard WMO d'Open-Meteo)
--
-- Les dades s'obtenen de l'API gratuïta d'Open-Meteo (sense clau) en el moment
-- de desar el control. Tots dos camps poden ser NULL (p. ex. controls antics o
-- si l'API no respon).
--
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

alter table public.controls
  add column if not exists temperatura numeric(4, 1),
  add column if not exists codi_meteo  integer;
