"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";
import type { PublicUser } from "@/lib/serialize";

type Topic = { id: number; name: string; description: string | null; active: number };
type Subject = { id: number; key: string; name: string; color: string; icon: string; topics: Topic[] };
type GoalType = "minutes" | "count";
type Goal = { subjectId: number; subjectName: string; goalType: GoalType; target: number; level: number };
type GoalState = { type: GoalType; target: number; level: number };

export function ParentGoals() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [goals, setGoals] = useState<Record<number, GoalState>>({});
  const [adaptive, setAdaptive] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSubjects = useCallback(async () => {
    // ?all=1: auch deaktivierte Themen zeigen, damit man sie wieder anschalten kann.
    const d = (await (await fetch("/api/subjects?all=1")).json()) as { subjects: Subject[] };
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
        const m: Record<number, GoalState> = {};
        d.goals.forEach((g) => (m[g.subjectId] = { type: g.goalType, target: g.target, level: g.level }));
        setGoals(m);
      });
  }, [userId]);

  // Adaptiv-Schalter des ausgewählten Kindes spiegeln.
  useEffect(() => {
    const u = users.find((x) => x.id === userId);
    if (u) setAdaptive(u.adaptiveVolume);
  }, [userId, users]);

  async function toggleAdaptive() {
    if (!userId) return;
    const next = !adaptive;
    setAdaptive(next);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, adaptiveVolume: next } : u)));
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adaptiveVolume: next }),
    }).catch(() => {});
  }

  function setGoalField(subjectId: number, patch: Partial<GoalState>) {
    setGoals((prev) => ({
      ...prev,
      [subjectId]: {
        type: prev[subjectId]?.type ?? "minutes",
        target: prev[subjectId]?.target ?? 0,
        level: prev[subjectId]?.level ?? 0,
        ...patch,
      },
    }));
  }

  async function saveGoals() {
    if (!userId) return;
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        goals: Object.entries(goals).map(([subjectId, g]) => ({
          subjectId: Number(subjectId),
          goalType: g.type,
          target: g.target,
          level: g.level,
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

      {/* Adaptives Volumen an/aus (pro Kind) */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold">Adaptives Volumen</h3>
          <p className="text-xs text-neutral-500">
            Das Tagesziel ist die Obergrenze. Sichere Fächer bekommen weniger Aufgaben, schwache das
            volle Pensum – nie mehr als eingestellt. Aus = überall genau das Tagesziel.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={adaptive}
          onClick={toggleAdaptive}
          title={adaptive ? "Adaptiv an" : "Adaptiv aus"}
          className={`relative shrink-0 h-7 w-12 rounded-full transition-colors ${
            adaptive ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${
              adaptive ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Tagesziel pro Fach: Minuten ODER Anzahl Aufgaben */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3">
        <div>
          <h3 className="font-semibold">Tagesziel pro Fach</h3>
          <p className="text-xs text-neutral-500">
            Pro Fach entweder Minuten pro Tag oder Anzahl Aufgaben pro Tag festlegen.
          </p>
        </div>
        {subjects.map((s) => {
          const Icon = subjectIcon(s.icon);
          const c = color(s.color);
          const g = goals[s.id] ?? { type: "minutes" as GoalType, target: 0, level: 0 };
          return (
            <div key={s.id} className="flex items-center gap-2 flex-wrap">
              <span className={`size-9 rounded-xl ${c.soft} flex items-center justify-center`}>
                <Icon size={18} className={c.text} />
              </span>
              <span className="flex-1 min-w-[70px] font-medium">{s.name}</span>
              <input
                type="number"
                min={0}
                max={120}
                value={g.target}
                onChange={(e) => setGoalField(s.id, { target: Number(e.target.value) })}
                className="w-16 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-2 py-1.5 text-right nums focus:border-sky-500 focus:outline-none"
              />
              {/* Umschalter Minuten / Aufgaben */}
              <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 text-xs font-medium">
                {(["minutes", "count"] as GoalType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGoalField(s.id, { type: t })}
                    className={`px-2 py-1 rounded-md transition ${
                      g.type === t ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-500"
                    }`}
                  >
                    {t === "minutes" ? "Min." : "Aufg."}
                  </button>
                ))}
              </div>
              {/* Schwierigkeit */}
              <select
                value={g.level}
                onChange={(e) => setGoalField(s.id, { level: Number(e.target.value) })}
                title="Schwierigkeit"
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-2 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value={0}>Auto</option>
                <option value={1}>Stufe 1 (leicht)</option>
                <option value={2}>Stufe 2</option>
                <option value={3}>Stufe 3</option>
                <option value={4}>Stufe 4</option>
                <option value={5}>Stufe 5 (schwer)</option>
              </select>
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
