"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";

type ExerciseLike = {
  question?: string;
  instruction?: string;
  solution?: string;
  solutionExplanation?: string;
};
type GradeLike = { correction?: string; feedback?: string };

type Attempt = {
  id: number;
  date: string;
  subjectName: string;
  subjectKey: string;
  color: string;
  icon: string;
  topicName: string | null;
  isCorrect: boolean;
  answer: string | null;
  exercise: ExerciseLike | null;
  grade: GradeLike | null;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayLabel(date: string): string {
  const today = ymd(new Date());
  const yesterday = ymd(new Date(Date.now() - 86_400_000));
  if (date === today) return "Heute";
  if (date === yesterday) return "Gestern";
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

export function KidHistory({ userId }: { userId: number }) {
  const router = useRouter();
  const [items, setItems] = useState<Attempt[] | null>(null);

  useEffect(() => {
    fetch(`/api/attempts?userId=${userId}&days=60&limit=80`)
      .then((r) => r.json())
      .then((d: { recent?: Attempt[] }) => setItems(d.recent ?? []))
      .catch(() => setItems([]));
  }, [userId]);

  // Nach Tag gruppieren (recent kommt bereits neueste zuerst).
  const groups: { label: string; items: Attempt[] }[] = [];
  for (const a of items ?? []) {
    const label = dayLabel(a.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/kind/${userId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> Zurück
        </button>
        <h1 className="text-lg font-semibold">Dein Verlauf</h1>
      </header>

      {items === null ? (
        <div className="flex justify-center py-16 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-neutral-500 py-12">
          Noch keine Aufgaben gelöst. Leg los und übe ein bisschen! 🚀
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                {g.label}
              </h2>
              <div className="space-y-2">
                {g.items.map((a) => {
                  const c = color(a.color);
                  const Icon = subjectIcon(a.icon);
                  const question = a.exercise?.question || a.exercise?.instruction || "Aufgabe";
                  return (
                    <div
                      key={a.id}
                      className="flex gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-3.5"
                    >
                      <span className={`shrink-0 size-10 rounded-full ${c.soft} flex items-center justify-center`}>
                        <Icon size={18} className={c.text} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
                          <span className="font-medium">{a.subjectName}</span>
                          {a.topicName && <span className="truncate">· {a.topicName}</span>}
                        </div>
                        <p className="text-sm font-medium leading-snug">{question}</p>
                        <div className="mt-1 text-sm">
                          <span className="text-neutral-500">Deine Antwort: </span>
                          <span className={a.isCorrect ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-700 dark:text-neutral-300"}>
                            {a.answer?.trim() || "—"}
                          </span>
                        </div>
                        {!a.isCorrect && (a.exercise?.solution || a.grade?.correction) && (
                          <div className="mt-1 text-sm text-neutral-500">
                            Richtig:{" "}
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {a.exercise?.solution || a.grade?.correction}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`shrink-0 self-start inline-flex items-center justify-center size-7 rounded-full ${
                          a.isCorrect ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {a.isCorrect ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
