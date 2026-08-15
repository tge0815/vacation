import { NextRequest, NextResponse } from "next/server";
import { listFamiliesWithStats } from "@/lib/db/repo";
import { requireAdmin } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Alle Familien mit Kennzahlen (nur Admin).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof NextResponse) return gate;
  return NextResponse.json({ families: listFamiliesWithStats() });
}
