/**
 * Estat global de la piscina representat amb un semàfor (verd, groc, vermell).
 *
 * Combina dos criteris:
 *   · La recència de l'últim control (dies des de l'última revisió).
 *   · El nivell dels valors de l'últim control (correctes, límit o fora de rang).
 *
 * Regles (la pitjor de les dues mana):
 *   🟢 Verd    → últim control recent (≤ 2 dies) i tots els valors correctes.
 *   🟡 Groc    → últim control fa més de 2 dies O valors a tocar del límit.
 *   🔴 Vermell → últim control fa més de 4 dies O valors fora de rang.
 */

import { nivellGlobal } from "./ranges";

export type ColorSemafor = "verd" | "groc" | "vermell";

export type EstatPiscina = {
  color: ColorSemafor;
  emoji: string;
  titol: string;
  missatge: string;
  /** Dies sencers des de l'últim control (null si no n'hi ha cap). */
  diesSense: number | null;
};

const MS_PER_DIA = 1000 * 60 * 60 * 24;

/** Dies a partir dels quals l'estat passa a groc i a vermell. */
const DIES_GROC = 2;
const DIES_VERMELL = 4;

type UltimControl = {
  measured_at: string;
  ph: number | null;
  clor: number | null;
} | null;

/**
 * Calcula l'estat de la piscina a partir de l'últim control registrat.
 *
 * @param ultim Últim control (el més recent) o null si no n'hi ha cap.
 * @param ara   Moment actual (injectable per a proves).
 */
export function calculaEstat(
  ultim: UltimControl,
  ara: Date = new Date(),
): EstatPiscina {
  if (!ultim) {
    return {
      color: "vermell",
      emoji: "🔴",
      titol: "Sense controls",
      missatge:
        "Encara no hi ha cap control registrat. Fes la primera revisió de la piscina.",
      diesSense: null,
    };
  }

  const dies = Math.floor(
    (ara.getTime() - new Date(ultim.measured_at).getTime()) / MS_PER_DIA,
  );
  const nivell = nivellGlobal(ultim.ph, ultim.clor);

  const fragmentDies =
    dies <= 0
      ? "L'últim control s'ha fet avui"
      : dies === 1
        ? "Fa 1 dia de l'últim control"
        : `Fa ${dies} dies de l'últim control`;

  // 🔴 Vermell: massa dies o valors fora de rang.
  if (dies > DIES_VERMELL || nivell === "fora") {
    const motiu =
      nivell === "fora"
        ? "els valors de l'aigua estan fora de rang"
        : "fa massa dies que no es revisa";
    return {
      color: "vermell",
      emoji: "🔴",
      titol: "Cal actuar",
      missatge: `${fragmentDies} i ${motiu}. Convé revisar la piscina com abans millor.`,
      diesSense: dies,
    };
  }

  // 🟡 Groc: comença a fer dies o valors a tocar del límit.
  if (dies > DIES_GROC || nivell === "limit") {
    const motiu =
      nivell === "limit"
        ? "algun valor està a tocar del límit recomanat"
        : "ja comença a fer dies de l'última revisió";
    return {
      color: "groc",
      emoji: "🟡",
      titol: "Atenció",
      missatge: `${fragmentDies} i ${motiu}. Estaria bé fer una ullada aviat.`,
      diesSense: dies,
    };
  }

  // 🟢 Verd: tot al dia.
  return {
    color: "verd",
    emoji: "🟢",
    titol: "Tot correcte",
    missatge: `${fragmentDies} i els valors són correctes. La piscina està a punt!`,
    diesSense: dies,
  };
}
