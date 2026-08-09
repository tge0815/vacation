import { NextRequest, NextResponse } from "next/server";
import {
  createRewardRequest,
  listRewardRequestsForFamily,
  listRewardRequestsForUser,
  type RewardRequestRow,
} from "@/lib/db/repo";
import { publicRewardRequest } from "@/lib/serialize";
import { sessionFrom, authUser, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → Anfragen. Eltern: alle der Familie (optional ?status=pending, mit
// Kind-Namen). Kind: nur die eigenen.
export async function GET(req: NextRequest) {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  if (s.role === "parent") {
    const statusParam = req.nextUrl.searchParams.get("status");
    const status =
      statusParam === "pending" || statusParam === "approved" || statusParam === "declined"
        ? (statusParam as RewardRequestRow["status"])
        : undefined;
    const requests = listRewardRequestsForFamily(s.familyId, status).map(publicRewardRequest);
    return NextResponse.json({ requests });
  }
  const requests = listRewardRequestsForUser(s.userId).map(publicRewardRequest);
  return NextResponse.json({ requests });
}

// POST { userId, packageId } → Kind beantragt ein Bildschirmzeit-Paket.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; packageId?: number };
  const userId = Number(body.userId);
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
  const result = createRewardRequest(userId, gate, Number(body.packageId));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ request: publicRewardRequest(result.request!) });
}
