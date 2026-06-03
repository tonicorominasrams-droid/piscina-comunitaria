/**
 * Estat global de la piscina representat amb un semàfor (verd, groc, vermell).
 *
 * Combina dos criteris, sempre calculats en hora de Madrid (CET/CEST):
 *   · La recència de l'últim control.
 *   · El nivell dels valors de l'últim control (correctes, límit o fora de rang).
 *
 * Regles (la pitjor de les dues mana), segons l'especificació:
 *   🟢 Verd    → tots els valors dins de rang I últim control fa ≤ 24 hores.
 *   🟡 Groc    → últim control fa entre 1 i 4 dies O algun valor a tocar del límit.
 *   🔴 Vermell → últim control fa més de 4 dies O algun valor fora de rang.
 *
 * El color i el missatge deriven SEMPRE del mateix càlcul, de manera que la
 * recomanació que es mostra mai contradiu el color del semàfor.
 */

import { nivellGlobal } from "./ranges";
import { diesCalendariCET, fragmentDiesCET, horesEntre } from "./temps";

export type ColorSemafor = "verd" | "groc" | "vermell";

export type EstatPiscina = {
  color: ColorSemafor;
  emoji: string;
  titol: string;
  missatge: string;
  /** Dies de calendari (CET) des de l'últim control (null si no n'hi ha cap). */
  diesSense: number | null;
};

/** Hores a partir de les quals deixa de ser "recent" (semàfor verd). */
const HORES_VERD = 24;
/** Dies a partir dels quals l'estat passa a vermell. */
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

  const mesurat = new Date(ultim.measured_at);
  const dies = diesCalendariCET(ara, mesurat);
  const hores = horesEntre(ara, mesurat);
  const nivell = nivellGlobal(ultim.ph, ultim.clor);
  const fragmentDies = fragmentDiesCET(dies);

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

  // 🟡 Groc: ja fa dies de la revisió o valors a tocar del límit.
  if (hores > HORES_VERD || nivell === "limit") {
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

  // 🟢 Verd: revisat fa menys de 24 h i valors correctes.
  return {
    color: "verd",
    emoji: "🟢",
    titol: "Tot correcte",
    missatge: `${fragmentDies} i els valors són correctes. La piscina està a punt!`,
    diesSense: dies,
  };
}
