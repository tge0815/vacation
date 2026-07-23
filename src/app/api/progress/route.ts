import { NextRequest, NextResponse } from "next/server";
import { listSubjects, getGoalMinutes, progressToday, currentStreak } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/progress?userId=1 → Tagesfortschritt pro Fach + Gesamt + Streak.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });

  const subjects = listSubjects();
  const prog = progressToday(userId);
  const byId = new Map(prog.map((p) => [p.subjectId, p]));

  const rows = subjects.map((s) => {
    const p = byId.get(s.id);
    return {
      subjectId: s.id,
      key: s.key,
      name: s.name,
      color: s.color,
      icon: s.icon,
      goalMinutes: getGoalMinutes(userId, s.id),
      secondsDone: p?.secondsDone ?? 0,
      attempts: p?.attempts ?? 0,
      correct: p?.correct ?? 0,
    };
  });

  const totalGoalMinutes = rows.reduce((s, r) => s + r.goalMinutes, 0);
  const totalSecondsDone = rows.reduce((s, r) => s + r.secondsDone, 0);

  return NextResponse.json({
    subjects: rows,
    totalGoalMinutes,
    totalSecondsDone,
    streak: currentStreak(userId),
  });
}
