"use client";

import { useEffect } from "react";

// Registriert den Service Worker (nur im Browser, nur in sicherem Kontext:
// HTTPS oder localhost). Fehler werden bewusst verschluckt.
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
