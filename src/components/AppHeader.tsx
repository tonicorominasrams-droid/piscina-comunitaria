"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Seccio = "historic" | "estadistiques";

type Props = {
  nomUsuari: string;
  esAdmin: boolean;
  /** Secció activa, per ressaltar l'enllaç de navegació corresponent. */
  actiu?: Seccio;
};

const enllacBase =
  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition";

function classesEnllac(actiu: boolean) {
  return actiu
    ? `${enllacBase} bg-aigua-50 text-aigua-700`
    : `${enllacBase} text-slate-600 hover:bg-slate-100`;
}

export default function AppHeader({ nomUsuari, esAdmin, actiu }: Props) {
  const [obert, setObert] = useState(false);

  const enllacosNav = (
    <>
      <Link
        href="/dashboard"
        onClick={() => setObert(false)}
        className={classesEnllac(actiu === "historic")}
      >
        Històric
      </Link>
      <Link
        href="/estadistiques"
        onClick={() => setObert(false)}
        className={classesEnllac(actiu === "estadistiques")}
      >
        Estadístiques
      </Link>
    </>
  );

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏊</span>
            <span className="font-bold text-slate-900">
              Piscina Comunitària
            </span>
          </Link>
          {/* Navegació horitzontal (tauleta i escriptori) */}
          <nav className="hidden items-center gap-1 sm:flex">{enllacosNav}</nav>
        </div>

        {/* Accions (tauleta i escriptori) */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/dashboard/nou"
            className="flex items-center rounded-lg bg-aigua-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-aigua-700"
          >
            + Nou control
          </Link>
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-700">{nomUsuari}</p>
            <p className="text-xs text-slate-400">
              {esAdmin ? "Administrador/a" : "Veí/Veïna"}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Botó hamburguesa (només mòbil) */}
        <button
          type="button"
          onClick={() => setObert((v) => !v)}
          aria-expanded={obert}
          aria-controls="menu-mobil"
          aria-label={obert ? "Tanca el menú" : "Obre el menú"}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 sm:hidden"
        >
          {obert ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Panell desplegable (només mòbil) */}
      {obert && (
        <div
          id="menu-mobil"
          className="border-t border-slate-200 px-4 py-3 sm:hidden"
        >
          <nav className="flex flex-col gap-1">{enllacosNav}</nav>
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{nomUsuari}</p>
              <p className="text-xs text-slate-400">
                {esAdmin ? "Administrador/a" : "Veí/Veïna"}
              </p>
            </div>
            <Link
              href="/dashboard/nou"
              onClick={() => setObert(false)}
              className="flex items-center justify-center rounded-lg bg-aigua-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-aigua-700"
            >
              + Nou control
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}
