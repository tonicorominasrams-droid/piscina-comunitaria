import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Client de Supabase amb la clau de servei (service role).
 *
 * Salta les polítiques RLS i NOMÉS s'ha de fer servir des del servidor
 * (per exemple, en tasques programades o rutes d'API protegides amb un
 * secret). MAI s'ha d'exposar al navegador.
 */
export function createServiceClient() {
  const url = supabaseUrl();
  const serviceKey = supabaseServiceRoleKey();

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
