import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client de Supabase per a Server Components, Server Actions i Route Handlers.
 * A Next.js 15 `cookies()` és asíncron, per això la funció retorna una Promise.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cridat des d'un Server Component: es pot ignorar si hi ha
            // un middleware que refresca la sessió de l'usuari.
          }
        },
      },
    },
  );
}
