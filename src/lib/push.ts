import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Enviament de notificacions web push amb VAPID.
 *
 * Igual que els correus, mai llança: si les claus VAPID no estan configurades
 * només ho registra a la consola i l'app continua funcionant.
 *
 * Variables d'entorn necessàries:
 *   · NEXT_PUBLIC_VAPID_PUBLIC_KEY  (pública, també l'usa el navegador)
 *   · VAPID_PRIVATE_KEY             (privada, només al servidor)
 *   · VAPID_SUBJECT                 (mailto:... o https://..., opcional)
 */

let configurat: boolean | null = null;

function configura(): boolean {
  if (configurat !== null) return configurat;

  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privada = process.env.VAPID_PRIVATE_KEY?.trim();
  const subjecte =
    process.env.VAPID_SUBJECT?.trim() || "mailto:piscina@example.com";

  if (!publica || !privada) {
    console.warn(
      "[push] VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no configurades. " +
        "No s'enviaran notificacions push.",
    );
    configurat = false;
    return false;
  }

  webpush.setVapidDetails(subjecte, publica, privada);
  configurat = true;
  return true;
}

export type PayloadPush = {
  title: string;
  body: string;
  /** URL que s'obre en tocar la notificació (per defecte el dashboard). */
  url?: string;
};

type Subscripcio = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Envia una notificació push a totes les subscripcions desades. Elimina
 * automàticament les subscripcions caducades (404/410).
 */
export async function enviaPushATots(
  payload: PayloadPush,
): Promise<{ enviades: number; total: number; motiu?: string }> {
  if (!configura()) {
    return { enviades: 0, total: 0, motiu: "VAPID no configurat." };
  }

  // El client de servei requereix SUPABASE_SERVICE_ROLE_KEY. Si falta, no
  // bloquegem mai el flux que ens ha cridat (registre de control, recordatori).
  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (err) {
    console.warn("[push] No s'ha pogut crear el client de servei:", err);
    return { enviades: 0, total: 0, motiu: "Client de servei no disponible." };
  }

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error) {
    console.error("[push] No s'han pogut llegir les subscripcions:", error);
    return { enviades: 0, total: 0, motiu: "Error llegint subscripcions." };
  }

  const subs = (data ?? []) as Subscripcio[];
  const cos = JSON.stringify(payload);
  const caducades: string[] = [];
  let enviades = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          cos,
        );
        enviades++;
      } catch (err: unknown) {
        const codi =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        // 404/410 = la subscripció ja no existeix al navegador: la netegem.
        if (codi === 404 || codi === 410) {
          caducades.push(s.id);
        } else {
          console.error("[push] Error enviant a una subscripció:", err);
        }
      }
    }),
  );

  if (caducades.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", caducades);
  }

  return { enviades, total: subs.length };
}
