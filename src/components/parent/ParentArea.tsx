"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Target, BarChart3, Bot, BookMarked, Gift, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/parent")
      .then((r) => r.json())
      .then((d: { pinSet: boolean }) => setLocked(d.pinSet))
      .catch(() => setLocked(false));
  }, []);

  // Anzahl offener Belohnungs-Anfragen (Badge am Tab). Aktualisiert beim
  // Tab-Wechsel UND regelmäßig, damit neue Anfragen von selbst auftauchen.
  useEffect(() => {
    if (locked) return;
    const refresh = () =>
      fetch("/api/rewards/requests?status=pending")
        .then((r) => r.json())
        .then((d: { requests?: PublicRewardRequest[] }) =>
          setPendingRewards(d.requests?.length ?? 0),
        )
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
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> Zur Profil-Auswahl
        </button>
        <h1 className="text-lg font-semibold">Eltern-Bereich</h1>
      </header>

      <nav className="flex gap-1 mb-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 overflow-x-auto">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
              tab === key
                ? "bg-white dark:bg-neutral-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
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
