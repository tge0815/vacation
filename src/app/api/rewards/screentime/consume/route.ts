import { NextRequest, NextResponse } from "next/server";
import { markRewardsRedeemed } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { userId, ids } → markiert genehmigte Freigaben als auf dem Gerät
// eingelöst (aktiviert), damit sie nicht doppelt gewährt werden.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; ids?: number[] };
  const userId = Number(body.userId);
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
  const result = markRewardsRedeemed(userId, ids);
  return NextResponse.json({ ok: true, ...result });
}
