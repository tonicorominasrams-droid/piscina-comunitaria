/**
 * Utilitats de dates en hora local de la piscina (CET / CEST, Europe/Madrid).
 *
 * IMPORTANT: el servidor pot funcionar en UTC (Vercel, etc.). Si calculem
 * "avui" o "ahir" amb l'hora del servidor, un control fet a les 23:30 (hora
 * d'aquí) es comptaria com del dia següent o anterior. Per evitar-ho, totes
 * les operacions de calendari es fan SEMPRE en hora de Madrid.
 */

/** Zona horària de referència de l'aplicació. */
export const ZONA = "Europe/Madrid";

const MS_PER_DIA = 1000 * 60 * 60 * 24;
const MS_PER_HORA = 1000 * 60 * 60;

/**
 * Clau del dia (YYYY-MM-DD) corresponent a una data, en hora de Madrid.
 * Fem servir el locale "en-CA" perquè dona directament el format ISO.
 */
export function clauDiaCET(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Diferència en DIES DE CALENDARI (hora de Madrid) entre dues dates: el
 * resultat és `a - b` en dies sencers. Per exemple, si `a` és avui i `b` és
 * ahir, retorna 1, independentment de l'hora concreta de cada moment.
 */
export function diesCalendariCET(a: Date, b: Date): number {
  const [ay, am, ad] = clauDiaCET(a).split("-").map(Number);
  const [by, bm, bd] = clauDiaCET(b).split("-").map(Number);
  const ua = Date.UTC(ay, am - 1, ad);
  const ub = Date.UTC(by, bm - 1, bd);
  return Math.round((ua - ub) / MS_PER_DIA);
}

/** Hores transcorregudes entre dues dates (a - b), amb decimals. */
export function horesEntre(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / MS_PER_HORA;
}

/**
 * Fragment de text en català que descriu fa quant es va fer un control,
 * comptat en dies de calendari en hora de Madrid ("avui", "ahir", "fa N dies").
 */
export function fragmentDiesCET(dies: number): string {
  if (dies <= 0) return "L'últim control s'ha fet avui";
  if (dies === 1) return "Fa 1 dia de l'últim control";
  return `Fa ${dies} dies de l'últim control`;
}
