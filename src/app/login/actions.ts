"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstatLogin = {
  ok?: boolean;
  error?: string;
};

/**
 * Envia un correu de recuperació de contrasenya. L'enllaç porta l'usuari, via
 * /auth/confirm, fins a /reset-password per establir-hi una contrasenya nova.
 */
export async function enviaCorreuRecuperacio(
  _prevState: EstatLogin,
  formData: FormData,
): Promise<EstatLogin> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Introdueix una adreça de correu vàlida." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return {
      error:
        "No s'ha pogut enviar el correu. Torna-ho a provar d'aquí una estona.",
    };
  }

  return { ok: true };
}

/**
 * Inicia la sessió amb correu i contrasenya.
 */
export async function iniciaSessioAmbContrasenya(
  _prevState: EstatLogin,
  formData: FormData,
): Promise<EstatLogin> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const contrasenya = String(formData.get("contrasenya") || "");

  if (!email || !email.includes("@")) {
    return { error: "Introdueix una adreça de correu vàlida." };
  }

  if (!contrasenya) {
    return { error: "Introdueix la contrasenya." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasenya,
  });

  if (error) {
    // Supabase retorna "invalid_credentials" (HTTP 400) quan el correu o la
    // contrasenya no són correctes. Qualsevol altre codi (401/403/5xx) indica
    // un problema de configuració o de connexió, no unes credencials dolentes.
    const credencialsInvalides =
      error.status === 400 || error.code === "invalid_credentials";

    if (!credencialsInvalides) {
      console.error("[login] Error inesperat de Supabase auth:", {
        status: error.status,
        code: error.code,
        message: error.message,
      });
      return {
        error:
          "No s'ha pogut iniciar la sessió. Torna-ho a provar d'aquí una estona.",
      };
    }

    return { error: "Correu o contrasenya incorrectes." };
  }

  redirect("/dashboard");
}

/** Tanca la sessió de l'usuari. */
export async function tancaSessio() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
