import { NextRequest, NextResponse } from "next/server";
import { updateRewardPackage, deleteRewardPackage } from "@/lib/db/repo";
import { publicRewardPackage } from "@/lib/serialize";
import { requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  const body = (await req.json()) as { minutes?: number; coins?: number; active?: boolean };
  const fields: { minutes?: number; coins?: number; active?: boolean } = {};
  if (body.minutes !== undefined) {
    const m = Math.round(Number(body.minutes));
    if (!Number.isFinite(m) || m <= 0) {
      return NextResponse.json({ error: "Minuten müssen > 0 sein" }, { status: 400 });
    }
    fields.minutes = m;
  }
  if (body.coins !== undefined) {
    const c = Math.round(Number(body.coins));
    if (!Number.isFinite(c) || c <= 0) {
      return NextResponse.json({ error: "Coins müssen > 0 sein" }, { status: 400 });
    }
    fields.coins = c;
  }
  if (body.active !== undefined) fields.active = Boolean(body.active);
  const pkg = updateRewardPackage(Number(id), familyId, fields);
  if (!pkg) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ package: publicRewardPackage(pkg) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  const ok = deleteRewardPackage(Number(id), familyId);
  return NextResponse.json({ ok });
}
