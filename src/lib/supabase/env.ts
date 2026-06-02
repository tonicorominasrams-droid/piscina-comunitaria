/**
 * Lectura centralitzada de les variables d'entorn de Supabase.
 *
 * IMPORTANT: fem `trim()` dels valors. Quan les variables s'enganxen al tauler
 * del proveïdor d'allotjament (Vercel, etc.) sovint hi entra un salt de línia o
 * un espai final. Una clau anon amb un "\n" al final genera una capçalera
 * `apikey` invàlida i TOTES les crides d'autenticació fallen, malgrat que en
 * local (amb un .env.local net) tot funcioni. El `trim()` ho evita.
 */

function llegeix(nom: string): string {
  const valor = process.env[nom];
  if (!valor || !valor.trim()) {
    throw new Error(`Falta la variable d'entorn ${nom}.`);
  }
  return valor.trim();
}

export function supabaseUrl(): string {
  return llegeix("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseAnonKey(): string {
  return llegeix("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function supabaseServiceRoleKey(): string {
  return llegeix("SUPABASE_SERVICE_ROLE_KEY");
}
