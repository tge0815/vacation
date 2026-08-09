import { NextRequest, NextResponse } from "next/server";
import { spendCoin } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/games/play { userId } → zieht 1 Coin ab (Spielstart).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;
  return NextResponse.json(spendCoin(body.userId!));
}
