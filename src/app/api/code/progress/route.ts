import { NextRequest, NextResponse } from "next/server";
import { listCodeProgress, getUserInFamily } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET ?userId= → abgeschlossene Lektionen + aktueller Coin-Stand.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const user = getUserInFamily(userId, gate);
  return NextResponse.json({ done: listCodeProgress(userId), coins: user?.coins ?? 0 });
}
