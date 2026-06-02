import type { Problema } from "./ranges";

type DadesAlerta = {
  problemes: Problema[];
  mesuratEl: Date;
  notes?: string | null;
};

/**
 * Envia un correu d'alerta a tots els destinataris quan algun valor està
 * fora de rang. Fa servir l'API de Resend (https://resend.com).
 *
 * Si RESEND_API_KEY no està configurada, no falla: només registra l'avís a
 * la consola del servidor, de manera que l'app continua funcionant.
 */
export async function enviaAlertaForaDeRang(
  destinataris: string[],
  dades: DadesAlerta,
): Promise<{ enviat: boolean; motiu?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || "onboarding@resend.dev";

  if (destinataris.length === 0) {
    return { enviat: false, motiu: "Cap destinatari." };
  }

  if (!apiKey) {
    console.warn(
      "[alerta] RESEND_API_KEY no configurada. No s'enviarà el correu. " +
        `Destinataris: ${destinataris.join(", ")}. Problemes: ` +
        dades.problemes.map((p) => p.missatge).join(" "),
    );
    return { enviat: false, motiu: "RESEND_API_KEY no configurada." };
  }

  const dataFormatada = new Intl.DateTimeFormat("ca-ES", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(dades.mesuratEl);

  const llistaProblemes = dades.problemes
    .map((p) => `<li><strong>${p.parametre}:</strong> ${p.missatge}</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #1369dc;">⚠️ Alerta de la piscina comunitària</h2>
      <p>S'ha registrat un control amb valors <strong>fora del rang recomanat</strong>.</p>
      <p><strong>Data del control:</strong> ${dataFormatada}</p>
      <ul>${llistaProblemes}</ul>
      ${dades.notes ? `<p><strong>Notes:</strong> ${dades.notes}</p>` : ""}
      <p>Es recomana no fer servir la piscina fins que els valors es normalitzin.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:12px;color:#6b7280;">Aquest és un avís automàtic de l'aplicació de la piscina comunitària.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: destinataris,
        subject: "⚠️ Piscina comunitària: valors de l'aigua fora de rang",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[alerta] Error enviant el correu amb Resend:", text);
      return { enviat: false, motiu: `Resend ha retornat ${res.status}.` };
    }

    return { enviat: true };
  } catch (err) {
    console.error("[alerta] Excepció enviant el correu:", err);
    return { enviat: false, motiu: "Excepció en la crida a Resend." };
  }
}

/**
 * Envia un recordatori a tots els destinataris quan fa massa dies que no es
 * registra cap control de la piscina. Igual que l'alerta, no falla si
 * RESEND_API_KEY no està configurada: només ho registra a la consola.
 */
export async function enviaRecordatoriControl(
  destinataris: string[],
  diesSenseControl = 4,
  frase?: string,
): Promise<{ enviat: boolean; motiu?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || "onboarding@resend.dev";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (destinataris.length === 0) {
    return { enviat: false, motiu: "Cap destinatari." };
  }

  if (!apiKey) {
    console.warn(
      "[recordatori] RESEND_API_KEY no configurada. No s'enviarà el correu. " +
        `Destinataris: ${destinataris.join(", ")}.`,
    );
    return { enviat: false, motiu: "RESEND_API_KEY no configurada." };
  }

  const dades = `Fa ${diesSenseControl} dies que no es registra cap control de la piscina. Recorda fer la revisió!`;
  const missatge = frase || dades;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #1369dc;">🏊 Recordatori de la piscina comunitària</h2>
      <p style="font-size:17px;">${missatge}</p>
      <p style="color:#6b7280;">${dades}</p>
      <p style="margin:24px 0;">
        <a href="${siteUrl}/dashboard"
           style="display:inline-block;background:#1682f0;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;">
          Registrar un control
        </a>
      </p>
      <p style="font-size:14px;color:#6b7280;">
        O obre l'aplicació: <a href="${siteUrl}">${siteUrl}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:12px;color:#6b7280;">Aquest és un avís automàtic de l'aplicació de la piscina comunitària.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: destinataris,
        subject: "🏊 Piscina comunitària: cal fer la revisió",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[recordatori] Error enviant el correu amb Resend:", text);
      return { enviat: false, motiu: `Resend ha retornat ${res.status}.` };
    }

    return { enviat: true };
  } catch (err) {
    console.error("[recordatori] Excepció enviant el correu:", err);
    return { enviat: false, motiu: "Excepció en la crida a Resend." };
  }
}
