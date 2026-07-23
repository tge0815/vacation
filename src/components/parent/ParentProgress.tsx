"use client";

import { useEffect, useState } from "react";
import { Loader2, Flame, Check, X } from "lucide-react";
import { color } from "@/components/colors";
import type { PublicUser } from "@/lib/serialize";

type Stat = { subjectId: number; subjectName: string; minutes: number; attempts: number; correct: number; rate: number };
type Attempt = {
  id: number;
  date: string;
  subjectName: string;
  topicName: string | null;
  isCorrect: boolean;
  score: number | null;
  answer: string | null;
  exercise: { question?: string; instruction?: string } | null;
  grade: { feedback?: string; correction?: string } | null;
};

export function ParentProgress() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<
    { stats: Stat[]; recent: Attempt[]; streak: number; forUser: number } | null
  >(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: { users: PublicUser[] }) => {
        setUsers(d.users);
        if (d.users[0]) setUserId(d.users[0].id);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/attempts?userId=${userId}&days=14&limit=30`)
      .then((r) => r.json())
      .then((d: { stats: Stat[]; recent: Attempt[]; streak: number }) =>
        setData({ ...d, forUser: userId }),
      )
      .catch(() => {});
  }, [userId]);

  if (users.length === 0)
    return <p className="text-neutral-500 text-center py-8">Erst ein Kind anlegen.</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setUserId(u.id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              userId === u.id ? `${color(u.color).bg} text-white` : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <span>{u.emoji}</span> {u.name}
          </button>
        ))}
      </div>

      {!data || data.forUser !== userId ? (
        <div className="flex justify-center py-12 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Flame size={16} className="text-orange-500" /> Serie: {data.streak} Tage · letzte 14 Tage
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.stats.length === 0 && (
              <p className="text-neutral-500 col-span-full">Noch keine Übungen in diesem Zeitraum.</p>
            )}
            {data.stats.map((st) => (
              <div
                key={st.subjectId}
                className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4"
              >
                <div className="font-semibold">{st.subjectName}</div>
                <div className="mt-1 text-2xl font-bold nums">{st.rate}%</div>
                <div className="text-xs text-neutral-500 nums">
                  {st.attempts} Aufgaben · {st.minutes} min · {st.correct} richtig
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Letzte Aufgaben</h3>
            <div className="space-y-2">
              {data.recent.length === 0 && <p className="text-neutral-500 text-sm">Noch nichts.</p>}
              {data.recent.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 ${a.isCorrect ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {a.isCorrect ? <Check size={16} /> : <X size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-neutral-500">
                        {a.date} · {a.subjectName}
                        {a.topicName ? ` / ${a.topicName}` : ""}
                      </div>
                      <div className="text-sm font-medium">{a.exercise?.question ?? "—"}</div>
                      {a.answer && (
                        <div className="text-sm text-neutral-500">
                          Antwort: <span className="font-mono">{a.answer}</span>
                        </div>
                      )}
                      {a.grade?.feedback && (
                        <div className="text-xs text-neutral-400 mt-0.5">{a.grade.feedback}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
