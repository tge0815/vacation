// Minimaler Service Worker für den Lerncoach (PWA-Installierbarkeit +
// Offline-Fallback für zuletzt besuchte Seiten/Assets).
// Bewusst konservativ: API-Aufrufe (auch SSE) werden NIE abgefangen/gecacht.
const CACHE = "lerncoach-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Klick auf eine Benachrichtigung → Eltern-Bereich öffnen/fokussieren.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = all.find((c) => c.url.includes("/eltern")) || all[0];
      if (existing) {
        await existing.focus();
        if (!existing.url.includes("/eltern")) existing.navigate?.("/eltern");
      } else {
        await self.clients.openWindow("/eltern");
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Nur eigene Origin bedienen; API/SSE komplett dem Netzwerk überlassen.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Network-first: online immer frisch, offline aus dem Cache.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Für Seiten-Navigationen wenigstens die Startseite anbieten.
        if (req.mode === "navigate") {
          const home = await caches.match("/");
          if (home) return home;
        }
        return Response.error();
      }),
  );
});
