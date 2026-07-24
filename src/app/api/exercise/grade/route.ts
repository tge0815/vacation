import { NextRequest, NextResponse } from "next/server";
import { gradeExercise } from "@/lib/ai/exercises";
import { tryLocalGrade } from "@/lib/ai/localGrade";
import { insertAttempt, awardCorrectCoins } from "@/lib/db/repo";
import { ExerciseSchema, type Exercise } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    subjectId?: number;
    subjectKey?: string;
    topicId?: number | null;
    topicKey?: string;
    difficulty?: number;
    exercise?: Exercise;
    answer?: string;
    durationSec?: number;
  };
  if (!body.userId || !body.subjectId || !body.exercise) {
    return NextResponse.json({ error: "userId/subjectId/exercise fehlt" }, { status: 400 });
  }

  const parsed = ExerciseSchema.safeParse(body.exercise);
  if (!parsed.success) {
    return NextResponse.json({ error: "Aufgabe ungültig" }, { status: 400 });
  }
  const exercise = parsed.data;
  const answer = (body.answer ?? "").trim();

  try {
    // Erst lokal versuchen (Multiple-Choice/Zahlen/exakte Treffer) — kein
    // KI-Aufruf, sofortige Antwort. Sonst KI bewerten lassen.
    const grade =
      tryLocalGrade(exercise, answer) ??
      (await gradeExercise({
        subjectKey: body.subjectKey ?? "",
        topicKey: body.topicKey,
        exercise,
        answer,
      }));

    const attempt = insertAttempt({
      userId: body.userId,
      subjectId: body.subjectId,
      topicId: body.topicId ?? null,
      difficulty: body.difficulty ?? exercise.difficulty,
      inputMode: exercise.inputMode,
      exercise,
      answerText: answer,
      grade,
      isCorrect: grade.isCorrect,
      score: grade.score,
      durationSec: body.durationSec ?? 0,
    });

    const reward = awardCorrectCoins(body.userId);

    return NextResponse.json({ grade, attemptId: attempt.id, reward });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler beim Bewerten";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
