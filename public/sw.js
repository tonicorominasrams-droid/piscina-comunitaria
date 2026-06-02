// Service worker de la Piscina Comunitària.
// Estratègia:
//  - Navegacions (HTML): network-first amb retorn a una pàgina offline.
//  - Estàtics de Next.js i icones: cache-first (stale-while-revalidate).
//  - No s'intercepten peticions a Supabase, /api ni /auth (sempre xarxa).

const CACHE = "piscina-v2";
const APP_SHELL = [
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/apple-touch-icon.png"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Només GET i mateix origen.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // No interceptem rutes dinàmiques sensibles (auth, api, dades RSC).
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  // Navegacions HTML: network-first amb retorn offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/offline.html")),
      ),
    );
    return;
  }

  // Estàtics: cache-first i actualitza en segon pla.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

// ---------------------------------------------------------------------------
// Notificacions push
// ---------------------------------------------------------------------------

self.addEventListener("push", (event) => {
  let dades = {};
  try {
    dades = event.data ? event.data.json() : {};
  } catch {
    dades = { title: "Piscina Comunitària", body: event.data && event.data.text() };
  }

  const title = dades.title || "Piscina Comunitària";
  const options = {
    body: dades.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: dades.url || "/dashboard" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const desti = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ja hi ha una finestra de l'app oberta, l'enfoquem.
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(desti).catch(() => {});
            return client.focus();
          }
        }
        return self.clients.openWindow(desti);
      }),
  );
});
