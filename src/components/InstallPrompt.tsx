"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, Plus } from "lucide-react";

// Kleiner, wegklickbarer Installationshelfer.
// - Android/Chrome: fängt "beforeinstallprompt" ab und zeigt einen Button.
// - iOS/Safari: zeigt einen Hinweis (Apple bietet KEINEN Auto-Dialog an –
//   Installation nur über Teilen → "Zum Home-Bildschirm").
// - Bereits installiert (standalone) oder weggeklickt → nichts anzeigen.

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };

const DISMISS_KEY = "lc_install_dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setDismissed(false);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // iOS: kein beforeinstallprompt → eigenen Hinweis zeigen.
    if (isIos()) setShowIos(true);

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function close() {
    setDismissed(true);
    setDeferred(null);
    setShowIos(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    close();
  }

  if (dismissed) return null;
  if (!deferred && !showIos) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 shadow-xl p-3.5 flex items-start gap-3">
        <span className="mt-0.5 shrink-0 size-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
          <Download size={18} />
        </span>
        <div className="flex-1 min-w-0 text-sm">
          <div className="font-semibold">Lerncoach als App</div>
          {deferred ? (
            <p className="text-neutral-500 mt-0.5">Direkt auf den Startbildschirm – ein Tipp genügt.</p>
          ) : (
            <p className="text-neutral-500 mt-0.5">
              Tippe unten auf <Share size={13} className="inline align-[-2px]" /> <b>Teilen</b> und
              dann <Plus size={13} className="inline align-[-2px]" /> <b>„Zum Home-Bildschirm"</b>.
            </p>
          )}
          {deferred && (
            <button
              onClick={install}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-sky-500 text-white px-3.5 py-1.5 font-semibold hover:opacity-90"
            >
              <Download size={15} /> Installieren
            </button>
          )}
        </div>
        <button
          onClick={close}
          aria-label="Schließen"
          className="shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
