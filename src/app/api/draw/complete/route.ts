import { NextRequest, NextResponse } from "next/server";
import { completeDrawLesson } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";
import { DRAW_LESSONS } from "@/components/kid/draw/lessons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Münz-Belohnung pro Lektion – serverseitig aus den Lektionsdaten abgeleitet.
const LESSON_COINS: Record<string, number> = Object.fromEntries(
  DRAW_LESSONS.map((l) => [l.key, l.coins]),
);

// POST { userId, lessonKey } → Zeichen-Lektion abschließen (Münzen nur beim 1. Mal).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; lessonKey?: string };
  const userId = Number(body.userId);
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const key = String(body.lessonKey ?? "");
  if (!(key in LESSON_COINS)) {
    return NextResponse.json({ error: "Unbekannte Lektion" }, { status: 400 });
  }
  const result = completeDrawLesson(userId, key, LESSON_COINS[key]);
  return NextResponse.json({ ok: true, ...result });
}
