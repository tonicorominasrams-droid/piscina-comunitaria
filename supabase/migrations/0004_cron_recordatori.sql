-- ===========================================================================
-- Migració: recordatori automàtic si fa 4 dies que no es registra cap control
--
-- Programa una comprovació diària amb pg_cron que crida (via pg_net) la ruta
-- /api/cron/reminder de l'aplicació. La ruta comprova si fa 4 dies o més que
-- no hi ha cap control i, si cal, envia un correu a tots els usuaris amb
-- Resend.
--
-- ABANS D'EXECUTAR, substitueix:
--   · EL-TEU-DOMINI        → el domini públic de l'app (p. ex. la-piscina.vercel.app)
--   · EL-TEU-CRON-SECRET   → el mateix valor de la variable d'entorn CRON_SECRET
--
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

-- 1) Habilita les extensions necessàries (a Supabase ja hi són disponibles).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Elimina la tasca si ja existia (perquè aquest fitxer es pugui reexecutar).
do $$
begin
  if exists (
    select 1 from cron.job where jobname = 'recordatori-control-piscina'
  ) then
    perform cron.unschedule('recordatori-control-piscina');
  end if;
end $$;

-- 3) Programa la comprovació diària a les 09:00.
--    NOTA: pg_cron a Supabase fa servir l'hora UTC. '0 9 * * *' = 09:00 UTC.
--    Per tenir-ho a les 09:00 hora peninsular, ajusta segons l'estació:
--      · Hivern (CET, UTC+1):  '0 8 * * *'
--      · Estiu  (CEST, UTC+2): '0 7 * * *'
select cron.schedule(
  'recordatori-control-piscina',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://EL-TEU-DOMINI/api/cron/reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer EL-TEU-CRON-SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- Ordres útils:
--   · Veure les tasques programades:
--       select jobid, jobname, schedule, active from cron.job;
--   · Veure l'historial d'execucions:
--       select * from cron.job_run_details order by start_time desc limit 20;
--   · Aturar i eliminar la tasca:
--       select cron.unschedule('recordatori-control-piscina');
-- ---------------------------------------------------------------------------
