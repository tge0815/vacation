import { NextRequest, NextResponse } from "next/server";
import {
  listSubjects,
  getGoal,
  progressToday,
  statsSince,
  listTopicsForFamily,
  recentTopicPerformance,
  currentStreak,
} from "@/lib/db/repo";
import { localDateStr } from "@/lib/date";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Stage = {
  id: string;
  kind: "exercise" | "game" | "map";
  subjectName: string;
  icon: string; // Fach-Icon-Name oder Emoji (bei Modi)
  color: string;
  label: string;
  chip: string; // Grund/Etikett
  reason: "weak" | "due" | "goal" | "variety";
  required: boolean;
  done: boolean;
  href: string;
};

// GET /api/path?userId= → adaptiver Tagespfad aus den Lern-Auswertungen.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const familyId = gate;

  const since = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return localDateStr(d);
  })();

  const subjects = listSubjects();
  const prog = new Map(progressToday(userId).map((p) => [p.subjectId, p]));
  const stats = new Map(statsSince(userId, since).map((s) => [s.subjectId, s]));

  // Pflicht-Etappen: alle Fächer mit gesetztem Tagesziel (Eltern-Boden).
  const required: (Stage & { _acc: number })[] = [];
  for (const s of subjects) {
    const goal = getGoal(userId, s.id);
    if (goal.target <= 0) continue;
    const p = prog.get(s.id);
    const doneValue = goal.type === "count" ? p?.attempts ?? 0 : Math.floor((p?.secondsDone ?? 0) / 60);
    const reached = doneValue >= goal.target;
    const remaining = Math.max(0, goal.target - doneValue);

    // Trefferquote der letzten 14 Tage (für die Reihenfolge nach Schwäche).
    const st = stats.get(s.id);
    const acc = st && st.attempts >= 5 ? st.correct / st.attempts : 0.65; // wenig Daten = neutral

    // Schwächstes aktives Thema als Fokus.
    let weak: { topicId: number; name: string; rate: number } | null = null;
    for (const t of listTopicsForFamily(s.id, familyId, false)) {
      const tp = recentTopicPerformance(userId, t.id);
      if (tp.attempts >= 3) {
        const rate = tp.correct / tp.attempts;
        if (rate < 0.7 && (!weak || rate < weak.rate)) weak = { topicId: t.id, name: t.name, rate };
      }
    }

    const unit = goal.type === "count" ? (remaining === 1 ? "Aufgabe" : "Aufgaben") : "Min";
    const href =
      `/kind/${userId}/uebung?subjectId=${s.id}` + (weak && !reached ? `&topicId=${weak.topicId}` : "");
    required.push({
      id: `sub-${s.id}`,
      kind: "exercise",
      subjectName: s.name,
      icon: s.icon,
      color: s.color,
      label: reached ? `${s.name} – geschafft!` : `${remaining} ${unit} · ${s.name}`,
      chip: reached ? "erledigt" : weak ? `Übe: ${weak.name}` : acc < 0.6 ? "Dranbleiben" : "Tagesziel",
      reason: weak ? "weak" : "goal",
      required: true,
      done: reached,
      href,
      _acc: acc,
    });
  }

  // Reihenfolge: offene zuerst, davon schwächste zuerst; erledigte ans Ende.
  required.sort((a, b) => Number(a.done) - Number(b.done) || a._acc - b._acc);
  const requiredStages: Stage[] = required.map(({ _acc, ...s }) => s);

  // Eine Abwechslungs-Etappe (Kür), rotiert nach Tag.
  const hasGeo = subjects.some((s) => s.key === "geografie");
  const varieties: Stage[] = [];
  if (hasGeo) {
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
  }
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

  // Kür nach der ersten Pflicht-Etappe einschieben (Pause in der Mitte).
  const stages: Stage[] = [];
  requiredStages.forEach((s, i) => {
    stages.push(s);
    if (i === 0) stages.push(variety);
  });
  if (requiredStages.length === 0) stages.push(variety);

  const allRequiredDone = requiredStages.length > 0 && requiredStages.every((s) => s.done);

  return NextResponse.json({ stages, allRequiredDone, streak: currentStreak(userId) });
}
