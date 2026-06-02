"use client";

import { tancaSessio } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <form action={tancaSessio}>
      <button
        type="submit"
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        Tancar sessió
      </button>
    </form>
  );
}
