import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { enviaRecordatoriControl } from "@/lib/email";

// Aquesta ruta depèn de capçaleres i de l'estat de la base de dades: mai
// s'ha de generar estàticament.
export const dynamic = "force-dynamic";

/** Nombre de dies sense cap control que dispara el recordatori. */
const DIES_LIMIT = 4;
const MS_PER_DIA = 1000 * 60 * 60 * 24;

/**
 * Comprova si fa més de DIES_LIMIT dies que no es registra cap control i,
 * en aquest cas, envia un recordatori per correu a tots els usuaris.
 *
 * Protegida amb un secret compartit (CRON_SECRET) perquè només la pugui
 * cridar la tasca programada (pg_cron via pg_net).
 */
async function gestiona(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const autoritzacio = request.headers.get("authorization");

  if (!secret || autoritzacio !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autoritzat." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: ultim, error: errControl } = await supabase
    .from("controls")
    .select("measured_at")
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errControl) {
    return NextResponse.json(
      { error: "No s'han pogut llegir els controls." },
      { status: 500 },
    );
  }

  const ara = Date.now();
  const ultimMs = ultim ? new Date(ultim.measured_at).getTime() : null;
  const diesSense =
    ultimMs === null ? Infinity : (ara - ultimMs) / MS_PER_DIA;

  if (diesSense < DIES_LIMIT) {
    return NextResponse.json({
      enviat: false,
      motiu: `L'últim control es va fer fa ${diesSense.toFixed(1)} dies.`,
    });
  }

  const { data: usuaris, error: errUsuaris } = await supabase
    .from("profiles")
    .select("email")
    .not("email", "is", null);

  if (errUsuaris) {
    return NextResponse.json(
      { error: "No s'han pogut llegir els usuaris." },
      { status: 500 },
    );
  }

  const destinataris = (usuaris ?? [])
    .map((u) => u.email as string)
    .filter(Boolean);

  const resultat = await enviaRecordatoriControl(destinataris, DIES_LIMIT);

  return NextResponse.json({
    enviat: resultat.enviat,
    motiu: resultat.motiu,
    destinataris: destinataris.length,
    diesSense: Number.isFinite(diesSense) ? Math.floor(diesSense) : null,
  });
}

export async function POST(request: NextRequest) {
  return gestiona(request);
}

// També s'admet GET per facilitar les proves manuals (amb el mateix secret).
export async function GET(request: NextRequest) {
  return gestiona(request);
}
