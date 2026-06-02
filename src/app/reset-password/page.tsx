"use client";

import { useActionState } from "react";
import { actualitzaContrasenya, type EstatReset } from "./actions";

const estatInicial: EstatReset = {};

export default function ResetPasswordPage() {
  const [estat, accio, pendent] = useActionState(
    actualitzaContrasenya,
    estatInicial,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-aigua-100 to-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-aigua-100 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nova contrasenya
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Escriu la contrasenya nova per al teu compte.
          </p>
        </div>

        <form action={accio} className="space-y-4">
          <div>
            <label
              htmlFor="contrasenya"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Contrasenya nova
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

          <div>
            <label
              htmlFor="confirmacio"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Repeteix la contrasenya
            </label>
            <input
              id="confirmacio"
              name="confirmacio"
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
            {pendent ? "Desant…" : "Desa la contrasenya nova"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Mínim 8 caràcters. Després t&apos;hi portarem directament.
          </p>
        </form>
      </div>
    </main>
  );
}
