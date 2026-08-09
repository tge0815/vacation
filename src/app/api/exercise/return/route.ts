import { NextRequest, NextResponse } from "next/server";
import { returnExercises, type ExerciseDTO } from "@/lib/ai/pool";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { userId, subjectId, topicId, exercises }
// Gibt vorab geholte, aber NICHT verbrauchte Aufgaben an den Server-Vorrat
// zurück, damit sie beim nächsten Öffnen wiederverwendet werden (spart Tokens).
// Wird beim Verlassen/Fachwechsel aufgerufen (meist via navigator.sendBeacon).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    subjectId?: number;
    topicId?: number | null;
    exercises?: ExerciseDTO[];
  };
  const userId = Number(body.userId);
  const subjectId = Number(body.subjectId);
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;

  // Nur den fach-allgemeinen Vorrat wiederverwenden (kein festes Thema).
  if (!subjectId || body.topicId) return NextResponse.json({ ok: true, stored: 0 });

  const items = (Array.isArray(body.exercises) ? body.exercises : [])
    .filter((e) => e && e.exercise && Number(e.subjectId) === subjectId)
    .slice(0, 30);
  returnExercises(userId, subjectId, items);
  return NextResponse.json({ ok: true, stored: items.length });
}
