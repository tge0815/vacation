import { NextRequest, NextResponse } from "next/server";
import { warmAll, warmSubject } from "@/lib/ai/pool";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/exercise/warm { userId, subjectId? }
// Startet das Vorwärmen des Aufgaben-Vorrats (läuft im Hintergrund weiter) und
// antwortet sofort. Ohne subjectId werden alle Fächer mit Tagesziel vorgewärmt.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; subjectId?: number };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  if (body.subjectId) warmSubject(body.userId!, body.subjectId);
  else warmAll(body.userId!);
  return NextResponse.json({ ok: true });
}
