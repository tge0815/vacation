import { NextRequest, NextResponse } from "next/server";
import { listGoals, setGoal, listSubjects, getGoal, type GoalType } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/goals?userId=1 → Ziel pro Fach (Typ + Wert, mit Default).
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const subjects = listSubjects();
  const goals = subjects.map((s) => {
    const g = getGoal(userId, s.id);
    return {
      subjectId: s.id,
      subjectKey: s.key,
      subjectName: s.name,
      goalType: g.type,
      target: g.target,
      level: g.level,
    };
  });
  return NextResponse.json({ goals });
}

// PUT /api/goals  body: { userId, goals: [{subjectId, goalType, target}] }
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    goals?: { subjectId: number; goalType?: GoalType; target?: number; level?: number }[];
  };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  if (!Array.isArray(body.goals)) {
    return NextResponse.json({ error: "goals fehlt" }, { status: 400 });
  }
  const userId = Number(body.userId);
  for (const g of body.goals) {
    const type: GoalType = g.goalType === "count" ? "count" : "minutes";
    setGoal(userId, g.subjectId, g.target ?? 0, type, g.level ?? 0);
  }
  return NextResponse.json({ ok: true, goals: listGoals(userId) });
}
