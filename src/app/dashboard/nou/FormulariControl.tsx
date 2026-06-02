"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { afegeixControl, type EstatControl } from "./actions";
import { RANGS } from "@/lib/ranges";
import {
  ESTATS_DEPURADORA,
  type EstatDepuradora,
} from "@/lib/depuradora";

const estatInicial: EstatControl = {};

export default function FormulariControl() {
  const [estat, formAction, pendent] = useActionState(
    afegeixControl,
    estatInicial,
  );
  const [estatDepuradora, setEstatDepuradora] =
    useState<EstatDepuradora | null>(null);
  const [pastillesAfegides, setPastillesAfegides] = useState(false);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="measured_at"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Data i hora del control
        </label>
        <input
          id="measured_at"
          name="measured_at"
          type="datetime-local"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
        />
        <p className="mt-1 text-xs text-slate-400">
          Si ho deixes buit, es farà servir la data i hora actuals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="ph"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            pH{" "}
            <span className="font-normal text-slate-400">
              (rang {RANGS.ph.min}–{RANGS.ph.max})
            </span>
          </label>
          <input
            id="ph"
            name="ph"
            type="number"
            step="0.1"
            min="0"
            max="14"
            inputMode="decimal"
            placeholder="p. ex. 7,4"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
          />
        </div>

        <div>
          <label
            htmlFor="clor"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Clor lliure (mg/L){" "}
            <span className="font-normal text-slate-400">
              (rang {RANGS.clor.min}–{RANGS.clor.max})
            </span>
          </label>
          <input
            id="clor"
            name="clor"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            placeholder="p. ex. 1,2"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-3 rounded-lg bg-slate-50 px-3 py-3">
          <div className="flex items-center gap-2">
            <input
              id="pastilles_afegides"
              type="checkbox"
              checked={pastillesAfegides}
              onChange={(e) => setPastillesAfegides(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-aigua-600 focus:ring-aigua-500"
            />
            <label
              htmlFor="pastilles_afegides"
              className="text-sm text-slate-700"
            >
              S&apos;han afegit pastilles a l&apos;skimer
            </label>
          </div>

          {pastillesAfegides && (
            <div className="flex items-center justify-between gap-3 pl-7">
              <label
                htmlFor="pastilles_skimmer"
                className="text-sm text-slate-700"
              >
                Nombre de pastilles afegides a l&apos;skimer
              </label>
              <input
                id="pastilles_skimmer"
                name="pastilles_skimmer"
                type="number"
                min="1"
                max="20"
                step="1"
                inputMode="numeric"
                defaultValue={1}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3">
          <input
            id="ph_corregit"
            name="ph_corregit"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-aigua-600 focus:ring-aigua-500"
          />
          <label htmlFor="ph_corregit" className="text-sm text-slate-700">
            S&apos;ha corregit el pH
          </label>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3">
          <input
            id="clor_afegit"
            name="clor_afegit"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-aigua-600 focus:ring-aigua-500"
          />
          <label htmlFor="clor_afegit" className="text-sm text-slate-700">
            S&apos;ha afegit clor líquid o pols
          </label>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3">
          <input
            id="aigua_omplerta"
            name="aigua_omplerta"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-aigua-600 focus:ring-aigua-500"
          />
          <label htmlFor="aigua_omplerta" className="text-sm text-slate-700">
            S&apos;ha afegit aigua a la piscina
          </label>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3">
          <input
            id="aspiracio"
            name="aspiracio"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-aigua-600 focus:ring-aigua-500"
          />
          <label htmlFor="aspiracio" className="text-sm text-slate-700">
            S&apos;ha connectat el &quot;neteja fons&quot;
          </label>
        </div>
      </div>

      <details className="rounded-lg border border-slate-200 bg-slate-50/50">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-700">
          Estat de la depuradora (opcional)
        </summary>
        <div className="border-t border-slate-200 px-4 py-4">
          <input
            type="hidden"
            name="estat_depuradora"
            value={estatDepuradora ?? ""}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {ESTATS_DEPURADORA.map((opcio) => {
              const seleccionat = estatDepuradora === opcio.valor;
              return (
                <button
                  key={opcio.valor}
                  type="button"
                  onClick={() =>
                    setEstatDepuradora(seleccionat ? null : opcio.valor)
                  }
                  aria-pressed={seleccionat}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                    seleccionat
                      ? "border-aigua-500 bg-white ring-2 ring-aigua-200"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`h-6 w-6 flex-shrink-0 rounded-full border ${opcio.swatch}`}
                    aria-hidden
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {opcio.etiqueta}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {opcio.descripcio}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {estatDepuradora && (
            <button
              type="button"
              onClick={() => setEstatDepuradora(null)}
              className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Esborrar selecció
            </button>
          )}
        </div>
      </details>

      <div>
        <label
          htmlFor="notes"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Notes (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Observacions, productes afegits, incidències…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
        />
      </div>

      {estat.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {estat.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendent}
          className="rounded-lg bg-aigua-600 px-5 py-2.5 font-semibold text-white transition hover:bg-aigua-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendent ? "Desant…" : "Desar control"}
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel·lar
        </Link>
      </div>

      <p className="text-xs text-slate-400">
        Si el pH o el clor estan fora de rang, s&apos;enviarà automàticament un
        correu d&apos;alerta a tots els veïns i veïnes.
      </p>
    </form>
  );
}
