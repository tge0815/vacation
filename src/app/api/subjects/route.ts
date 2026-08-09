import { NextRequest, NextResponse } from "next/server";
import { listSubjects, listTopicsForFamily } from "@/lib/db/repo";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/subjects        → nur aktive Themen (Kind-Flow), pro Familie
// GET /api/subjects?all=1   → auch deaktivierte Themen (Eltern-Verwaltung)
export async function GET(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const all = req.nextUrl.searchParams.get("all") === "1";
  const subjects = listSubjects().map((s) => ({
    ...s,
    topics: listTopicsForFamily(s.id, familyId, all),
  }));
  return NextResponse.json({ subjects });
}
