import { NextRequest, NextResponse } from "next/server";
import { spendCoin } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/games/play { userId } → zieht 1 Coin ab (Spielstart).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number };
  if (!body.userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  return NextResponse.json(spendCoin(body.userId));
}
