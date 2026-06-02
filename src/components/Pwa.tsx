"use client";

import { useEffect, useState } from "react";

// Event no tipat per defecte al DOM lib.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

function esStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function esIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const esIPhoneIPad = /iphone|ipad|ipod/i.test(ua);
  // iPad amb iPadOS 13+ es presenta com a Mac amb pantalla tàctil.
  const esIPadOS =
    navigator.platform === "MacIntel" &&
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints! > 1;
  return esIPhoneIPad || esIPadOS;
}

export default function Pwa() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios">("android");

  // Registre del service worker.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("Error registrant el service worker:", err));
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  // Lògica del bàner d'instal·lació.
  useEffect(() => {
    if (esStandalone()) return; // ja està instal·lada
    if (localStorage.getItem(DISMISS_KEY)) return; // ja s'ha descartat

    const esMobil = window.matchMedia("(max-width: 768px)").matches;
    if (!esMobil) return;

    // Android / Chrome: esperem l'esdeveniment natiu.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setMode("android");
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari no emet l'esdeveniment: mostrem instruccions manuals.
    if (esIOS()) {
      setMode("ios");
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function descarta() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* localStorage pot fallar en mode privat */
    }
  }

  async function installa() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    descarta();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-aigua-200 bg-white p-3 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt=""
          aria-hidden
          className="h-12 w-12 flex-shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Instal·la la Piscina
          </p>
          {mode === "android" ? (
            <p className="text-xs text-slate-500">
              Afegeix l&apos;app a la pantalla d&apos;inici per accedir-hi més
              ràpid.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Toca{" "}
              <span aria-hidden className="font-semibold text-aigua-600">
                Compartir ⬆️
              </span>{" "}
              i després «Afegir a la pantalla d&apos;inici».
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col gap-1">
          {mode === "android" && (
            <button
              type="button"
              onClick={installa}
              className="rounded-lg bg-aigua-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-aigua-700"
            >
              Instal·lar
            </button>
          )}
          <button
            type="button"
            onClick={descarta}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Ara no
          </button>
        </div>
      </div>
    </div>
  );
}
