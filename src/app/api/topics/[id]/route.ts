import { NextRequest, NextResponse } from "next/server";
import { getTopic, setFamilyTopicActive } from "@/lib/db/repo";
import { requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/topics/:id { active } → Thema für die angemeldete Familie an/aus.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  const body = (await req.json()) as { active?: boolean };
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active fehlt" }, { status: 400 });
  }
  if (!getTopic(Number(id))) {
    return NextResponse.json({ error: "Thema nicht gefunden" }, { status: 404 });
  }
  setFamilyTopicActive(familyId, Number(id), body.active);
  return NextResponse.json({ ok: true });
}
