import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-3xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Hi ha hagut un problema
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          L&apos;enllaç d&apos;accés no és vàlid o ha caducat. Torna a
          demanar-ne un de nou.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-aigua-600 px-5 py-2.5 font-semibold text-white transition hover:bg-aigua-700"
        >
          Tornar a l&apos;inici de sessió
        </Link>
      </div>
    </main>
  );
}
