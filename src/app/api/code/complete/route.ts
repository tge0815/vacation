import { NextRequest, NextResponse } from "next/server";
import { completeCodeLesson } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bekannte Lektionen + ihre Münz-Belohnung (serverseitig, nicht dem Client
// vertrauen). So kann eine Lektion nicht beliebig oft Münzen bringen.
const LESSON_COINS: Record<string, number> = {
  "basics": 3,
  "w1l1": 2,
  "w1l2": 2,
  "w1l3": 3,
  "w2l1": 3,
  "w2l2": 4,
};

// POST { userId, lessonKey } → Lektion abschließen (Münzen nur beim 1. Mal).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; lessonKey?: string };
  const userId = Number(body.userId);
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const key = String(body.lessonKey ?? "");
  if (!(key in LESSON_COINS)) {
    return NextResponse.json({ error: "Unbekannte Lektion" }, { status: 400 });
  }
  const result = completeCodeLesson(userId, key, LESSON_COINS[key]);
  return NextResponse.json({ ok: true, ...result });
}
