/**
 * Integració amb l'API de Claude (Anthropic) per analitzar la tira reactiva
 * de la piscina mitjançant visió per ordinador.
 *
 * Segueix el mateix patró que `email.ts`: crida HTTP directa amb `fetch` i
 * lectura de la clau des de les variables d'entorn. Si ANTHROPIC_API_KEY no
 * està configurada, retorna un error controlat (no llança excepció).
 */

/** Correu de l'únic usuari amb accés a la funció "Registre amb IA (beta)". */
export const EMAIL_BETA_IA = "tonicorominasrams@gmail.com";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL_IA = "claude-sonnet-4-20250514";

export type ResultatAnalisi = {
  ok: boolean;
  ph: number | null;
  clor: number | null;
  /** Comentari curt del model sobre la lectura (qualitat, dubtes, etc.). */
  comentari?: string;
  error?: string;
};

/** Tipus d'imatge admesos per l'API de visió de Claude. */
const TIPUS_ADMESOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type TipusImatge = (typeof TIPUS_ADMESOS)[number];

export function esTipusImatgeAdmes(tipus: string): tipus is TipusImatge {
  return (TIPUS_ADMESOS as readonly string[]).includes(tipus);
}

const PROMPT = `Ets un assistent expert en química de piscines. A la imatge hi ha una tira reactiva (test strip) per mesurar la qualitat de l'aigua d'una piscina.

Analitza els colors dels quadrats de la tira i compara'ls amb les escales de referència habituals d'aquestes tires per determinar:
- El pH de l'aigua.
- El clor lliure (free chlorine) en ppm (mg/L).

Respon EXCLUSIVAMENT amb un objecte JSON vàlid, sense cap text addicional ni format markdown, amb aquesta estructura exacta:
{"ph": number|null, "clor": number|null, "comentari": string}

On:
- "ph": el valor de pH detectat (per exemple 7.4) o null si no es pot determinar.
- "clor": el clor lliure en ppm (per exemple 1.2) o null si no es pot determinar.
- "comentari": una frase breu en català sobre la fiabilitat de la lectura.`;

type ContingutResposta = { type: string; text?: string };

/**
 * Extreu el primer objecte JSON que aparegui dins d'un text (per si el model
 * afegeix text abans o després tot i les instruccions).
 */
function extreuJson(text: string): unknown | null {
  const inici = text.indexOf("{");
  const fi = text.lastIndexOf("}");
  if (inici === -1 || fi === -1 || fi <= inici) return null;
  try {
    return JSON.parse(text.slice(inici, fi + 1));
  } catch {
    return null;
  }
}

/** Converteix un valor desconegut a número o null (admet coma decimal). */
function aNumero(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor === "string") {
    const n = Number(valor.trim().replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

/**
 * Envia la imatge de la tira reactiva a Claude i retorna els valors detectats.
 *
 * @param imatgeBase64 Dades de la imatge codificades en base64 (sense prefix).
 * @param tipus        Tipus MIME de la imatge (image/jpeg, image/png, …).
 */
export async function analitzaTira(
  imatgeBase64: string,
  tipus: TipusImatge,
): Promise<ResultatAnalisi> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("[ia] ANTHROPIC_API_KEY no configurada.");
    return {
      ok: false,
      ph: null,
      clor: null,
      error:
        "La funció d'IA no està configurada al servidor (falta ANTHROPIC_API_KEY).",
    };
  }

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_IA,
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: tipus,
                  data: imatgeBase64,
                },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[ia] Error de l'API de Claude:", res.status, text);
      return {
        ok: false,
        ph: null,
        clor: null,
        error: `L'API de Claude ha retornat ${res.status}.`,
      };
    }

    const data = (await res.json()) as { content?: ContingutResposta[] };
    const text =
      data.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n")
        .trim() ?? "";

    const json = extreuJson(text) as
      | { ph?: unknown; clor?: unknown; comentari?: unknown }
      | null;

    if (!json) {
      console.error("[ia] No s'ha pogut interpretar la resposta:", text);
      return {
        ok: false,
        ph: null,
        clor: null,
        error: "No s'ha pogut interpretar la resposta de l'IA.",
      };
    }

    return {
      ok: true,
      ph: aNumero(json.ph),
      clor: aNumero(json.clor),
      comentari:
        typeof json.comentari === "string" ? json.comentari : undefined,
    };
  } catch (err) {
    console.error("[ia] Excepció en la crida a Claude:", err);
    return {
      ok: false,
      ph: null,
      clor: null,
      error: "Hi ha hagut un error en contactar amb l'IA.",
    };
  }
}
