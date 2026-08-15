import { NextRequest, NextResponse } from "next/server";
import { revokeInviteCode, deleteInviteCode } from "@/lib/db/repo";
import { requireAdmin } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH { action: "revoke" } → Code sperren (bleibt sichtbar).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (gate instanceof NextResponse) return gate;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  if (body.action !== "revoke") {
    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
  const ok = revokeInviteCode(Number(id));
  if (!ok) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE → Code endgültig entfernen.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (gate instanceof NextResponse) return gate;
  const { id } = await params;
  const ok = deleteInviteCode(Number(id));
  if (!ok) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
