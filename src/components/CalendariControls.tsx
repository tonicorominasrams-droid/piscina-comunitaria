"use client";

import { useMemo, useState } from "react";
import { phForaDeRang, clorForaDeRang } from "@/lib/ranges";
import { opcioDepuradora, type EstatDepuradora } from "@/lib/depuradora";
import { descriuMeteo } from "@/lib/meteo";

export type ControlCalendari = {
  id: string;
  measured_at: string;
  ph: number | null;
  clor: number | null;
  aspiracio: boolean;
  pastilles_skimmer: number;
  ph_corregit: boolean;
  clor_afegit: boolean;
  aigua_omplerta: boolean;
  estat_depuradora: EstatDepuradora | null;
  temperatura: number | null;
  codi_meteo: number | null;
  notes: string | null;
  fora_de_rang: boolean;
};

const DIES_VISIBLES = 30;
const NOMS_DIES = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];
const NOMS_MESOS = [
  "gen.",
  "febr.",
  "març",
  "abr.",
  "maig",
  "juny",
  "jul.",
  "ag.",
  "set.",
  "oct.",
  "nov.",
  "des.",
];

/** Clau local d'un dia (YYYY-MM-DD) a partir d'una data. */
function clauDia(d: Date): string {
  const any = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${any}-${mes}-${dia}`;
}

/** Índex de dia de la setmana amb dilluns = 0 ... diumenge = 6. */
function indexDilluns(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function formataHora(iso: string): string {
  return new Intl.DateTimeFormat("ca-ES", { timeStyle: "short" }).format(
    new Date(iso),
  );
}

function formataDiaLlarg(d: Date): string {
  return new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export default function CalendariControls({
  controls,
}: {
  controls: ControlCalendari[];
}) {
  // Agrupa els controls per dia local.
  const perDia = useMemo(() => {
    const m = new Map<string, ControlCalendari[]>();
    for (const c of controls) {
      const clau = clauDia(new Date(c.measured_at));
      const llista = m.get(clau);
      if (llista) llista.push(c);
      else m.set(clau, [c]);
    }
    return m;
  }, [controls]);

  // Genera els últims 30 dies (del més antic al d'avui) i les cel·les buides
  // inicials perquè la graella quadri amb el dia de la setmana.
  const { celles, avuiClau } = useMemo(() => {
    const avui = new Date();
    avui.setHours(0, 0, 0, 0);

    const dies: Date[] = [];
    for (let i = DIES_VISIBLES - 1; i >= 0; i--) {
      const d = new Date(avui);
      d.setDate(avui.getDate() - i);
      dies.push(d);
    }

    const buides = indexDilluns(dies[0]);
    const celles: (Date | null)[] = [
      ...Array.from({ length: buides }, () => null),
      ...dies,
    ];
    return { celles, avuiClau: clauDia(avui) };
  }, []);

  const [seleccio, setSeleccio] = useState<string | null>(null);
  const controlsSeleccionats = seleccio ? (perDia.get(seleccio) ?? []) : [];
  const dataSeleccionada = seleccio ? new Date(seleccio + "T00:00:00") : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Últims 30 dies
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-500" aria-hidden />
            Amb control
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-200" aria-hidden />
            Sense control
          </span>
        </div>
      </div>

      {/* Capçalera dels dies de la setmana */}
      <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase text-slate-400">
        {NOMS_DIES.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Graella de dies */}
      <div className="grid grid-cols-7 gap-1.5">
        {celles.map((d, i) => {
          if (!d) return <div key={`buit-${i}`} />;

          const clau = clauDia(d);
          const teControl = perDia.has(clau);
          const esAvui = clau === avuiClau;
          const esSeleccionat = clau === seleccio;
          const quants = perDia.get(clau)?.length ?? 0;
          const algunForaRang = (perDia.get(clau) ?? []).some(
            (c) => c.fora_de_rang,
          );

          const base =
            "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition";
          const colors = teControl
            ? algunForaRang
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
            : "bg-slate-100 text-slate-400";
          const anell = esSeleccionat
            ? "ring-2 ring-aigua-600 ring-offset-1"
            : esAvui
              ? "ring-2 ring-slate-400"
              : "";

          return (
            <button
              key={clau}
              type="button"
              disabled={!teControl}
              onClick={() => setSeleccio(esSeleccionat ? null : clau)}
              aria-label={`${d.getDate()} de ${NOMS_MESOS[d.getMonth()]}${
                teControl ? `, ${quants} control(s)` : ", sense control"
              }`}
              className={`${base} ${colors} ${anell} ${
                teControl ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="font-semibold leading-none">{d.getDate()}</span>
              {quants > 1 && (
                <span className="mt-0.5 text-[10px] leading-none opacity-90">
                  ×{quants}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detall del dia seleccionat */}
      {seleccio && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold capitalize text-slate-800">
              {dataSeleccionada ? formataDiaLlarg(dataSeleccionada) : seleccio}
            </h3>
            <button
              type="button"
              onClick={() => setSeleccio(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Tanca ✕
            </button>
          </div>

          {controlsSeleccionats.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hi ha controls aquest dia.
            </p>
          ) : (
            <ul className="space-y-3">
              {controlsSeleccionats.map((c) => (
                <DetallControl key={c.id} control={c} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DetallControl({ control: c }: { control: ControlCalendari }) {
  const accions = [
    c.pastilles_skimmer > 0 &&
      `${c.pastilles_skimmer} ${
        c.pastilles_skimmer === 1 ? "pastilla" : "pastilles"
      } a l'skimmer`,
    c.ph_corregit && "pH corregit",
    c.clor_afegit && "Clor líquid o pols",
    c.aigua_omplerta && "Aigua afegida",
    c.aspiracio && "Neteja fons",
  ].filter(Boolean) as string[];

  const opcio = opcioDepuradora(c.estat_depuradora);
  const meteo =
    c.codi_meteo !== null || c.temperatura !== null
      ? descriuMeteo(c.codi_meteo)
      : null;

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-700">
          {formataHora(c.measured_at)}
          {meteo && (
            <span className="ml-2 text-slate-500" title={meteo.etiqueta}>
              {meteo.icona}
              {c.temperatura !== null && ` ${Math.round(c.temperatura)} °C`}
            </span>
          )}
        </span>
        {c.fora_de_rang ? (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Fora de rang
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Correcte
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
        <span>
          pH:{" "}
          <span
            className={`font-medium ${
              phForaDeRang(c.ph) ? "text-red-600" : "text-slate-800"
            }`}
          >
            {c.ph ?? "—"}
          </span>
        </span>
        <span>
          Clor:{" "}
          <span
            className={`font-medium ${
              clorForaDeRang(c.clor) ? "text-red-600" : "text-slate-800"
            }`}
          >
            {c.clor !== null ? `${c.clor} mg/L` : "—"}
          </span>
        </span>
        {opcio && (
          <span className="inline-flex items-center gap-1.5" title={opcio.descripcio}>
            Depuradora:
            <span
              className={`h-3 w-3 rounded-full border ${opcio.swatch}`}
              aria-hidden
            />
            <span className="font-medium text-slate-800">{opcio.etiqueta}</span>
          </span>
        )}
      </div>

      {accions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {accions.map((a) => (
            <span
              key={a}
              className="inline-flex items-center rounded-full bg-aigua-50 px-2 py-0.5 text-xs font-medium text-aigua-700 ring-1 ring-aigua-100"
            >
              ✓ {a}
            </span>
          ))}
        </div>
      )}

      {c.notes && <p className="mt-2 text-slate-500">📝 {c.notes}</p>}
    </li>
  );
}
