import { NextRequest, NextResponse } from "next/server";
import { deleteFamily } from "@/lib/db/repo";
import { requireAdmin } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE: Familie samt aller abhängigen Daten löschen (nur Admin).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (gate instanceof NextResponse) return gate;
  const { id } = await params;
  const ok = deleteFamily(Number(id));
  if (!ok) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
