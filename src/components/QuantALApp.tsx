"use client";

import { useEffect, useState } from "react";
import { RANGS } from "@/lib/ranges";

const VERSIO = "2026.1.005";
const DATA_INICI_APP = "2025";

type Stats = {
  totalControls: number;
  totalVeins: number;
  diesActiva: number;
};

type EstatPush = "activat" | "desactivat" | "denegat" | "no-suportat";

function detectaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function detectaEstatPush(): EstatPush {
  if (
    typeof window === "undefined" ||
    !("Notification" in window)
  )
    return "no-suportat";
  if (Notification.permission === "granted") return "activat";
  if (Notification.permission === "denied") return "denegat";
  return "desactivat";
}

export default function QuantALApp({
  className,
}: {
  className?: string;
}) {
  const [obert, setObert] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [carregant, setCarregant] = useState(false);
  const [esPwa, setEsPwa] = useState(false);
  const [estatPush, setEstatPush] = useState<EstatPush>("no-suportat");

  useEffect(() => {
    if (!obert) return;
    setEsPwa(detectaStandalone());
    setEstatPush(detectaEstatPush());
    if (stats) return;
    setCarregant(true);
    fetch("/api/app-stats")
      .then((r) => {
        if (!r.ok) throw new Error("error");
        return r.json();
      })
      .then((d: Stats) => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setCarregant(false));
  }, [obert, stats]);

  const pushInfo: { text: string; color: "green" | "red" | "slate"; icona: string } =
    estatPush === "activat"
      ? { text: "Activades", color: "green", icona: "🔔" }
      : estatPush === "denegat"
        ? { text: "Bloquejades", color: "red", icona: "🔕" }
        : estatPush === "no-suportat"
          ? { text: "No disponibles", color: "slate", icona: "🔕" }
          : { text: "Desactivades", color: "slate", icona: "🔕" };

  return (
    <>
      <button type="button" onClick={() => setObert(true)} className={className}>
        Quant a l&apos;app
      </button>

      {obert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quant a l'app"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setObert(false);
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            {/* Capçalera gradient */}
            <div className="relative bg-gradient-to-br from-aigua-600 via-aigua-700 to-purple-700 px-5 pb-5 pt-6 text-white">
              <button
                type="button"
                onClick={() => setObert(false)}
                aria-label="Tanca"
                className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-5xl" aria-hidden>
                  🏊
                </span>
                <div>
                  <h2 className="text-xl font-bold leading-tight">
                    Piscina Comunitària
                  </h2>
                  <p className="mt-0.5 text-sm text-white/75">
                    Versió {VERSIO} · {DATA_INICI_APP}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/90">
                Gestió intel·ligent de l&apos;aigua de la piscina comunitària.
                Controla el pH i el clor, rep notificacions i manté l&apos;aigua
                en condicions òptimes per a tots els veïns.
              </p>
            </div>

            {/* Contingut */}
            <div className="space-y-5 px-5 py-5">
              {/* Dades de la piscina */}
              <Seccio titol="Dades de la piscina" icona="💧">
                <div className="grid grid-cols-3 gap-2">
                  <Tarja titol="Volum" valor="30 m³" />
                  <Tarja
                    titol="pH recomanat"
                    valor={`${RANGS.ph.min}–${RANGS.ph.max}`}
                    subtitol={`ideal ${RANGS.ph.ideal}`}
                  />
                  <Tarja
                    titol="Clor lliure"
                    valor={`${RANGS.clor.min}–${RANGS.clor.max}`}
                    subtitol={RANGS.clor.unitat}
                  />
                </div>
              </Seccio>

              {/* Estadístiques globals */}
              <Seccio titol="Estadístiques globals" icona="📊">
                {carregant ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                    Carregant…
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Tarja titol="Controls" valor={String(stats.totalControls)} />
                    <Tarja titol="Dies activa" valor={String(stats.diesActiva)} />
                    <Tarja titol="Veïns" valor={String(stats.totalVeins)} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No disponible</p>
                )}
              </Seccio>

              {/* Estat del dispositiu */}
              <Seccio titol="Aquest dispositiu" icona="📱">
                <div className="space-y-2">
                  <FilaEstat
                    etiqueta="Mode d'ús"
                    valor={esPwa ? "PWA instal·lada" : "Navegador web"}
                    color={esPwa ? "green" : "slate"}
                    icona={esPwa ? "✅" : "🌐"}
                  />
                  <FilaEstat
                    etiqueta="Notificacions"
                    valor={pushInfo.text}
                    color={pushInfo.color}
                    icona={pushInfo.icona}
                  />
                </div>
              </Seccio>

              {/* Peu */}
              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-400">
                  © 2026 Toni Corominas. Tots els drets reservats.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Seccio({
  titol,
  icona,
  children,
}: {
  titol: string;
  icona: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <span aria-hidden>{icona}</span>
        {titol}
      </h3>
      {children}
    </section>
  );
}

function Tarja({
  titol,
  valor,
  subtitol,
}: {
  titol: string;
  valor: string;
  subtitol?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-3 text-center ring-1 ring-slate-100">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {titol}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{valor}</p>
      {subtitol && (
        <p className="mt-0.5 text-[10px] text-slate-400">{subtitol}</p>
      )}
    </div>
  );
}

function FilaEstat({
  etiqueta,
  valor,
  color,
  icona,
}: {
  etiqueta: string;
  valor: string;
  color: "green" | "red" | "slate";
  icona: string;
}) {
  const badgeColors = {
    green: "bg-green-50 text-green-700 ring-green-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <span className="text-sm text-slate-600">{etiqueta}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badgeColors[color]}`}
      >
        <span aria-hidden>{icona}</span>
        {valor}
      </span>
    </div>
  );
}
