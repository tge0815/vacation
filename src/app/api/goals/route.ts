import { NextRequest, NextResponse } from "next/server";
import { listGoals, setGoal, listSubjects, getGoalMinutes } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/goals?userId=1 → Minuten pro Fach (mit Default für nicht gesetzte).
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  const subjects = listSubjects();
  const goals = subjects.map((s) => ({
    subjectId: s.id,
    subjectKey: s.key,
    subjectName: s.name,
    dailyMinutes: getGoalMinutes(userId, s.id),
  }));
  return NextResponse.json({ goals });
}

// PUT /api/goals  body: { userId, goals: [{subjectId, dailyMinutes}] }
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    goals?: { subjectId: number; dailyMinutes: number }[];
  };
  if (!body.userId || !Array.isArray(body.goals)) {
    return NextResponse.json({ error: "userId/goals fehlt" }, { status: 400 });
  }
  for (const g of body.goals) {
    setGoal(body.userId, g.subjectId, g.dailyMinutes);
  }
  return NextResponse.json({ ok: true, goals: listGoals(body.userId) });
}
