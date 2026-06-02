"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANGS } from "@/lib/ranges";
import {
  ESTATS_DEPURADORA,
  opcioDepuradora,
  type EstatDepuradora,
} from "@/lib/depuradora";

export type ControlEstadistica = {
  measured_at: string;
  ph: number | null;
  clor: number | null;
  aspiracio: boolean;
  pastilles_skimmer: number;
  ph_corregit: boolean;
  clor_afegit: boolean;
  aigua_omplerta: boolean;
  estat_depuradora: EstatDepuradora | null;
  fora_de_rang: boolean;
};

// --- Colors dels gràfics ---
const COLOR_PH = "#1682f0"; // aigua-600
const COLOR_CLOR = "#0d9488"; // teal-600
const COLOR_BARRA = "#2ca2fb"; // aigua-500

// --- Utilitats de dates (en hora local) ---
function aClau(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function clauDe(iso: string): string {
  return aClau(new Date(iso));
}

function rangDarrersDies(dies: number) {
  const fins = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - (dies - 1));
  return { desde: aClau(desde), fins: aClau(fins) };
}

function rangAquestAny() {
  const ara = new Date();
  return { desde: aClau(new Date(ara.getFullYear(), 0, 1)), fins: aClau(ara) };
}

const fmtCurt = new Intl.DateTimeFormat("ca-ES", {
  day: "numeric",
  month: "short",
});
const fmtLlarg = new Intl.DateTimeFormat("ca-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

const FILTRES_RAPIDS = [
  { etiqueta: "7 dies", rang: () => rangDarrersDies(7) },
  { etiqueta: "30 dies", rang: () => rangDarrersDies(30) },
  { etiqueta: "90 dies", rang: () => rangDarrersDies(90) },
  { etiqueta: "Aquest any", rang: () => rangAquestAny() },
];

export default function EstadistiquesClient({
  dades,
}: {
  dades: ControlEstadistica[];
}) {
  const inicial = useMemo(() => rangDarrersDies(30), []);
  const [desde, setDesde] = useState(inicial.desde);
  const [fins, setFins] = useState(inicial.fins);

  const filtrades = useMemo(
    () =>
      dades.filter((c) => {
        const k = clauDe(c.measured_at);
        return k >= desde && k <= fins;
      }),
    [dades, desde, fins],
  );

  // Dades per al gràfic de línies (pH i clor en el temps).
  const dadesLinia = useMemo(
    () =>
      filtrades.map((c) => ({
        data: fmtCurt.format(new Date(c.measured_at)),
        ph: c.ph,
        clor: c.clor,
      })),
    [filtrades],
  );

  // Recompte d'accions per al gràfic de barres.
  const dadesBarres = useMemo(() => {
    const comptador = {
      pastilles: 0,
      clor: 0,
      ph: 0,
      aigua: 0,
      neteja: 0,
    };
    let totalPastilles = 0;
    for (const c of filtrades) {
      if (c.pastilles_skimmer > 0) comptador.pastilles += 1;
      if (c.clor_afegit) comptador.clor += 1;
      if (c.ph_corregit) comptador.ph += 1;
      if (c.aigua_omplerta) comptador.aigua += 1;
      if (c.aspiracio) comptador.neteja += 1;
      totalPastilles += c.pastilles_skimmer;
    }
    return {
      barres: [
        { nom: "Pastilles", vegades: comptador.pastilles },
        { nom: "Clor", vegades: comptador.clor },
        { nom: "pH", vegades: comptador.ph },
        { nom: "Aigua", vegades: comptador.aigua },
        { nom: "Neteja", vegades: comptador.neteja },
      ],
      totalPastilles,
    };
  }, [filtrades]);

  const mitjanaPastilles =
    filtrades.length > 0
      ? dadesBarres.totalPastilles / filtrades.length
      : 0;

  // Targetes resum.
  const resum = useMemo(() => {
    const ara = new Date();
    const mesActual = `${ara.getFullYear()}-${String(
      ara.getMonth() + 1,
    ).padStart(2, "0")}`;

    const controlsMes = dades.filter((c) =>
      clauDe(c.measured_at).startsWith(mesActual),
    ).length;

    const diesForaRang = new Set(
      filtrades.filter((c) => c.fora_de_rang).map((c) => clauDe(c.measured_at)),
    ).size;

    const ultim =
      dades.length > 0 ? dades[dades.length - 1].measured_at : null;

    return { controlsMes, diesForaRang, ultim };
  }, [dades, filtrades]);

  // Historial de l'estat de la depuradora.
  const depuradora = useMemo(
    () => filtrades.filter((c) => c.estat_depuradora !== null),
    [filtrades],
  );

  function aplicaRapid(rang: { desde: string; fins: string }) {
    setDesde(rang.desde);
    setFins(rang.fins);
  }

  return (
    <div className="space-y-6">
      {/* Filtres de dates */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label
            htmlFor="desde"
            className="mb-1 block text-xs font-medium text-slate-500"
          >
            Des de
          </label>
          <input
            id="desde"
            type="date"
            value={desde}
            max={fins}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
          />
        </div>
        <div>
          <label
            htmlFor="fins"
            className="mb-1 block text-xs font-medium text-slate-500"
          >
            Fins a
          </label>
          <input
            id="fins"
            type="date"
            value={fins}
            min={desde}
            onChange={(e) => setFins(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTRES_RAPIDS.map((f) => (
            <button
              key={f.etiqueta}
              type="button"
              onClick={() => aplicaRapid(f.rang())}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* Targetes resum */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Targeta titol="Controls aquest mes" valor={String(resum.controlsMes)} />
        <Targeta
          titol="Dies fora de rang"
          valor={String(resum.diesForaRang)}
          subtitol="dins el període seleccionat"
          accent={resum.diesForaRang > 0}
        />
        <Targeta
          titol="Mitjana de pastilles"
          valor={mitjanaPastilles.toFixed(1)}
          subtitol="per control (període)"
        />
        <Targeta
          titol="Últim control"
          valor={resum.ultim ? fmtLlarg.format(new Date(resum.ultim)) : "—"}
          petit
        />
      </div>

      {filtrades.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No hi ha controls en aquest període. Prova un altre rang de dates.
        </div>
      ) : (
        <>
          {/* Gràfic de línies: pH i clor */}
          <Bloc titol="Evolució del pH i el clor">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dadesLinia}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="data"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ph"
                  name={RANGS.ph.label}
                  stroke={COLOR_PH}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="clor"
                  name={`${RANGS.clor.label} (${RANGS.clor.unitat})`}
                  stroke={COLOR_CLOR}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Bloc>

          {/* Gràfic de barres: recompte d'accions */}
          <Bloc titol="Accions realitzades">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dadesBarres.barres}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="vegades"
                  name="Vegades"
                  fill={COLOR_BARRA}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Bloc>

          {/* Historial de la depuradora */}
          <Bloc titol="Historial de l'estat de la depuradora">
            {depuradora.length === 0 ? (
              <p className="text-sm text-slate-400">
                No hi ha registres de l&apos;estat de la depuradora en aquest
                període.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {depuradora.map((c, i) => {
                    const opcio = opcioDepuradora(c.estat_depuradora);
                    return (
                      <span
                        key={`${c.measured_at}-${i}`}
                        title={`${fmtLlarg.format(new Date(c.measured_at))} · ${
                          opcio?.etiqueta ?? ""
                        }`}
                        className={`h-4 w-4 rounded-full border ${
                          opcio?.swatch ?? "bg-slate-200 border-slate-300"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  {ESTATS_DEPURADORA.map((o) => (
                    <span
                      key={o.valor}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border ${o.swatch}`}
                      />
                      {o.etiqueta}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Bloc>
        </>
      )}
    </div>
  );
}

function Targeta({
  titol,
  valor,
  subtitol,
  accent,
  petit,
}: {
  titol: string;
  valor: string;
  subtitol?: string;
  accent?: boolean;
  petit?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {titol}
      </p>
      <p
        className={`mt-1 font-bold ${petit ? "text-base" : "text-2xl"} ${
          accent ? "text-red-600" : "text-slate-900"
        }`}
      >
        {valor}
      </p>
      {subtitol && <p className="mt-0.5 text-xs text-slate-400">{subtitol}</p>}
    </div>
  );
}

function Bloc({
  titol,
  children,
}: {
  titol: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">{titol}</h2>
      {children}
    </div>
  );
}
