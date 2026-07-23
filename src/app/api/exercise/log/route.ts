import { NextRequest, NextResponse } from "next/server";
import { insertAttempt, awardDailyCoin } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protokolliert eine bereits im Client bewertete Aufgabe (z.B. Landkarte) —
// zählt wie eine normale Übung ins Tagesziel und kann einen Coin auslösen.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    subjectId?: number;
    topicId?: number | null;
    difficulty?: number;
    inputMode?: string;
    question?: string;
    answer?: string;
    solution?: string;
    isCorrect?: boolean;
    durationSec?: number;
  };
  if (!body.userId || !body.subjectId || typeof body.isCorrect !== "boolean") {
    return NextResponse.json({ error: "userId/subjectId/isCorrect fehlt" }, { status: 400 });
  }

  const exercise = {
    inputMode: body.inputMode ?? "map",
    instruction: "Landkarte",
    question: body.question ?? "",
    solution: body.solution ?? "",
    difficulty: body.difficulty ?? 2,
  };

  insertAttempt({
    userId: body.userId,
    subjectId: body.subjectId,
    topicId: body.topicId ?? null,
    difficulty: body.difficulty ?? 2,
    inputMode: body.inputMode ?? "map",
    exercise,
    answerText: body.answer ?? null,
    grade: { isCorrect: body.isCorrect, score: body.isCorrect ? 100 : 0 },
    isCorrect: body.isCorrect,
    score: body.isCorrect ? 100 : 0,
    durationSec: body.durationSec ?? 0,
  });

  const reward = awardDailyCoin(body.userId);
  return NextResponse.json({ ok: true, reward });
}
