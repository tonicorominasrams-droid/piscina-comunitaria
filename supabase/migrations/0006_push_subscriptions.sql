-- ===========================================================================
-- Migració: subscripcions de notificacions web push (VAPID)
--
-- Desa les subscripcions push dels navegadors dels usuaris. La ruta
-- /api/push/subscribe hi insereix/actualitza, i les tasques del servidor
-- (alertes fora de rang i recordatoris) hi llegeixen amb la clau de servei.
--
-- Executa a: Supabase > SQL Editor > New query > Run
-- ===========================================================================

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

-- Polítiques RLS: cada usuari gestiona NOMÉS les seves pròpies subscripcions.
-- (L'enviament de notificacions el fa el servidor amb la clau de servei, que
--  salta RLS, de manera que pot llegir-les totes.)

drop policy if exists "Veure les pròpies subscripcions push" on public.push_subscriptions;
create policy "Veure les pròpies subscripcions push"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Inserir les pròpies subscripcions push" on public.push_subscriptions;
create policy "Inserir les pròpies subscripcions push"
  on public.push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Actualitzar les pròpies subscripcions push" on public.push_subscriptions;
create policy "Actualitzar les pròpies subscripcions push"
  on public.push_subscriptions for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Esborrar les pròpies subscripcions push" on public.push_subscriptions;
create policy "Esborrar les pròpies subscripcions push"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);
