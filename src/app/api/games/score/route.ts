import { NextRequest, NextResponse } from "next/server";
import { getGameScores, recordGameScore } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/games/score?userId=1 → Bestwerte pro Spiel.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  return NextResponse.json({ scores: getGameScores(userId) });
}

// POST /api/games/score  { userId, game, score }
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; game?: string; score?: number };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  if (!body.game || typeof body.score !== "number") {
    return NextResponse.json({ error: "game/score fehlt" }, { status: 400 });
  }
  const result = recordGameScore(body.userId!, body.game, body.score);
  return NextResponse.json(result);
}
