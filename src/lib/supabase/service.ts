import { createClient } from "@supabase/supabase-js";

/**
 * Client de Supabase amb la clau de servei (service role).
 *
 * Salta les polítiques RLS i NOMÉS s'ha de fer servir des del servidor
 * (per exemple, en tasques programades o rutes d'API protegides amb un
 * secret). MAI s'ha d'exposar al navegador.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Falten NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
