/**
 * Càlcul de dosatges de productes per a la piscina comunitària.
 *
 * Pensat per a un volum FIX de 30 m³ (30.000 L). Les fórmules són les
 * estàndard de química de piscines, amb constants clarament documentades
 * perquè es puguin ajustar segons el producte concret que es faci servir.
 *
 * ⚠️ Funció de càlcul orientativa (beta). Sempre cal afegir els productes
 * de mica en mica i tornar a mesurar.
 */

/** Volum de la piscina en metres cúbics. */
export const VOLUM_PISCINA_M3 = 30;

/** pH objectiu (punt mitjà del rang de treball 7,2–7,6). */
export const PH_OBJECTIU = 7.4;

/** Llindars de decisió per al pH (segons l'especificació). */
export const PH_MIN = 7.2;
export const PH_MAX = 7.6;

/** Clor lliure objectiu en ppm (mg/L). */
export const CLOR_OBJECTIU = 1.5;

/** Llindars de decisió per al clor lliure (ppm). */
export const CLOR_MIN = 1.0;
export const CLOR_MAX = 3.0;

/**
 * Producte líquid de pH (pujador "pH+" o baixador "pH-"):
 * ml de producte per m³ d'aigua per cada 0,1 unitats de pH a corregir.
 * Valor típic dels productes líquids comercials (~10 ml/m³ per 0,1 pH).
 * Per a 30 m³ → 300 ml per cada 0,1 unitats.
 */
const ML_PH_PER_M3_PER_DECIMA = 10;

/**
 * Clor en pols (hipoclorit càlcic). Riquesa de clor actiu del producte.
 * Els granulats habituals tenen ~65 % de clor disponible.
 */
const RIQUESA_CLOR_POLS = 0.65;

/**
 * Grams de clor PUR necessaris per pujar 1 ppm en 1 m³ d'aigua.
 * Per definició: 1 g de clor pur en 1.000 L puja el clor lliure 1 mg/L.
 */
const G_CLOR_PUR_PER_M3_PER_PPM = 1;

export type RecomanacioPh = {
  tipus: "ph";
  accio: "pujar" | "baixar" | "cap";
  /** Producte recomanat ("pH+" o "pH-"), si escau. */
  producte?: "pH+" | "pH-";
  /** Quantitat recomanada en mil·lilitres. */
  ml?: number;
  /** Missatge explicatiu en català. */
  missatge: string;
};

export type RecomanacioClor = {
  tipus: "clor";
  accio: "afegir" | "esperar" | "cap";
  /** Quantitat recomanada en grams de clor en pols, si escau. */
  grams?: number;
  /** Missatge explicatiu en català. */
  missatge: string;
};

/** Arrodoneix a un múltiple raonable per facilitar la dosificació real. */
function arrodoneix(valor: number, multiple: number): number {
  return Math.round(valor / multiple) * multiple;
}

/**
 * Calcula la recomanació de pH a partir del valor mesurat.
 * - pH < 7,2 → quants ml de pujador (pH+) cal afegir.
 * - pH > 7,6 → quants ml de baixador (pH-) cal afegir.
 * - en rang → cap acció.
 */
export function recomanacioPh(ph: number | null): RecomanacioPh {
  if (ph === null || Number.isNaN(ph)) {
    return {
      tipus: "ph",
      accio: "cap",
      missatge: "No s'ha detectat cap valor de pH.",
    };
  }

  if (ph < PH_MIN) {
    const decimes = (PH_OBJECTIU - ph) / 0.1;
    const ml = arrodoneix(
      decimes * ML_PH_PER_M3_PER_DECIMA * VOLUM_PISCINA_M3,
      10,
    );
    return {
      tipus: "ph",
      accio: "pujar",
      producte: "pH+",
      ml,
      missatge: `El pH és baix (${ph}). Afegeix aproximadament ${ml} ml de pujador de pH (pH+) per arribar a ${PH_OBJECTIU}.`,
    };
  }

  if (ph > PH_MAX) {
    const decimes = (ph - PH_OBJECTIU) / 0.1;
    const ml = arrodoneix(
      decimes * ML_PH_PER_M3_PER_DECIMA * VOLUM_PISCINA_M3,
      10,
    );
    return {
      tipus: "ph",
      accio: "baixar",
      producte: "pH-",
      ml,
      missatge: `El pH és alt (${ph}). Afegeix aproximadament ${ml} ml de baixador de pH (pH-) per arribar a ${PH_OBJECTIU}.`,
    };
  }

  return {
    tipus: "ph",
    accio: "cap",
    missatge: `El pH (${ph}) és dins del rang correcte (${PH_MIN}–${PH_MAX}). No cal fer res.`,
  };
}

/**
 * Calcula la recomanació de clor lliure a partir del valor mesurat.
 * - clor < 1,0 ppm → quants grams de clor en pols cal afegir.
 * - clor > 3,0 ppm → esperar, no afegir res.
 * - en rang → cap acció.
 */
export function recomanacioClor(clor: number | null): RecomanacioClor {
  if (clor === null || Number.isNaN(clor)) {
    return {
      tipus: "clor",
      accio: "cap",
      missatge: "No s'ha detectat cap valor de clor.",
    };
  }

  if (clor < CLOR_MIN) {
    const deficitPpm = CLOR_OBJECTIU - clor;
    const gramsPur = deficitPpm * G_CLOR_PUR_PER_M3_PER_PPM * VOLUM_PISCINA_M3;
    const gramsProducte = arrodoneix(gramsPur / RIQUESA_CLOR_POLS, 5);
    return {
      tipus: "clor",
      accio: "afegir",
      grams: gramsProducte,
      missatge: `El clor lliure és baix (${clor} ppm). Afegeix aproximadament ${gramsProducte} g de clor en pols per arribar a ${CLOR_OBJECTIU} ppm.`,
    };
  }

  if (clor > CLOR_MAX) {
    return {
      tipus: "clor",
      accio: "esperar",
      missatge: `El clor lliure és alt (${clor} ppm). No afegeixis res i espera que baixi abans de fer servir la piscina.`,
    };
  }

  return {
    tipus: "clor",
    accio: "cap",
    missatge: `El clor lliure (${clor} ppm) és dins del rang correcte (${CLOR_MIN}–${CLOR_MAX} ppm). No cal fer res.`,
  };
}

/** Calcula totes les recomanacions per a un control complet. */
export function calculaRecomanacions(ph: number | null, clor: number | null) {
  return {
    ph: recomanacioPh(ph),
    clor: recomanacioClor(clor),
    volum: VOLUM_PISCINA_M3,
  };
}
