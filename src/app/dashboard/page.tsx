import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RANGS, phForaDeRang, clorForaDeRang } from "@/lib/ranges";
import { opcioDepuradora, type EstatDepuradora } from "@/lib/depuradora";
import {
  obteMeteoActual,
  descriuMeteo,
  recomanacioProperControl,
} from "@/lib/meteo";
import { calculaEstat } from "@/lib/estat";
import FabNouControl from "@/components/FabNouControl";
import SemaforEstat from "@/components/SemaforEstat";
import CalendariControls from "@/components/CalendariControls";
import NotificacionsPush from "@/components/NotificacionsPush";

type Control = {
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

const COLORS_RECOMANACIO = {
  bo: "bg-green-50 text-green-800 ring-green-200",
  avis: "bg-amber-50 text-amber-800 ring-amber-200",
  urgent: "bg-aigua-50 text-aigua-800 ring-aigua-100",
} as const;

function formataData(iso: string) {
  return new Intl.DateTimeFormat("ca-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Salutació amb el nom complet del perfil (i, si no n'hi ha, el correu).
  const nom = profile?.full_name || user?.email || "";

  const { data: controls } = await supabase
    .from("controls")
    .select(
      "id, measured_at, ph, clor, aspiracio, pastilles_skimmer, ph_corregit, clor_afegit, aigua_omplerta, estat_depuradora, temperatura, codi_meteo, notes, fora_de_rang",
    )
    .order("measured_at", { ascending: false })
    .limit(200);

  const llista = (controls ?? []) as Control[];

  // Meteorologia actual + recomanació intel·ligent per al proper control.
  const meteoActual = await obteMeteoActual();
  const ultimControl =
    llista.length > 0 ? new Date(llista[0].measured_at) : null;
  const recomanacio = recomanacioProperControl(ultimControl, meteoActual);

  // Estat global de la piscina (semàfor) a partir de l'últim control.
  const estat = calculaEstat(llista[0] ?? null);

  return (
    <div className="space-y-6">
      {searchParams.ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
          ✅ Control registrat correctament.
        </p>
      )}

      {nom && (
        <p className="text-base text-slate-600">
          Hola, <span className="font-semibold text-slate-900">{nom}</span> 👋
        </p>
      )}

      <SemaforEstat estat={estat} />

      <NotificacionsPush />

      <div
        className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${COLORS_RECOMANACIO[recomanacio.to]}`}
      >
        <span className="text-xl leading-none" aria-hidden>
          {meteoActual ? descriuMeteo(meteoActual.codi).icona : "💧"}
        </span>
        <div>
          <p className="font-semibold">Recomanació</p>
          <p>{recomanacio.missatge}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Històric de controls
          </h1>
          <p className="text-sm text-slate-500">
            Rangs recomanats: pH {RANGS.ph.min}–{RANGS.ph.max} · Clor lliure{" "}
            {RANGS.clor.min}–{RANGS.clor.max} {RANGS.clor.unitat}
          </p>
        </div>

        {user && (
          <Link
            href="/nou-control-ia"
            className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-aigua-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-aigua-700 sm:inline-flex"
          >
            <span aria-hidden>✨</span>
            Registre amb IA
            <span className="inline-flex items-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Beta
            </span>
          </Link>
        )}
      </div>

      <CalendariControls controls={llista} />

      {llista.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Encara no hi ha cap control registrat.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Temps</th>
                <th className="px-4 py-3">pH</th>
                <th className="px-4 py-3">Clor (mg/L)</th>
                <th className="px-4 py-3">Accions</th>
                <th className="px-4 py-3">Depuradora</th>
                <th className="px-4 py-3">Estat</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {llista.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formataData(c.measured_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {c.codi_meteo !== null || c.temperatura !== null ? (
                      (() => {
                        const desc = descriuMeteo(c.codi_meteo);
                        return (
                          <span
                            className="inline-flex items-center gap-1.5"
                            title={desc.etiqueta}
                          >
                            <span className="text-base" aria-hidden>
                              {desc.icona}
                            </span>
                            {c.temperatura !== null && (
                              <span>{Math.round(c.temperatura)} °C</span>
                            )}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      phForaDeRang(c.ph) ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    {c.ph ?? "—"}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      clorForaDeRang(c.clor) ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    {c.clor ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const accions = [
                        c.pastilles_skimmer > 0 &&
                          `${c.pastilles_skimmer} ${
                            c.pastilles_skimmer === 1 ? "pastilla" : "pastilles"
                          } a l'skimer`,
                        c.ph_corregit && "pH corregit",
                        c.clor_afegit && "Clor líquid o pols",
                        c.aigua_omplerta && "Aigua afegida",
                        c.aspiracio && "Neteja fons",
                      ].filter(Boolean) as string[];
                      return accions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {accions.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center rounded-full bg-aigua-50 px-2 py-0.5 text-xs font-medium text-aigua-700 ring-1 ring-aigua-100"
                            >
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const opcio = opcioDepuradora(c.estat_depuradora);
                      return opcio ? (
                        <span
                          className="inline-flex items-center gap-2"
                          title={opcio.descripcio}
                        >
                          <span
                            className={`h-4 w-4 flex-shrink-0 rounded-full border ${opcio.swatch}`}
                            aria-hidden
                          />
                          <span className="text-slate-700">
                            {opcio.etiqueta}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {c.fora_de_rang ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        Fora de rang
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Correcte
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-500">
                    {c.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FabNouControl />
    </div>
  );
}
