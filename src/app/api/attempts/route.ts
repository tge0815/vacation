import { NextRequest, NextResponse } from "next/server";
import {
  listSubjects,
  statsSince,
  recentAttempts,
  currentStreak,
  getTopic,
} from "@/lib/db/repo";
import { localDateStr } from "@/lib/date";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sinceDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateStr(d);
}

// GET /api/attempts?userId=1&days=14&limit=25 → Statistik + detaillierte Historie.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const days = Number(req.nextUrl.searchParams.get("days") ?? 14);
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 25);

  const subjects = listSubjects();
  const subjName = new Map(subjects.map((s) => [s.id, s.name]));

  const stats = statsSince(userId, sinceDaysAgo(days)).map((st) => ({
    ...st,
    subjectName: subjName.get(st.subjectId) ?? "?",
    rate: st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0,
  }));

  const recent = recentAttempts({ userId, limit }).map((a) => {
    let exercise: unknown = null;
    let grade: unknown = null;
    try {
      exercise = JSON.parse(a.exercise_json);
    } catch {}
    try {
      grade = a.grade_json ? JSON.parse(a.grade_json) : null;
    } catch {}
    return {
      id: a.id,
      date: a.date,
      subjectName: subjName.get(a.subject_id) ?? "?",
      topicName: a.topic_id ? getTopic(a.topic_id)?.name ?? null : null,
      difficulty: a.difficulty,
      isCorrect: a.is_correct === 1,
      score: a.score,
      answer: a.answer_text,
      exercise,
      grade,
    };
  });

  return NextResponse.json({ stats, recent, streak: currentStreak(userId) });
}
