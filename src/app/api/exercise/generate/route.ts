import { NextRequest, NextResponse } from "next/server";
import { generateBatch, type GeneratedExercise } from "@/lib/ai/exercises";
import { takeFromPool, warmSubject } from "@/lib/ai/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    subjectId?: number;
    topicId?: number | null;
    count?: number;
  };
  if (!body.userId || !body.subjectId) {
    return NextResponse.json({ error: "userId/subjectId fehlt" }, { status: 400 });
  }
  const userId = body.userId;
  const subjectId = body.subjectId;
  const count = body.count ?? 1;
  try {
    // Bei festem Thema nicht aus dem (gemischten) Pool bedienen.
    let batch: GeneratedExercise[] = body.topicId ? [] : takeFromPool(userId, subjectId, count);
    if (batch.length < count) {
      const more = await generateBatch({
        userId,
        subjectId,
        topicId: body.topicId ?? null,
        count: count - batch.length,
      });
      batch = [...batch, ...more];
    }
    // Pool im Hintergrund wieder auffüllen.
    if (!body.topicId) warmSubject(userId, subjectId);
    const exercises = batch.map(({ exercise, subject, topic, difficulty }) => ({
      exercise,
      subjectId: subject.id,
      subjectKey: subject.key,
      topicId: topic.id,
      topicKey: topic.key,
      topicName: topic.name,
      difficulty,
    }));
    return NextResponse.json({ exercises });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler beim Erzeugen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
