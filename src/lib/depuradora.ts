/**
 * Estats possibles de la depuradora, amb el color visual i la descripció
 * que es mostren tant al formulari com a l'històric.
 */
export type EstatDepuradora = "blanc" | "verd" | "groc" | "vermell";

export type OpcioDepuradora = {
  valor: EstatDepuradora;
  etiqueta: string;
  descripcio: string;
  /** Classes de Tailwind per al botó/indicador de color. */
  swatch: string;
};

export const ESTATS_DEPURADORA: readonly OpcioDepuradora[] = [
  {
    valor: "blanc",
    etiqueta: "Blanc",
    descripcio: "Cal purgar o netejar el filtre",
    swatch: "bg-white border-slate-300",
  },
  {
    valor: "verd",
    etiqueta: "Verd",
    descripcio: "Funciona perfectament",
    swatch: "bg-green-500 border-green-600",
  },
  {
    valor: "groc",
    etiqueta: "Groc",
    descripcio: "Atenció, revisar",
    swatch: "bg-yellow-400 border-yellow-500",
  },
  {
    valor: "vermell",
    etiqueta: "Vermell",
    descripcio: "Cal netejar i esbandir la depuradora",
    swatch: "bg-red-500 border-red-600",
  },
] as const;

export function opcioDepuradora(
  valor: string | null,
): OpcioDepuradora | undefined {
  if (!valor) return undefined;
  return ESTATS_DEPURADORA.find((o) => o.valor === valor);
}
