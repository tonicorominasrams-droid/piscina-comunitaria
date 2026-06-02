import Link from "next/link";

/**
 * Botó d'acció flotant (FAB) per a mòbil. Enllaça a la pàgina de nou control.
 * Es mostra fixat a baix a la dreta i només en pantalles petites; en tauleta i
 * escriptori s'usa l'enllaç de la capçalera.
 */
export default function FabNouControl() {
  return (
    <Link
      href="/dashboard/nou"
      aria-label="Nou control"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-aigua-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-aigua-600/30 transition hover:bg-aigua-700 active:scale-95 sm:hidden"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
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
  );
}
