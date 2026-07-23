import { NextRequest, NextResponse } from "next/server";
import { getUser, verifyPin } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { pin?: string };
  const user = getUser(Number(id));
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const ok = verifyPin(user.pin_hash, body.pin ?? "");
  return NextResponse.json({ ok });
}
