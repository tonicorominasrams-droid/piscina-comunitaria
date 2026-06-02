"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import FormulariControl from "@/app/dashboard/nou/FormulariControl";
import {
  calculaRecomanacions,
  VOLUM_PISCINA_M3,
} from "@/lib/dosatge";

type Fase = "captura" | "analitzant" | "revisio" | "resultat";

type Deteccio = {
  ph: number | null;
  clor: number | null;
  comentari?: string | null;
};

export default function ControlIaClient() {
  const [fase, setFase] = useState<Fase>("captura");
  const [error, setError] = useState<string | null>(null);
  const [previsualitzacio, setPrevisualitzacio] = useState<string | null>(null);
  const [deteccio, setDeteccio] = useState<Deteccio | null>(null);
  // Valors editables (text) a la fase de revisió.
  const [phText, setPhText] = useState("");
  const [clorText, setClorText] = useState("");
  // Valors confirmats per al càlcul i la pre-càrrega del formulari.
  const [phFinal, setPhFinal] = useState<number | null>(null);
  const [clorFinal, setClorFinal] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function aNumero(text: string): number | null {
    const t = text.trim().replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return Number.isNaN(n) ? null : n;
  }

  async function analitza(fitxer: File) {
    setError(null);
    setPrevisualitzacio(URL.createObjectURL(fitxer));
    setFase("analitzant");

    const formData = new FormData();
    formData.append("imatge", fitxer);

    try {
      const res = await fetch("/api/analitza-tira", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No s'ha pogut analitzar la imatge.");
        setFase("captura");
        return;
      }

      const det: Deteccio = {
        ph: data.ph ?? null,
        clor: data.clor ?? null,
        comentari: data.comentari ?? null,
      };
      setDeteccio(det);
      setPhText(det.ph !== null ? String(det.ph) : "");
      setClorText(det.clor !== null ? String(det.clor) : "");
      setFase("revisio");
    } catch {
      setError("Hi ha hagut un error de connexió. Torna-ho a provar.");
      setFase("captura");
    }
  }

  function onCanviFitxer(e: React.ChangeEvent<HTMLInputElement>) {
    const fitxer = e.target.files?.[0];
    if (fitxer) analitza(fitxer);
  }

  function confirma() {
    setPhFinal(aNumero(phText));
    setClorFinal(aNumero(clorText));
    setFase("resultat");
  }

  function reinicia() {
    setFase("captura");
    setError(null);
    setDeteccio(null);
    setPrevisualitzacio(null);
    setPhText("");
    setClorText("");
    setPhFinal(null);
    setClorFinal(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Fase 1: captura o pujada de la foto                              */}
      {/* ---------------------------------------------------------------- */}
      {fase === "captura" && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Fes una foto de la tira reactiva
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fes una foto clara i ben il·luminada de la tira reactiva acabada
              de submergir, amb els colors ben visibles.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCanviFitxer}
            className="hidden"
            id="imatge-tira"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-aigua-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-aigua-700"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 8a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            Fer o pujar una foto
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Fase 2: analitzant                                               */}
      {/* ---------------------------------------------------------------- */}
      {fase === "analitzant" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          {previsualitzacio && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previsualitzacio}
              alt="Tira reactiva"
              className="max-h-48 rounded-lg object-contain"
            />
          )}
          <div className="flex items-center gap-3 text-slate-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-aigua-200 border-t-aigua-600" />
            Analitzant la imatge amb IA…
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Fase 3: revisió i confirmació dels valors detectats              */}
      {/* ---------------------------------------------------------------- */}
      {fase === "revisio" && deteccio && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Revisa els valors detectats
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              L&apos;IA ha analitzat la tira. Comprova els valors i corregeix-los
              si cal abans de continuar.
            </p>
          </div>

          {previsualitzacio && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previsualitzacio}
              alt="Tira reactiva"
              className="max-h-40 rounded-lg object-contain"
            />
          )}

          {deteccio.comentari && (
            <p className="rounded-lg bg-aigua-50 px-3 py-2 text-sm text-aigua-800 ring-1 ring-aigua-100">
              💬 {deteccio.comentari}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ph-revisio"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                pH detectat
              </label>
              <input
                id="ph-revisio"
                type="number"
                step="0.1"
                min="0"
                max="14"
                inputMode="decimal"
                value={phText}
                onChange={(e) => setPhText(e.target.value)}
                placeholder="No detectat"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>
            <div>
              <label
                htmlFor="clor-revisio"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Clor lliure detectat (ppm)
              </label>
              <input
                id="clor-revisio"
                type="number"
                step="0.1"
                min="0"
                inputMode="decimal"
                value={clorText}
                onChange={(e) => setClorText(e.target.value)}
                placeholder="No detectat"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={confirma}
              className="rounded-lg bg-aigua-600 px-5 py-2.5 font-semibold text-white transition hover:bg-aigua-700"
            >
              Confirmar valors
            </button>
            <button
              type="button"
              onClick={reinicia}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Fer una altra foto
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Fase 4: recomanacions de dosatge + formulari pre-omplert         */}
      {/* ---------------------------------------------------------------- */}
      {fase === "resultat" && (
        <div className="space-y-6">
          <Recomanacions ph={phFinal} clor={clorFinal} />

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                4. Desa el control
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Hem pre-omplert el formulari amb els valors detectats. Revisa la
                resta de dades i desa el control.
              </p>
            </div>
            <FormulariControl phInicial={phFinal} clorInicial={clorFinal} />
          </div>

          <button
            type="button"
            onClick={reinicia}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ↺ Començar de nou amb una altra foto
          </button>
        </div>
      )}
    </div>
  );
}

/** Targeta amb les recomanacions de dosatge calculades per a 30 m³. */
function Recomanacions({
  ph,
  clor,
}: {
  ph: number | null;
  clor: number | null;
}) {
  const { ph: recPh, clor: recClor } = calculaRecomanacions(ph, clor);

  const colorPer = (accio: string) =>
    accio === "cap"
      ? "bg-green-50 text-green-800 ring-green-200"
      : accio === "esperar"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-aigua-50 text-aigua-800 ring-aigua-100";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          3. Recomanacions de dosatge
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Calculat per a un volum de piscina de {VOLUM_PISCINA_M3} m³. Afegeix
          els productes de mica en mica i torna a mesurar.
        </p>
      </div>

      <div className="space-y-3">
        <div
          className={`rounded-lg px-4 py-3 text-sm ring-1 ${colorPer(recPh.accio)}`}
        >
          <p className="font-semibold">pH</p>
          <p>{recPh.missatge}</p>
        </div>
        <div
          className={`rounded-lg px-4 py-3 text-sm ring-1 ${colorPer(recClor.accio)}`}
        >
          <p className="font-semibold">Clor lliure</p>
          <p>{recClor.missatge}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ⚠️ Valors orientatius generats per IA (beta). No substitueixen el criteri
        d&apos;un professional.
      </p>
    </div>
  );
}
