import { createBrowserClient } from "@supabase/ssr";

/**
 * Client de Supabase per a components que s'executen al navegador.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
