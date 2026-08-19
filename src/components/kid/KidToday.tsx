"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Loader2, Play, Check, LogOut, Gift, History, Gamepad2, Lock, Palette } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";
import { KidPath, type PathData } from "@/components/kid/KidPath";
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
  const [path, setPath] = useState<PathData | null>(null);
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
    fetch(`/api/path?userId=${userId}`)
      .then((r) => r.json())
      .then(setPath)
      .catch(() => {});
    // Vorrat für alle Fächer im Hintergrund vorwärmen → schnellerer Start.
    fetch("/api/exercise/warm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }, [userId]);

  // Der adaptive Pfad bestimmt jetzt Tages-Fortschritt & Freischaltung:
  // nur die heute ausgewählten Etappen zählen, nicht mehr alle Fächer.
  const stepsTotal = path?.requiredTotal ?? 0;
  const stepsDone = path?.requiredDone ?? 0;
  const allDone = path?.allRequiredDone ?? false;
  // Spiele-Werkstatt ist sichtbar, aber erst nutzbar, wenn der heutige
  // Weg geschafft ist (oder es gar kein Pflichtprogramm gibt).
  const werkstattUnlocked = allDone;

  return (
    <main className="relative mx-auto w-full max-w-3xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between gap-1.5 mb-7">
        {role === "child" ? (
          <button onClick={logout} className="pill pill-sm">
            <LogOut size={15} /> <span className="hidden sm:inline">Abmelden</span>
          </button>
        ) : (
          <button onClick={() => router.push("/")} className="pill pill-sm">
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Profil wechseln</span>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          {prog && prog.streak > 0 && (
            <span className="pill pill-sm pill-sun">
              <Flame size={15} /> {prog.streak}
            </span>
          )}
          {user && (
            <>
              <button onClick={() => router.push(`/kind/${userId}/verlauf`)} className="pill pill-sm" title="Deine gelösten Aufgaben">
                <History size={15} /> <span className="hidden sm:inline">Verlauf</span>
              </button>
              <button onClick={() => router.push(`/kind/${userId}/belohnung`)} className="pill pill-sm pill-mint" title="Coins gegen Bildschirmzeit eintauschen">
                <Gift size={15} /> <span className="hidden sm:inline">Zeit</span>
              </button>
              <button onClick={() => router.push(`/kind/${userId}/spiele`)} className="pill pill-sm pill-peach" title="Coins & Spiele">
                🪙 {user.coins}
              </button>
            </>
          )}
        </div>
      </header>

      {user && (
        <div className="flex items-center gap-4 mb-6">
          <span
            className={`size-16 rounded-full ${color(user.color).soft} flex items-center justify-center text-3xl border-[2.5px]`}
            style={{ borderColor: "var(--dl-outline)", boxShadow: "3px 3px 0 var(--dl-shadow)" }}
          >
            {user.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">Hallo {user.name}!</h1>
            <p className="dl-muted text-sm font-semibold">
              {allDone ? "Tagesziel geschafft — stark! 🎉" : "Bereit für ein bisschen Üben?"}
            </p>
          </div>
        </div>
      )}

      {/* Tages-Fortschritt: nur die heute gewählten Etappen */}
      {stepsTotal > 0 && (
        <div className="sticker p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-extrabold">Dein Weg heute</span>
            <span className="dl-muted nums font-bold">
              {stepsDone} / {stepsTotal} Etappen
            </span>
          </div>
          <div
            className="h-4 rounded-full overflow-hidden border-[2.5px]"
            style={{ borderColor: "var(--dl-outline)", background: "var(--dl-paper)" }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, stepsTotal ? (stepsDone / stepsTotal) * 100 : 0)}%`,
                background: allDone ? "#34c77b" : "#f97316",
              }}
            />
          </div>
        </div>
      )}

      {/* Adaptiver Tagespfad aus den Lern-Auswertungen */}
      {path && <KidPath data={path} />}

      {/* Spiele-Werkstatt: die Kür – erst nach den Tageszielen freigeschaltet */}
      {werkstattUnlocked ? (
        <button
          onClick={() => router.push(`/kind/${userId}/werkstatt`)}
          className="sticker sticker-sun w-full mb-6 flex items-center gap-4 p-4 text-left hover:-translate-y-0.5 transition"
          style={{ background: "var(--dl-lilac)", color: "#26242b" }}
        >
          <span
            className="shrink-0 size-12 rounded-2xl flex items-center justify-center border-[2.5px] bg-white"
            style={{ borderColor: "#26242b" }}
          >
            <Gamepad2 size={26} style={{ color: "#26242b" }} />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">Spiele-Werkstatt</span>
            <span className="block text-sm font-semibold opacity-80">Programmiere den Fuchs & baue ein Spiel</span>
          </span>
          <span className="text-2xl">🦊</span>
        </button>
      ) : (
        <div className="sticker w-full mb-6 flex items-center gap-4 p-4 opacity-90" title="Erst den heutigen Weg schaffen">
          <span
            className="shrink-0 size-12 rounded-2xl flex items-center justify-center border-[2.5px] dl-muted"
            style={{ borderColor: "var(--dl-outline)" }}
          >
            <Lock size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">Spiele-Werkstatt</span>
            <span className="block text-sm dl-muted font-semibold">
              Erst deinen Weg heute schaffen ({stepsDone}/{stepsTotal} Etappen) – dann freigeschaltet 🔓
            </span>
          </span>
          <span className="text-2xl grayscale opacity-60">🦊</span>
        </div>
      )}

      {/* Zeichen-Werkstatt (Manga): ebenfalls die Kür nach dem Lernweg */}
      {werkstattUnlocked ? (
        <button
          onClick={() => router.push(`/kind/${userId}/zeichnen`)}
          className="sticker w-full mb-6 flex items-center gap-4 p-4 text-left hover:-translate-y-0.5 transition"
          style={{ background: "var(--dl-pink)", color: "#26242b" }}
        >
          <span
            className="shrink-0 size-12 rounded-2xl flex items-center justify-center border-[2.5px] bg-white"
            style={{ borderColor: "#26242b" }}
          >
            <Palette size={26} style={{ color: "#26242b" }} />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">Zeichen-Werkstatt</span>
            <span className="block text-sm font-semibold opacity-80">Manga zeichnen lernen – Schritt für Schritt</span>
          </span>
          <span className="text-2xl">🎨</span>
        </button>
      ) : (
        <div className="sticker w-full mb-6 flex items-center gap-4 p-4 opacity-90" title="Erst den heutigen Weg schaffen">
          <span
            className="shrink-0 size-12 rounded-2xl flex items-center justify-center border-[2.5px] dl-muted"
            style={{ borderColor: "var(--dl-outline)" }}
          >
            <Lock size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">Zeichen-Werkstatt</span>
            <span className="block text-sm dl-muted font-semibold">
              Erst deinen Weg heute schaffen ({stepsDone}/{stepsTotal} Etappen) – dann freigeschaltet 🔓
            </span>
          </span>
          <span className="text-2xl grayscale opacity-60">🎨</span>
        </div>
      )}

      <h2 className="text-lg font-extrabold mb-1">
        Alle Fächer <span className="dl-muted text-sm font-semibold">· frei üben</span>
      </h2>
      <p className="dl-muted text-sm font-semibold mb-3">
        Lust auf mehr? Du darfst jederzeit freiwillig weiterüben – jedes Fach ist offen. 💪
      </p>
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
              <div key={s.subjectId} className="sticker flex flex-col items-center gap-3 p-5">
                <ProgressRing progress={ratio} colorClass={done ? "text-emerald-500" : c.ring}>
                  <Icon className={done ? "text-emerald-500" : c.text} size={22} />
                  <span className="text-xs dl-muted mt-1 nums">
                    {hasGoal ? `${s.doneValue}/${s.goalTarget}${unit}` : "frei"}
                  </span>
                </ProgressRing>
                <div className="text-center">
                  <div className="font-extrabold">{s.name}</div>
                  <div className="text-xs dl-muted font-semibold">
                    {!hasGoal
                      ? "ohne Tagesziel"
                      : s.goalType === "count"
                        ? "Aufgaben-Ziel"
                        : `${s.attempts} Aufgaben heute`}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/kind/${userId}/uebung?subjectId=${s.subjectId}`)}
                  className={`pill w-full py-2.5 ${done ? "pill-mint" : "pill-peach"}`}
                >
                  {done ? <Check size={18} /> : <Play size={18} />}
                  {done ? "Weiter üben" : "Loslegen"}
                </button>
                {s.key === "geografie" && (
                  <button
                    onClick={() => router.push(`/kind/${userId}/landkarte`)}
                    className="pill pill-sky w-full py-2 text-sm"
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
