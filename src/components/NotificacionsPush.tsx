"use client";

import { useEffect, useState } from "react";

const CLAU_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();

/** Converteix una clau VAPID en base64url a Uint8Array (format que demana l'API). */
function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Estat = "carregant" | "no-suportat" | "activat" | "desactivat" | "denegat";

export default function NotificacionsPush() {
  const [estat, setEstat] = useState<Estat>("carregant");
  const [ocupat, setOcupat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !CLAU_PUBLICA ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setEstat("no-suportat");
      return;
    }

    if (Notification.permission === "denied") {
      setEstat("denegat");
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstat(sub ? "activat" : "desactivat"))
      .catch(() => setEstat("desactivat"));
  }, []);

  async function activa() {
    setOcupat(true);
    setError(null);
    try {
      const permis = await Notification.requestPermission();
      if (permis !== "granted") {
        setEstat(permis === "denied" ? "denegat" : "desactivat");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(CLAU_PUBLICA!),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("desar");

      setEstat("activat");
    } catch {
      setError("No s'han pogut activar les notificacions. Torna-ho a provar.");
      setEstat("desactivat");
    } finally {
      setOcupat(false);
    }
  }

  async function desactiva() {
    setOcupat(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEstat("desactivat");
    } catch {
      setError("No s'han pogut desactivar les notificacions.");
    } finally {
      setOcupat(false);
    }
  }

  // No mostrem res si el push no està configurat o no és compatible.
  if (estat === "carregant" || estat === "no-suportat") return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden>
          🔔
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Notificacions al mòbil
          </p>
          <p className="text-xs text-slate-500">
            {estat === "activat"
              ? "Reps avisos quan l'aigua surt de rang i recordatoris."
              : estat === "denegat"
                ? "Les has bloquejat al navegador. Activa-les des dels permisos del lloc."
                : "Activa-les per rebre avisos i recordatoris al mòbil."}
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>

      {estat === "activat" ? (
        <button
          type="button"
          onClick={desactiva}
          disabled={ocupat}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          {ocupat ? "…" : "Desactivar"}
        </button>
      ) : estat === "desactivat" ? (
        <button
          type="button"
          onClick={activa}
          disabled={ocupat}
          className="rounded-lg bg-aigua-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-aigua-700 disabled:opacity-50"
        >
          {ocupat ? "Activant…" : "Activar"}
        </button>
      ) : null}
    </div>
  );
}
