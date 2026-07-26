import { NextRequest, NextResponse } from "next/server";
import { warmAll, warmSubject } from "@/lib/ai/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/exercise/warm { userId, subjectId? }
// Startet das Vorwärmen des Aufgaben-Vorrats (läuft im Hintergrund weiter) und
// antwortet sofort. Ohne subjectId werden alle Fächer mit Tagesziel vorgewärmt.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; subjectId?: number };
  if (!body.userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  if (body.subjectId) warmSubject(body.userId, body.subjectId);
  else warmAll(body.userId);
  return NextResponse.json({ ok: true });
}
