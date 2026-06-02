"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { comprovaRangs } from "@/lib/ranges";
import { enviaAlertaForaDeRang } from "@/lib/email";
import { obteMeteoActual } from "@/lib/meteo";

export type EstatControl = {
  error?: string;
};

/** Converteix un text de formulari (admet coma decimal) a número o null. */
function aNumero(valor: FormDataEntryValue | null): number | null {
  if (valor === null) return null;
  const text = String(valor).trim().replace(",", ".");
  if (text === "") return null;
  const n = Number(text);
  return Number.isNaN(n) ? null : n;
}

/** Converteix un text de formulari a un enter dins el rang [min, max]. */
function aEnter(
  valor: FormDataEntryValue | null,
  min: number,
  max: number,
): number {
  const text = String(valor ?? "").trim();
  if (text === "") return min;
  const n = Math.trunc(Number(text));
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export async function afegeixControl(
  _prevState: EstatControl,
  formData: FormData,
): Promise<EstatControl> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Qualsevol usuari autenticat pot registrar controls (a més de la
  // protecció per RLS a la base de dades).

  const ph = aNumero(formData.get("ph"));
  const clor = aNumero(formData.get("clor"));
  const aspiracio = formData.get("aspiracio") === "on";
  const pastillesSkimmer = aEnter(formData.get("pastilles_skimmer"), 0, 20);
  const phCorregit = formData.get("ph_corregit") === "on";
  const clorAfegit = formData.get("clor_afegit") === "on";
  const aiguaOmplerta = formData.get("aigua_omplerta") === "on";
  const notes = String(formData.get("notes") || "").trim() || null;

  const ESTATS_DEPURADORA = ["blanc", "verd", "groc", "vermell"] as const;
  const estatDepuradoraRaw = String(
    formData.get("estat_depuradora") || "",
  ).trim();
  const estatDepuradora = (
    ESTATS_DEPURADORA as readonly string[]
  ).includes(estatDepuradoraRaw)
    ? estatDepuradoraRaw
    : null;

  const dataText = String(formData.get("measured_at") || "").trim();
  const measuredAt = dataText ? new Date(dataText) : new Date();
  if (Number.isNaN(measuredAt.getTime())) {
    return { error: "La data del control no és vàlida." };
  }

  if (
    ph === null &&
    clor === null &&
    !aspiracio &&
    pastillesSkimmer === 0 &&
    !phCorregit &&
    !clorAfegit &&
    !aiguaOmplerta &&
    estatDepuradora === null
  ) {
    return {
      error: "Indica almenys un valor (pH, clor, una acció o l'estat de la depuradora).",
    };
  }

  const problemes = comprovaRangs(ph, clor);
  const foraDeRang = problemes.length > 0;

  // Obté la meteorologia actual de Castellar del Vallès. Si l'API no respon,
  // desem el control igualment amb el temps buit (mai bloquegem el registre).
  const meteo = await obteMeteoActual();

  const { error } = await supabase.from("controls").insert({
    measured_at: measuredAt.toISOString(),
    ph,
    clor,
    aspiracio,
    pastilles_skimmer: pastillesSkimmer,
    ph_corregit: phCorregit,
    clor_afegit: clorAfegit,
    aigua_omplerta: aiguaOmplerta,
    estat_depuradora: estatDepuradora,
    temperatura: meteo?.temperatura ?? null,
    codi_meteo: meteo?.codi ?? null,
    notes,
    fora_de_rang: foraDeRang,
    created_by: user.id,
  });

  if (error) {
    return { error: "No s'ha pogut desar el control: " + error.message };
  }

  // Si hi ha valors fora de rang, avisa per correu tots els usuaris.
  if (foraDeRang) {
    const { data: usuaris } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    const destinataris = (usuaris ?? [])
      .map((u) => u.email as string)
      .filter(Boolean);

    await enviaAlertaForaDeRang(destinataris, {
      problemes,
      mesuratEl: measuredAt,
      notes,
    });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?ok=1");
}
