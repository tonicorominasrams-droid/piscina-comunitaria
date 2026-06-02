import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  EMAIL_BETA_IA,
  analitzaTira,
  esTipusImatgeAdmes,
} from "@/lib/ia";

// Depèn de la sessió de l'usuari i de la imatge enviada: mai estàtica.
export const dynamic = "force-dynamic";

/** Mida màxima de la imatge acceptada (8 MB). */
const MIDA_MAXIMA = 8 * 1024 * 1024;

/**
 * Rep una imatge d'una tira reactiva i en retorna els valors de pH i clor
 * detectats per Claude. Restringida a l'únic usuari de la beta d'IA.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Comprovació estricta: només l'usuari de la beta hi té accés.
  if (!user || user.email?.toLowerCase() !== EMAIL_BETA_IA) {
    return NextResponse.json({ error: "No autoritzat." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No s'ha pogut llegir la imatge." },
      { status: 400 },
    );
  }

  const fitxer = formData.get("imatge");
  if (!(fitxer instanceof File)) {
    return NextResponse.json(
      { error: "Cal adjuntar una imatge de la tira reactiva." },
      { status: 400 },
    );
  }

  if (fitxer.size === 0) {
    return NextResponse.json({ error: "La imatge és buida." }, { status: 400 });
  }

  if (fitxer.size > MIDA_MAXIMA) {
    return NextResponse.json(
      { error: "La imatge és massa gran (màxim 8 MB)." },
      { status: 400 },
    );
  }

  if (!esTipusImatgeAdmes(fitxer.type)) {
    return NextResponse.json(
      { error: "Format d'imatge no admès. Fes servir JPEG, PNG o WEBP." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await fitxer.arrayBuffer());
  const base64 = buffer.toString("base64");

  const resultat = await analitzaTira(base64, fitxer.type);

  if (!resultat.ok) {
    return NextResponse.json(
      { error: resultat.error ?? "No s'ha pogut analitzar la imatge." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ph: resultat.ph,
    clor: resultat.clor,
    comentari: resultat.comentari ?? null,
  });
}
