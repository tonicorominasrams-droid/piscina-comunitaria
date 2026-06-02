import Link from "next/link";

/**
 * Botons d'acció flotants (FAB) per a mòbil. Agrupen, alineats a baix a la
 * dreta, l'accés al "Registre amb IA (beta)" i a un "Nou control". Només es
 * mostren en pantalles petites; en tauleta i escriptori s'usen els enllaços de
 * la capçalera.
 */
export default function FabNouControl() {
  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-stretch gap-3 sm:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/nou-control-ia"
        aria-label="Registre amb IA (beta)"
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-aigua-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-700 hover:to-aigua-700 active:scale-95"
      >
        <span aria-hidden>✨</span>
        Registre amb IA
        <span className="inline-flex items-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Beta
        </span>
      </Link>
      <Link
        href="/dashboard/nou"
        aria-label="Nou control"
        className="flex items-center justify-center gap-2 rounded-full bg-aigua-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-aigua-600/30 transition hover:bg-aigua-700 active:scale-95"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        Nou control
      </Link>
    </div>
  );
}
