import { NextRequest, NextResponse } from "next/server";
import { evaluateReading } from "@/lib/ai/exercises";
import { insertAttempt, awardCorrectCoins } from "@/lib/db/repo";
import { ExerciseSchema, type Exercise } from "@/lib/ai/schemas";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    subjectId?: number;
    topicId?: number | null;
    difficulty?: number;
    exercise?: Exercise;
    transcript?: string;
    durationSec?: number;
  };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  if (!body.subjectId || !body.exercise) {
    return NextResponse.json({ error: "subjectId/exercise fehlt" }, { status: 400 });
  }
  const userId = Number(body.userId);
  const parsed = ExerciseSchema.safeParse(body.exercise);
  if (!parsed.success) {
    return NextResponse.json({ error: "Aufgabe ungültig" }, { status: 400 });
  }
  const exercise = parsed.data;
  const passage = exercise.passage ?? exercise.solution ?? exercise.question;
  const transcript = (body.transcript ?? "").trim();

  try {
    const grade = await evaluateReading({ passage, transcript });
    const isCorrect = grade.accuracyPct >= 70;

    const attempt = insertAttempt({
      userId,
      subjectId: body.subjectId,
      topicId: body.topicId ?? null,
      difficulty: body.difficulty ?? exercise.difficulty,
      inputMode: "reading",
      exercise,
      answerText: transcript,
      grade,
      isCorrect,
      score: grade.score,
      durationSec: body.durationSec ?? 0,
    });

    const reward = awardCorrectCoins(userId);

    return NextResponse.json({ grade, isCorrect, attemptId: attempt.id, reward });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler beim Bewerten";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
