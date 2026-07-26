import { NextRequest, NextResponse } from "next/server";
import { listSubjects, listTopics } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/subjects        → nur aktive Themen (Kind-Flow)
// GET /api/subjects?all=1   → auch deaktivierte Themen (Eltern-Verwaltung)
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const subjects = listSubjects().map((s) => ({
    ...s,
    topics: listTopics(s.id, all),
  }));
  return NextResponse.json({ subjects });
}
