import { NextRequest, NextResponse } from "next/server";
import { generateBatch } from "@/lib/ai/exercises";
import { takeFromPool, warmSubject, type ExerciseDTO } from "@/lib/ai/pool";
import { authUser } from "@/lib/auth/server";

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
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  if (!body.subjectId) {
    return NextResponse.json({ error: "subjectId fehlt" }, { status: 400 });
  }
  const userId = Number(body.userId);
  const subjectId = body.subjectId;
  const count = body.count ?? 1;
  try {
    // 1) Aus dem persistenten Vorrat bedienen (bereits generierte Aufgaben).
    //    Bei festem Thema nicht aus dem gemischten Vorrat nehmen.
    const reused: ExerciseDTO[] = body.topicId ? [] : takeFromPool(userId, subjectId, count);
    const need = count - reused.length;

    // 2) Rest ggf. frisch generieren.
    const fresh: ExerciseDTO[] =
      need > 0
        ? (
            await generateBatch({
              userId,
              subjectId,
              topicId: body.topicId ?? null,
              count: need,
            })
          ).map(({ exercise, subject, topic, difficulty }) => ({
            exercise,
            subjectId: subject.id,
            subjectKey: subject.key,
            topicId: topic.id,
            topicKey: topic.key,
            topicName: topic.name,
            difficulty,
          }))
        : [];

    // Vorrat im Hintergrund wieder auffüllen.
    if (!body.topicId) warmSubject(userId, subjectId);
    const exercises = [...reused, ...fresh];
    return NextResponse.json({ exercises });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler beim Erzeugen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
