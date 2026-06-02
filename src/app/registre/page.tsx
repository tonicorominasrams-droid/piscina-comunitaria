"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registraUsuari, type EstatRegistre } from "./actions";

const estatInicial: EstatRegistre = {};

export default function RegistrePage() {
  const [estat, accio, pendent] = useActionState(registraUsuari, estatInicial);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-aigua-100 to-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-aigua-100 text-3xl">
            🏊
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crea el teu compte</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registra&apos;t per accedir a la Piscina Comunitària
          </p>
        </div>

        {estat.ok ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 ring-1 ring-green-200">
            <p className="font-semibold">📧 Compte creat!</p>
            <p className="mt-1">
              T&apos;hem enviat un correu de confirmació. Obre&apos;l i fes clic a
              l&apos;enllaç per activar el compte i entrar.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-xs text-aigua-600 hover:text-aigua-700"
            >
              ← Torna a l&apos;inici de sessió
            </Link>
          </div>
        ) : (
          <form action={accio} className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nom complet
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                autoComplete="name"
                placeholder="Nom i cognoms"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Adreça de correu
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nom@exemple.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>

            <div>
              <label
                htmlFor="contrasenya"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Contrasenya
              </label>
              <input
                id="contrasenya"
                name="contrasenya"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>

            {estat.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {estat.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pendent}
              className="w-full rounded-lg bg-aigua-600 px-4 py-2.5 font-semibold text-white transition hover:bg-aigua-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendent ? "Creant el compte…" : "Registra'm"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Mínim 8 caràcters per a la contrasenya.
            </p>

            <Link
              href="/login"
              className="block w-full text-center text-xs text-aigua-600 hover:text-aigua-700"
            >
              Ja tens compte? Inicia sessió
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
