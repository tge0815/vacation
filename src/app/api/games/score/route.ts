import { NextRequest, NextResponse } from "next/server";
import { getGameScores, recordGameScore } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/games/score?userId=1 → Bestwerte pro Spiel.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  return NextResponse.json({ scores: getGameScores(userId) });
}

// POST /api/games/score  { userId, game, score }
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; game?: string; score?: number };
  if (!body.userId || !body.game || typeof body.score !== "number") {
    return NextResponse.json({ error: "userId/game/score fehlt" }, { status: 400 });
  }
  const result = recordGameScore(body.userId, body.game, body.score);
  return NextResponse.json(result);
}
