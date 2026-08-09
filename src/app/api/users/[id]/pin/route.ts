import { NextRequest, NextResponse } from "next/server";
import { getUserInFamily, verifyPin } from "@/lib/db/repo";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  const body = (await req.json()) as { pin?: string };
  const user = getUserInFamily(Number(id), familyId);
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const ok = verifyPin(user.pin_hash, body.pin ?? "");
  return NextResponse.json({ ok });
}
