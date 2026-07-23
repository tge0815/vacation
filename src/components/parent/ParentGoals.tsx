"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";
import type { PublicUser } from "@/lib/serialize";

type Topic = { id: number; name: string; description: string | null; active: number };
type Subject = { id: number; key: string; name: string; color: string; icon: string; topics: Topic[] };
type Goal = { subjectId: number; subjectName: string; dailyMinutes: number };

export function ParentGoals() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSubjects = useCallback(async () => {
    const d = (await (await fetch("/api/subjects")).json()) as { subjects: Subject[] };
    setSubjects(d.subjects);
  }, []);

  useEffect(() => {
    (async () => {
      const u = (await (await fetch("/api/users")).json()) as { users: PublicUser[] };
      setUsers(u.users);
      if (u.users[0]) setUserId(u.users[0].id);
      await loadSubjects();
      setLoading(false);
    })();
  }, [loadSubjects]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/goals?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { goals: Goal[] }) => {
        const m: Record<number, number> = {};
        d.goals.forEach((g) => (m[g.subjectId] = g.dailyMinutes));
        setMinutes(m);
      });
  }, [userId]);

  async function saveGoals() {
    if (!userId) return;
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        goals: Object.entries(minutes).map(([subjectId, dailyMinutes]) => ({
          subjectId: Number(subjectId),
          dailyMinutes,
        })),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function toggleTopic(topicId: number, active: boolean) {
    await fetch(`/api/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    await loadSubjects();
  }

  if (loading)
    return (
      <div className="flex justify-center py-12 text-neutral-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (users.length === 0)
    return <p className="text-neutral-500 text-center py-8">Erst ein Kind anlegen.</p>;

  const total = Object.values(minutes).reduce((s, m) => s + (m || 0), 0);

  return (
    <div className="space-y-6">
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

      {/* Minuten pro Fach */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Tägliche Minuten pro Fach</h3>
          <span className="text-sm text-neutral-500 nums">Ziel gesamt: {total} min</span>
        </div>
        {subjects.map((s) => {
          const Icon = subjectIcon(s.icon);
          const c = color(s.color);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className={`size-9 rounded-xl ${c.soft} flex items-center justify-center`}>
                <Icon size={18} className={c.text} />
              </span>
              <span className="flex-1 font-medium">{s.name}</span>
              <input
                type="number"
                min={0}
                max={120}
                value={minutes[s.id] ?? 0}
                onChange={(e) => setMinutes({ ...minutes, [s.id]: Number(e.target.value) })}
                className="w-20 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-1.5 text-right nums focus:border-sky-500 focus:outline-none"
              />
              <span className="text-sm text-neutral-500 w-8">min</span>
            </div>
          );
        })}
        <button
          onClick={saveGoals}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 text-white py-2.5 font-semibold hover:opacity-90"
        >
          <Check size={18} /> {saved ? "Gespeichert!" : "Ziele speichern"}
        </button>
      </div>

      {/* Themen an/aus (global) */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-4">
        <div>
          <h3 className="font-semibold">Themen</h3>
          <p className="text-xs text-neutral-500">Gilt für alle Kinder. Ausgeschaltete Themen kommen nicht dran.</p>
        </div>
        {subjects.map((s) => (
          <div key={s.id}>
            <div className="text-sm font-medium text-neutral-500 mb-1.5">{s.name}</div>
            <div className="flex flex-wrap gap-2">
              {s.topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id, !t.active)}
                  title={t.description ?? ""}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
                    t.active
                      ? `${color(s.color).soft} ${color(s.color).text} ${color(s.color).border}`
                      : "text-neutral-400 border-neutral-200 dark:border-neutral-800 line-through"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
