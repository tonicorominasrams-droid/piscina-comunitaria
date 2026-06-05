/**
 * Estat global de la piscina representat amb un semàfor (verd, groc, vermell).
 *
 * Combina dos criteris, sempre calculats en hora de Madrid (CET/CEST):
 *   · La recència de l'últim control.
 *   · El nivell dels valors de l'últim control (correctes, límit o fora de rang).
 *   · Si s'ha aplicat tractament correctiu (correcció de pH, clor o pastilles).
 *
 * Regles (la pitjor de les dues mana):
 *   🟢 Verd    → últim control fa ≤ 48 h I (valors dins de rang O s'ha
 *                aplicat tractament correctiu).
 *   🟡 Groc    → últim control fa entre 48 h i 4 dies O algun valor a tocar
 *                del límit (sense tractament que ho justifiqui).
 *   🔴 Vermell → últim control fa més de 4 dies O (valors fora de rang I
 *                no s'ha aplicat cap tractament correctiu).
 */

import { nivellGlobal } from "./ranges";
import { diesCalendariCET, fragmentDiesCET, horesEntre } from "./temps";
import { fraseVerda } from "./frases";

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
const HORES_VERD = 48;
/** Dies a partir dels quals l'estat passa a vermell. */
const DIES_VERMELL = 4;

type UltimControl = {
  measured_at: string;
  ph: number | null;
  clor: number | null;
  ph_corregit?: boolean | null;
  clor_afegit?: boolean | null;
  pastilles_skimmer?: number | null;
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

  // S'ha aplicat tractament correctiu durant aquest control?
  const tractament = !!(
    ultim.ph_corregit ||
    ultim.clor_afegit ||
    (ultim.pastilles_skimmer != null && ultim.pastilles_skimmer > 0)
  );

  // Si hi ha tractament, considerem els valors com a correctes a efectes del semàfor.
  const nivellEfectiu = tractament ? "ok" : nivell;

  // 🔴 Vermell: massa dies o valors fora de rang sense tractament.
  if (dies > DIES_VERMELL || nivellEfectiu === "fora") {
    const motiu =
      nivellEfectiu === "fora"
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

  // 🟡 Groc: ja fa més de 48 h de la revisió o valors a tocar del límit.
  if (hores > HORES_VERD || nivellEfectiu === "limit") {
    const motiu =
      nivellEfectiu === "limit"
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

  // 🟢 Verd: revisat fa menys de 48 h i valors correctes (o amb tractament aplicat).
  return {
    color: "verd",
    emoji: "🟢",
    titol: "Tot correcte",
    missatge: fraseVerda(),
    diesSense: dies,
  };
}
