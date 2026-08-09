import { NextRequest, NextResponse } from "next/server";
import { decideRewardRequest } from "@/lib/db/repo";
import { requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { action: "approve" | "decline" } → Eltern entscheiden über eine Anfrage.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  const body = (await req.json()) as { action?: "approve" | "decline" };
  if (body.action !== "approve" && body.action !== "decline") {
    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
  const result = decideRewardRequest(Number(id), familyId, body.action === "approve");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, coins: result.coins });
}
