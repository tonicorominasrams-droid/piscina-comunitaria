-- ===========================================================================
-- 0007 — Perfils visibles entre veïns
-- ===========================================================================
-- Perquè l'històric pugui mostrar QUI ha registrat cada control (nom complet,
-- no el correu), qualsevol usuari autenticat ha de poder llegir els perfils
-- de la resta de veïns. Fins ara la política de SELECT només deixava veure el
-- propi perfil (o tots, si eres admin), de manera que el join amb "profiles"
-- retornava null per als controls fets per altres persones.
--
-- És una comunitat de veïns: veure els noms els uns dels altres és el
-- comportament esperat.
-- ---------------------------------------------------------------------------

drop policy if exists "Veure el propi perfil o, si ets admin, tots" on public.profiles;
drop policy if exists "Qualsevol autenticat pot veure els perfils" on public.profiles;

create policy "Qualsevol autenticat pot veure els perfils"
  on public.profiles for select
  to authenticated
  using (true);
