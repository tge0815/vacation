import { NextRequest, NextResponse } from "next/server";
import { generateBatch } from "@/lib/ai/exercises";

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
  try {
    const batch = await generateBatch({
      userId: body.userId,
      subjectId: body.subjectId,
      topicId: body.topicId ?? null,
      count: body.count ?? 1,
    });
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
