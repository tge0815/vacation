import { NextRequest, NextResponse } from "next/server";
import { listApprovedUnredeemed } from "@/lib/db/repo";
import { sessionFrom, authUser, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET [?userId=] → bestätigte Bildschirmzeit-Freigaben, die auf dem Gerät noch
// nicht eingelöst wurden. Für die native Companion-App (Apple Screen Time).
// Kind: eigene; Eltern: mit ?userId ein bestimmtes Kind der Familie.
export async function GET(req: NextRequest) {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  const userId = s.role === "child" ? s.userId : Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;

  const grants = listApprovedUnredeemed(userId).map((r) => ({
    id: r.id,
    minutes: r.minutes,
    approvedAt: r.decided_at,
  }));
  const totalMinutes = grants.reduce((sum, g) => sum + g.minutes, 0);
  return NextResponse.json({ userId, grants, totalMinutes });
}
