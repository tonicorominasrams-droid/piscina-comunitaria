"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstatReset = {
  error?: string;
};

/**
 * Estableix una contrasenya nova per a l'usuari.
 *
 * Cal que hi hagi una sessió de recuperació activa, creada quan l'usuari obre
 * l'enllaç del correu (que passa per /auth/confirm amb type=recovery).
 */
export async function actualitzaContrasenya(
  _prevState: EstatReset,
  formData: FormData,
): Promise<EstatReset> {
  const contrasenya = String(formData.get("contrasenya") || "");
  const confirmacio = String(formData.get("confirmacio") || "");

  if (contrasenya.length < 8) {
    return { error: "La contrasenya ha de tenir com a mínim 8 caràcters." };
  }

  if (contrasenya !== confirmacio) {
    return { error: "Les contrasenyes no coincideixen." };
  }

  const supabase = await createClient();

  // Comprova que hi ha una sessió de recuperació vàlida abans de res.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "L'enllaç de recuperació no és vàlid o ha caducat. Torna a demanar-ne un de nou.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: contrasenya });

  if (error) {
    return {
      error: "No s'ha pogut actualitzar la contrasenya. Torna-ho a provar.",
    };
  }

  redirect("/dashboard");
}
