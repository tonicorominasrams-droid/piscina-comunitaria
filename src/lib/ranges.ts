/**
 * Rangs de referència dels paràmetres de l'aigua.
 *
 * Basats en el RD 742/2013 (criteris tecnicosanitaris de les piscines a
 * l'Estat espanyol). Pots ajustar-los segons la normativa de la teva zona.
 */
export const RANGS = {
  ph: { min: 7.2, max: 8.0, label: "pH", unitat: "" },
  clor: { min: 0.5, max: 2.0, label: "Clor lliure", unitat: "mg/L" },
} as const;

export type Problema = {
  parametre: "pH" | "Clor lliure";
  valor: number;
  rang: string;
  missatge: string;
};

/**
 * Comprova si els valors mesurats estan fora dels rangs recomanats.
 * Retorna una llista de problemes (buida si tot és correcte).
 */
export function comprovaRangs(
  ph: number | null,
  clor: number | null,
): Problema[] {
  const problemes: Problema[] = [];

  if (ph !== null && !Number.isNaN(ph)) {
    if (ph < RANGS.ph.min || ph > RANGS.ph.max) {
      problemes.push({
        parametre: "pH",
        valor: ph,
        rang: `${RANGS.ph.min} – ${RANGS.ph.max}`,
        missatge: `El pH és ${ph} (rang recomanat: ${RANGS.ph.min}–${RANGS.ph.max}).`,
      });
    }
  }

  if (clor !== null && !Number.isNaN(clor)) {
    if (clor < RANGS.clor.min || clor > RANGS.clor.max) {
      problemes.push({
        parametre: "Clor lliure",
        valor: clor,
        rang: `${RANGS.clor.min} – ${RANGS.clor.max} ${RANGS.clor.unitat}`,
        missatge: `El clor lliure és ${clor} mg/L (rang recomanat: ${RANGS.clor.min}–${RANGS.clor.max} mg/L).`,
      });
    }
  }

  return problemes;
}

/** Indica si un valor concret de pH està fora de rang. */
export function phForaDeRang(ph: number | null): boolean {
  if (ph === null || Number.isNaN(ph)) return false;
  return ph < RANGS.ph.min || ph > RANGS.ph.max;
}

/** Indica si un valor concret de clor està fora de rang. */
export function clorForaDeRang(clor: number | null): boolean {
  if (clor === null || Number.isNaN(clor)) return false;
  return clor < RANGS.clor.min || clor > RANGS.clor.max;
}
