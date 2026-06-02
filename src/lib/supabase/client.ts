import { createBrowserClient } from "@supabase/ssr";

/**
 * Client de Supabase per a components que s'executen al navegador.
 */
export function createClient() {
  // NOTA: cal accedir a `process.env.NEXT_PUBLIC_*` de forma estàtica perquè
  // Next.js en faci la substitució en temps de compilació al navegador (un
  // accés dinàmic no es reemplaçaria). El `trim()` evita que un salt de línia
  // o un espai final enganxat al tauler d'allotjament invalidi la clau.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  );
}
