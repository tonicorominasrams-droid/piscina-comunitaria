import type { EstatPiscina } from "@/lib/estat";

const ESTILS = {
  verd: {
    targeta: "bg-green-50 ring-green-200",
    titol: "text-green-800",
    text: "text-green-700",
  },
  groc: {
    targeta: "bg-amber-50 ring-amber-200",
    titol: "text-amber-800",
    text: "text-amber-700",
  },
  vermell: {
    targeta: "bg-red-50 ring-red-200",
    titol: "text-red-800",
    text: "text-red-700",
  },
} as const;

/** Una bombeta del semàfor: encesa (opaca) o apagada (translúcida). */
function Llum({ color, encesa }: { color: string; encesa: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-4 w-4 rounded-full ${color} ${
        encesa ? "opacity-100 shadow-sm" : "opacity-20"
      }`}
    />
  );
}

/**
 * Resum de l'estat de la piscina amb un semàfor de tres llums (verd, groc,
 * vermell). Component de presentació: rep l'estat ja calculat.
 */
export default function SemaforEstat({ estat }: { estat: EstatPiscina }) {
  const estil = ESTILS[estat.color];

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-4 py-4 ring-1 ${estil.targeta}`}
      role="status"
    >
      {/* Semàfor vertical */}
      <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-800/90 px-2 py-2">
        <Llum color="bg-red-500" encesa={estat.color === "vermell"} />
        <Llum color="bg-amber-400" encesa={estat.color === "groc"} />
        <Llum color="bg-green-500" encesa={estat.color === "verd"} />
      </div>

      <div className="min-w-0">
        <p className={`text-sm font-bold uppercase tracking-wide ${estil.titol}`}>
          {estat.emoji} {estat.titol}
        </p>
        <p className={`text-sm ${estil.text}`}>{estat.missatge}</p>
      </div>
    </div>
  );
}
