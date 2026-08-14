"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Target,
  BarChart3,
  Bot,
  BookMarked,
  Gift,
  Bell,
  Loader2,
} from "lucide-react";
import { PinPad } from "@/components/PinPad";
import { ParentKids } from "./ParentKids";
import { ParentGoals } from "./ParentGoals";
import { ParentProgress } from "./ParentProgress";
import { ParentCoach } from "./ParentCoach";
import { ParentVocab } from "./ParentVocab";
import { ParentRewards } from "./ParentRewards";
import type { PublicRewardRequest } from "@/lib/serialize";

type Tab = "kinder" | "ziele" | "fortschritt" | "vokabeln" | "belohnungen" | "coach";

const TABS: { key: Tab; label: string; Icon: typeof Users }[] = [
  { key: "kinder", label: "Kinder", Icon: Users },
  { key: "ziele", label: "Ziele & Themen", Icon: Target },
  { key: "fortschritt", label: "Fortschritt", Icon: BarChart3 },
  { key: "vokabeln", label: "Vokabelheft", Icon: BookMarked },
  { key: "belohnungen", label: "Belohnungen", Icon: Gift },
  { key: "coach", label: "Lern-Coach", Icon: Bot },
];

export function ParentArea() {
  const router = useRouter();
  const [locked, setLocked] = useState<boolean | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("kinder");
  const [pendingRewards, setPendingRewards] = useState(0);
  const [notifyPerm, setNotifyPerm] = useState<string>("default");
  const prevPending = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/parent")
      .then((r) => r.json())
      .then((d: { pinSet: boolean }) => setLocked(d.pinSet))
      .catch(() => setLocked(false));
    if (typeof Notification !== "undefined") setNotifyPerm(Notification.permission);
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setNotifyPerm(p);
    } catch {}
  }

  async function notifyNewRequests(count: number) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const title = "Neue Bildschirmzeit-Anfrage";
    const body = count === 1 ? "Ein Kind möchte Bildschirmzeit." : `${count} offene Anfragen.`;
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: "reward-request",
        });
      } else {
        new Notification(title, { body });
      }
    } catch {}
  }

  // Anzahl offener Belohnungs-Anfragen (Badge am Tab). Aktualisiert beim
  // Tab-Wechsel UND regelmäßig; bei einer NEUEN Anfrage kommt eine
  // Benachrichtigung (sofern erlaubt und die PWA offen ist).
  useEffect(() => {
    if (locked) return;
    const refresh = () =>
      fetch("/api/rewards/requests?status=pending")
        .then((r) => r.json())
        .then((d: { requests?: PublicRewardRequest[] }) => {
          const n = d.requests?.length ?? 0;
          if (prevPending.current !== null && n > prevPending.current) {
            void notifyNewRequests(n);
          }
          prevPending.current = n;
          setPendingRewards(n);
        })
        .catch(() => {});
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [locked, tab]);

  async function verify(pin: string) {
    const res = await fetch("/api/parent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", pin }),
    });
    const d = (await res.json()) as { ok: boolean };
    if (d.ok) setLocked(false);
    else setPinError("PIN falsch.");
  }

  if (locked === null) {
    return (
      <main className="flex-1 flex items-center justify-center text-neutral-400">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (locked) {
    return (
      <PinPad
        title="Eltern-PIN"
        onSubmit={verify}
        onCancel={() => router.push("/")}
        error={pinError}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <button onClick={() => router.push("/")} className="pill py-2 text-sm">
          <ArrowLeft size={16} /> Zur Profil-Auswahl
        </button>
        <div className="flex items-center gap-3">
          {typeof Notification !== "undefined" && notifyPerm !== "granted" && (
            <button onClick={enableNotifications} title="Benachrichtigung bei neuen Anfragen" className="pill py-2 text-sm">
              <Bell size={16} /> Benachrichtigungen
            </button>
          )}
          <h1 className="text-lg font-extrabold">Eltern-Bereich</h1>
        </div>
      </header>

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pill py-2 text-sm whitespace-nowrap ${tab === key ? "pill-dark" : ""}`}
          >
            <Icon size={16} /> {label}
            {key === "belohnungen" && pendingRewards > 0 && (
              <span className="ml-0.5 rounded-full bg-rose-500 text-white text-[10px] leading-none px-1.5 py-0.5">
                {pendingRewards}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === "kinder" && <ParentKids />}
      {tab === "ziele" && <ParentGoals />}
      {tab === "fortschritt" && <ParentProgress />}
      {tab === "vokabeln" && <ParentVocab />}
      {tab === "belohnungen" && <ParentRewards />}
      {tab === "coach" && <ParentCoach />}
    </main>
  );
}
