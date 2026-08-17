import { NextRequest, NextResponse } from "next/server";
import {
  listSubjects,
  getGoal,
  progressToday,
  statsSince,
  listTopicsForFamily,
  recentTopicPerformance,
  currentStreak,
  lastPracticedBySubject,
  getDailyPlan,
  setDailyPlan,
  getAdaptiveVolume,
  type DailyPlanItem,
} from "@/lib/db/repo";
import { localDateStr } from "@/lib/date";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_RECURRENCE = 3; // jedes aktive Fach spätestens alle 3 Tage
const MIN_STOPS = 3;
const MAX_STOPS = 5;
const MIN_TASKS = 3; // kleinstes Tagespensum pro Fach
const MAX_TASKS = 15; // größtes Tagespensum pro Fach

// Adaptives Pensum: das Eltern-Tagesziel ist die Basis; schwache Gebiete
// bekommen mehr, starke (Wiederholung) deutlich weniger Aufgaben.
function adaptiveTarget(base: number, acc: number | null, hasWeakTopic: boolean): number {
  let factor: number;
  if (hasWeakTopic || (acc !== null && acc < 0.7)) factor = 1.3; // schwach → mehr
  else if (acc === null) factor = 1; // zu wenig Daten → normal
  else if (acc >= 0.85) factor = 0.5; // sehr sicher → halbe Wiederholung
  else if (acc >= 0.7) factor = 0.8; // solide → etwas weniger
  else factor = 1;
  const scaled = Math.round(base * factor);
  return Math.max(MIN_TASKS, Math.min(MAX_TASKS, scaled));
}

type Stage = {
  id: string;
  kind: "exercise" | "game" | "map";
  subjectName: string;
  icon: string;
  color: string;
  label: string;
  chip: string;
  reason: "weak" | "due" | "goal" | "variety";
  required: boolean;
  done: boolean;
  href: string;
};

