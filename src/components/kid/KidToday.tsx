"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Loader2, Play, Check, LogOut, Gift, History, Gamepad2 } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";
import type { PublicUser } from "@/lib/serialize";

type SubjectProgress = {
  subjectId: number;
  key: string;
  name: string;
  color: string;
  icon: string;
  goalType: "minutes" | "count";
  goalTarget: number;
  secondsDone: number;
  attempts: number;
  correct: number;
  doneValue: number;
  reached: boolean;
};

type Progress = {
  subjects: SubjectProgress[];
  subjectsWithGoal: number;
  subjectsReached: number;
  streak: number;
};

export function KidToday({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [prog, setProg] = useState<Progress | null>(null);
  const [role, setRole] = useState<"parent" | "child" | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { role?: "parent" | "child" }) => setRole(d.role ?? null))
      .catch(() => {});
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d: { user: PublicUser }) => setUser(d.user))
      .catch(() => {});
    fetch(`/api/progress?userId=${userId}`)
      .then((r) => r.json())
      .then(setProg)
      .catch(() => {});
    // Vorrat für alle Fächer im Hintergrund vorwärmen → schnellerer Start.
    fetch("/api/exercise/warm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }, [userId]);

  const totalGoal = prog?.subjectsWithGoal ?? 0;
  const totalReached = prog?.subjectsReached ?? 0;
  const allDone = totalGoal > 0 && totalReached >= totalGoal;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-8">
        {role === "child" ? (
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <LogOut size={16} /> Abmelden
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <ArrowLeft size={16} /> Profil wechseln
          </button>
        )}
        <div className="flex items-center gap-3">
          {prog && prog.streak > 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500">
              <Flame size={18} /> {prog.streak}
            </span>
          )}
          {user && (
            <>
              <button
                onClick={() => router.push(`/kind/${userId}/verlauf`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-500/10 px-3 py-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-500/20 transition"
                title="Deine gelösten Aufgaben"
              >
                <History size={16} /> Verlauf
              </button>
              <button
                onClick={() => router.push(`/kind/${userId}/belohnung`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition"
                title="Coins gegen Bildschirmzeit eintauschen"
              >
                <Gift size={16} /> Zeit
              </button>
              <button
                onClick={() => router.push(`/kind/${userId}/spiele`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
                title="Coins & Spiele"
              >
                <span className="text-base leading-none">🪙</span>
                {user.coins}
              </button>
            </>
          )}
        </div>
      </header>

      {user && (
        <div className="flex items-center gap-4 mb-6">
          <span className={`size-16 rounded-full ${color(user.color).soft} flex items-center justify-center text-3xl`}>
            {user.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Hallo {user.name}!</h1>
            <p className="text-neutral-500 text-sm">
              {allDone ? "Tagesziel geschafft — stark!" : "Bereit für ein bisschen Üben?"}
            </p>
          </div>
        </div>
      )}

      {/* Tagesziel-Balken: Fächer geschafft (funktioniert für Minuten & Aufgaben) */}
      {totalGoal > 0 && (
        <div className="mb-8 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Tagesziel</span>
            <span className="text-neutral-500 nums">
              {totalReached} / {totalGoal} Fächer
            </span>
          </div>
          <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-sky-500"}`}
              style={{ width: `${Math.min(100, totalGoal ? (totalReached / totalGoal) * 100 : 0)}%` }}
            />
          </div>
        </div>
      )}

      {/* Spiele-Werkstatt: die Kür (Programmieren lernen) */}
      <button
        onClick={() => router.push(`/kind/${userId}/werkstatt`)}
        className="w-full mb-6 flex items-center gap-4 rounded-2xl p-4 text-left text-white bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-95 active:scale-[0.99] transition"
      >
        <span className="shrink-0 size-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Gamepad2 size={26} />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Spiele-Werkstatt</span>
          <span className="block text-sm text-white/80">Programmiere den Fuchs – Welt 1</span>
        </span>
        <span className="text-2xl">🦊</span>
      </button>

      {!prog ? (
        <div className="flex justify-center py-16 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {prog.subjects.map((s) => {
            const c = color(s.color);
            const Icon = subjectIcon(s.icon);
            const hasGoal = s.goalTarget > 0;
            const ratio = hasGoal ? s.doneValue / s.goalTarget : 0;
            const done = s.reached;
            const unit = s.goalType === "count" ? "" : "m";
            return (
              <div
                key={s.subjectId}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-5"
              >
                <ProgressRing progress={ratio} colorClass={done ? "text-emerald-500" : c.ring}>
                  <Icon className={done ? "text-emerald-500" : c.text} size={22} />
                  <span className="text-xs text-neutral-500 mt-1 nums">
                    {hasGoal ? `${s.doneValue}/${s.goalTarget}${unit}` : "frei"}
                  </span>
                </ProgressRing>
                <div className="text-center">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-neutral-500">
                    {!hasGoal
                      ? "ohne Tagesziel"
                      : s.goalType === "count"
                        ? "Aufgaben-Ziel"
                        : `${s.attempts} Aufgaben heute`}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/kind/${userId}/uebung?subjectId=${s.subjectId}`)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl ${done ? "bg-emerald-500" : c.bg} text-white font-semibold py-2.5 hover:opacity-90 active:scale-95 transition`}
                >
                  {done ? <Check size={18} /> : <Play size={18} />}
                  {done ? "Weiter üben" : "Loslegen"}
                </button>
                {s.key === "geografie" && (
                  <button
                    onClick={() => router.push(`/kind/${userId}/landkarte`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold py-2 text-sm hover:bg-cyan-500/20 transition"
                  >
                    🗺️ Landkarte
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
