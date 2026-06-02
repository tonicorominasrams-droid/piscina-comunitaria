"use client";

import { useActionState, useState } from "react";
import {
  enviaCorreuRecuperacio,
  enviaEnllacMagic,
  iniciaSessioAmbContrasenya,
  type EstatLogin,
} from "./actions";

const estatInicial: EstatLogin = {};

type Metode = "enllac" | "contrasenya";

export default function LoginPage() {
  const [metode, setMetode] = useState<Metode>("enllac");
  const [recuperant, setRecuperant] = useState(false);

  const [estatEnllac, accioEnllac, pendentEnllac] = useActionState(
    enviaEnllacMagic,
    estatInicial,
  );
  const [estatContrasenya, accioContrasenya, pendentContrasenya] =
    useActionState(iniciaSessioAmbContrasenya, estatInicial);
  const [estatRecuperacio, accioRecuperacio, pendentRecuperacio] =
    useActionState(enviaCorreuRecuperacio, estatInicial);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-aigua-100 to-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-aigua-100 text-3xl">
            🏊
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Piscina Comunitària
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Control de la qualitat de l&apos;aigua
          </p>
        </div>

        {estatEnllac.ok ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 ring-1 ring-green-200">
            <p className="font-semibold">📧 Correu enviat!</p>
            <p className="mt-1">
              T&apos;hem enviat un enllaç d&apos;accés. Obre el teu correu i fes
              clic a l&apos;enllaç per entrar.
            </p>
          </div>
        ) : estatRecuperacio.ok ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 ring-1 ring-green-200">
            <p className="font-semibold">📧 Correu enviat!</p>
            <p className="mt-1">
              T&apos;hem enviat un enllaç per restablir la contrasenya. Obre el
              teu correu i fes clic a l&apos;enllaç per triar-ne una de nova.
            </p>
          </div>
        ) : recuperant ? (
          <form action={accioRecuperacio} className="space-y-4">
            <div>
              <label
                htmlFor="email-recuperacio"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Adreça de correu
              </label>
              <input
                id="email-recuperacio"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nom@exemple.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
              />
            </div>

            {estatRecuperacio.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {estatRecuperacio.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pendentRecuperacio}
              className="w-full rounded-lg bg-aigua-600 px-4 py-2.5 font-semibold text-white transition hover:bg-aigua-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendentRecuperacio
                ? "Enviant…"
                : "Envia'm l'enllaç per restablir-la"}
            </button>

            <button
              type="button"
              onClick={() => setRecuperant(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              ← Torna a l&apos;inici de sessió
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMetode("enllac")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  metode === "enllac"
                    ? "bg-white text-aigua-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Enllaç màgic
              </button>
              <button
                type="button"
                onClick={() => setMetode("contrasenya")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  metode === "contrasenya"
                    ? "bg-white text-aigua-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Contrasenya
              </button>
            </div>

            {metode === "enllac" ? (
              <form action={accioEnllac} className="space-y-4">
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

                {estatEnllac.error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                    {estatEnllac.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pendentEnllac}
                  className="w-full rounded-lg bg-aigua-600 px-4 py-2.5 font-semibold text-white transition hover:bg-aigua-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendentEnllac ? "Enviant…" : "Envia'm l'enllaç d'accés"}
                </button>

                <p className="text-center text-xs text-slate-400">
                  T&apos;enviarem un enllaç màgic al correu. No cal contrasenya.
                </p>
              </form>
            ) : (
              <form action={accioContrasenya} className="space-y-4">
                <div>
                  <label
                    htmlFor="email-contrasenya"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Adreça de correu
                  </label>
                  <input
                    id="email-contrasenya"
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
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-aigua-500 focus:ring-2 focus:ring-aigua-200"
                  />
                </div>

                {estatContrasenya.error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                    {estatContrasenya.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pendentContrasenya}
                  className="w-full rounded-lg bg-aigua-600 px-4 py-2.5 font-semibold text-white transition hover:bg-aigua-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendentContrasenya ? "Entrant…" : "Entra"}
                </button>

                <button
                  type="button"
                  onClick={() => setRecuperant(true)}
                  className="block w-full text-center text-xs text-aigua-600 hover:text-aigua-700"
                >
                  Has oblidat la contrasenya?
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
