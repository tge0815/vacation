import { NextRequest, NextResponse } from "next/server";
import { listInviteCodes, createInviteCode } from "@/lib/db/repo";
import { requireAdmin } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Alle Einladungscodes (nur Admin).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof NextResponse) return gate;
  return NextResponse.json({ codes: listInviteCodes() });
}

// POST { label?, maxUses?, expiresDays? } → neuen Einzelcode erzeugen.
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (adminId instanceof NextResponse) return adminId;
  const body = (await req.json().catch(() => ({}))) as {
    label?: string;
    maxUses?: number | null;
    expiresDays?: number | null;
  };
  const label = (body.label ?? "").trim() || null;
  const maxUses =
    body.maxUses != null && Number.isFinite(body.maxUses) && body.maxUses > 0
      ? Math.floor(body.maxUses)
      : null;
  const expiresAt =
    body.expiresDays != null && Number.isFinite(body.expiresDays) && body.expiresDays > 0
      ? Date.now() + Math.floor(body.expiresDays) * 86_400_000
      : null;
  const code = createInviteCode({ label, maxUses, expiresAt, createdBy: adminId });
  return NextResponse.json({ code });
}
