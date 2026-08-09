import { NextRequest, NextResponse } from "next/server";
import { listSubjects, getGoal, progressToday, currentStreak } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/progress?userId=1 → Tagesfortschritt pro Fach + Gesamt + Streak.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;

  const subjects = listSubjects();
  const prog = progressToday(userId);
  const byId = new Map(prog.map((p) => [p.subjectId, p]));

  const rows = subjects.map((s) => {
    const p = byId.get(s.id);
    const goal = getGoal(userId, s.id);
    const secondsDone = p?.secondsDone ?? 0;
    const attempts = p?.attempts ?? 0;
    // Erledigt-Wert je nach Ziel-Typ: Minuten (aufgerundet) oder Aufgaben-Anzahl.
    const doneValue = goal.type === "count" ? attempts : Math.floor(secondsDone / 60);
    const reached = goal.target > 0 && doneValue >= goal.target;
    return {
      subjectId: s.id,
      key: s.key,
      name: s.name,
      color: s.color,
      icon: s.icon,
      goalType: goal.type,
      goalTarget: goal.target,
      secondsDone,
      attempts,
      correct: p?.correct ?? 0,
      doneValue,
      reached,
    };
  });

  const withGoal = rows.filter((r) => r.goalTarget > 0);
  const subjectsReached = withGoal.filter((r) => r.reached).length;

  return NextResponse.json({
    subjects: rows,
    subjectsWithGoal: withGoal.length,
    subjectsReached,
    streak: currentStreak(userId),
  });
}
