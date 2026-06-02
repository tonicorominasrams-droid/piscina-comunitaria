"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstatRegistre = {
  ok?: boolean;
  error?: string;
};

/**
 * Registra un usuari nou amb nom complet, correu i contrasenya.
 *
 * El nom complet es desa a "profiles" mitjançant el trigger handle_new_user,
 * que llegeix raw_user_meta_data ->> 'full_name'. L'usuari obté el rol "veí"
 * (neighbor) per defecte i pot accedir a l'app sense aprovació d'un administrador.
 */
export async function registraUsuari(
  _prevState: EstatRegistre,
  formData: FormData,
): Promise<EstatRegistre> {
  const nom = String(formData.get("nom") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const contrasenya = String(formData.get("contrasenya") || "");

  if (!nom) {
    return { error: "Introdueix el teu nom complet." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Introdueix una adreça de correu vàlida." };
  }

  if (contrasenya.length < 8) {
    return { error: "La contrasenya ha de tenir com a mínim 8 caràcters." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password: contrasenya,
    options: {
      data: { full_name: nom },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    // L'usuari ja existeix o bé la contrasenya és massa feble segons Supabase.
    if (error.code === "user_already_exists" || error.status === 422) {
      return {
        error:
          "Ja existeix un compte amb aquest correu. Prova d'iniciar sessió.",
      };
    }
    console.error("[registre] Error inesperat de Supabase auth:", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return {
      error:
        "No s'ha pogut crear el compte. Torna-ho a provar d'aquí una estona.",
    };
  }

  // Si la confirmació de correu està desactivada, signUp ja retorna una sessió
  // i podem entrar directament a l'app. Si està activada, cal confirmar el correu.
  if (data.session) {
    redirect("/dashboard");
  }

  return { ok: true };
}