function dayGap(from: string, to: string): number {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const familyId = gate;
  const today = localDateStr();

  const since = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return localDateStr(d);
  })();

  const subjects = listSubjects();
  const byId = new Map(subjects.map((s) => [s.id, s]));
  const prog = new Map(progressToday(userId).map((p) => [p.subjectId, p]));
  const stats = new Map(statsSince(userId, since).map((s) => [s.subjectId, s]));
  const lastPract = lastPracticedBySubject(userId);
  const adaptiveOn = getAdaptiveVolume(userId);

  // Kennzahlen pro Fach (nur Eltern-aktive Fächer = Tagesziel > 0).
  type Meta = {
    subjectId: number;
    goalType: "minutes" | "count";
    doneValue: number;
    target: number; // frisch berechnetes adaptives Pensum (Basis für neuen Plan)
    acc: number | null; // Trefferquote 14 Tage
    gapDays: number; // Tage seit letzter Übung (Infinity = nie)
    due: boolean;
    mustInclude: boolean;
    priority: number;
    weakTopicId: number | null;
    weakTopicName: string | null;
  };
  const metas = new Map<number, Meta>();
  const pool: number[] = [];
  for (const s of subjects) {
    const goal = getGoal(userId, s.id);
    if (goal.target <= 0) continue;
    pool.push(s.id);
    const p = prog.get(s.id);
    const doneValue = goal.type === "count" ? p?.attempts ?? 0 : Math.floor((p?.secondsDone ?? 0) / 60);
    const st = stats.get(s.id);
    const acc = st && st.attempts >= 5 ? st.correct / st.attempts : null;
    const last = lastPract.get(s.id);
    const gapDays = last ? dayGap(last, today) : Number.POSITIVE_INFINITY;
    const interval = acc === null ? 0 : acc >= 0.85 ? 3 : acc >= 0.7 ? 2 : 1;
    const due = gapDays >= interval;
    const mustInclude = gapDays >= MIN_RECURRENCE; // deckt "nie geübt" (Infinity) mit ab
    const weakness = acc === null ? 0.8 : 1 - acc;
    const priority = (mustInclude ? 100 : 0) + weakness * 10 + Math.min(gapDays, 10);

    // Schwächstes aktives Thema als Fokus.
    let weakTopicId: number | null = null;
    let weakTopicName: string | null = null;
    let weakRate = 1;
    for (const t of listTopicsForFamily(s.id, familyId, false)) {
      const tp = recentTopicPerformance(userId, t.id);
      if (tp.attempts >= 3) {
        const rate = tp.correct / tp.attempts;
        if (rate < 0.7 && rate < weakRate) {
          weakRate = rate;
          weakTopicId = t.id;
          weakTopicName = t.name;
        }
      }
    }

    metas.set(s.id, {
      subjectId: s.id,
      goalType: goal.type,
      doneValue,
      // Adaptiv aus → schlicht das Eltern-Tagesziel, kein Skalieren.
      target: adaptiveOn ? adaptiveTarget(goal.target, acc, weakTopicId !== null) : goal.target,
      acc,
      gapDays,
      due,
      mustInclude,
      priority,
      weakTopicId,
      weakTopicName,
    });
  }

  // Tagesplan: schon vorhanden? -> beibehalten (kein Umsortieren, kein
  // Umskalieren des Pensums im Tagesverlauf).
  let planItems = getDailyPlan(userId, today);
  if (!planItems) {
    // Auswahl nur aus noch nicht heute erledigten Fächern (Pensum noch offen).
    const candidates = pool
      .map((id) => metas.get(id)!)
      .filter((m) => m.doneValue < m.target)
      .sort((a, b) => b.priority - a.priority || b.gapDays - a.gapDays);
    const dueCount = candidates.filter((m) => m.due).length;
    const want = Math.min(candidates.length, Math.max(MIN_STOPS, Math.min(MAX_STOPS, dueCount)));
    const chosen = candidates.slice(0, want);
    planItems = chosen.map<DailyPlanItem>((m) => ({
      subjectId: m.subjectId,
      topicId: m.weakTopicId,
      target: m.target,
    }));
    setDailyPlan(userId, today, planItems);
  }

  // Etappen aus dem (persistierten) Plan bauen – Zustand/Etikett live berechnet,
  // aber gegen das FESTGEHALTENE Pensum (item.target), damit es stabil bleibt.
  const requiredStages: Stage[] = [];
  for (const item of planItems) {
    const s = byId.get(item.subjectId);
    const m = metas.get(item.subjectId);
    if (!s || !m) continue; // Fach evtl. deaktiviert -> überspringen
    const target = item.target;
    const remaining = Math.max(0, target - m.doneValue);
    const reached = m.doneValue >= target;
    const unit = m.goalType === "count" ? (remaining === 1 ? "Aufgabe" : "Aufgaben") : "Min";
    const focusTopic = item.topicId && !reached;
    const strong = m.acc !== null && m.acc >= 0.7 && !m.weakTopicId;
    const reason: Stage["reason"] = reached ? "goal" : m.weakTopicId ? "weak" : strong ? "due" : "goal";
    const chip = reached
      ? "erledigt"
      : m.weakTopicName
        ? `Üben: ${m.weakTopicName}`
        : strong
          ? "Wiederholung"
          : "Dran";
    requiredStages.push({
      id: `sub-${s.id}`,
      kind: "exercise",
      subjectName: s.name,
      icon: s.icon,
      color: s.color,
      label: reached ? `${s.name} – geschafft!` : `${remaining} ${unit} · ${s.name}`,
      chip,
      reason,
      required: true,
      done: reached,
      href: `/kind/${userId}/uebung?subjectId=${s.id}` + (focusTopic ? `&topicId=${item.topicId}` : ""),
    });
  }

  // Eine Abwechslungs-/Kür-Etappe (rotiert nach Tag), nach der ersten Etappe.
  const hasGeo = subjects.some((s) => s.key === "geografie");
  const varieties: Stage[] = [];
  if (hasGeo)
    varieties.push({
      id: "var-map",
      kind: "map",
      subjectName: "Landkarte",
      icon: "🗺️",
      color: "cyan",
      label: "Landkarten-Entdecker",
      chip: "Kür",
      reason: "variety",
      required: false,
      done: false,
      href: `/kind/${userId}/landkarte`,
    });
  varieties.push({
    id: "var-game",
    kind: "game",
    subjectName: "Spiele",
    icon: "🎮",
    color: "violet",
    label: "Ein Spiel als Belohnung",
    chip: "Kür",
    reason: "variety",
    required: false,
    done: false,
    href: `/kind/${userId}/spiele`,
  });
  const variety = varieties[new Date().getDate() % varieties.length];

  const stages: Stage[] = [];
  requiredStages.forEach((s, i) => {
    stages.push(s);
    if (i === 0) stages.push(variety);
  });
  if (requiredStages.length === 0) stages.push(variety);

  // Kein Pflichtprogramm -> Tag gilt als frei/geschafft.
  const allRequiredDone = requiredStages.length === 0 || requiredStages.every((s) => s.done);
  const requiredTotal = requiredStages.length;
  const requiredDone = requiredStages.filter((s) => s.done).length;

  return NextResponse.json({
    stages,
    allRequiredDone,
    requiredTotal,
    requiredDone,
    streak: currentStreak(userId),
  });
}
