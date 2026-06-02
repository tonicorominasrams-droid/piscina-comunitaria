import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ControlIaClient from "./ControlIaClient";

// Depèn de la sessió de l'usuari: mai s'ha de generar estàticament.
export const dynamic = "force-dynamic";

export default async function NouControlIaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏊</span>
            <span className="font-bold text-slate-900">Piscina Comunitària</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ← Tornar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Registre amb IA
            </h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-200">
              Beta
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Fes una foto de la tira reactiva i deixa que la IA llegeixi el pH i
            el clor i et recomani les dosis.
          </p>
        </div>

        <ControlIaClient />
      </main>
    </div>
  );
}
