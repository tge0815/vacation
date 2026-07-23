import { NextRequest, NextResponse } from "next/server";
import { setTopicActive } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { active?: boolean };
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active fehlt" }, { status: 400 });
  }
  setTopicActive(Number(id), body.active);
  return NextResponse.json({ ok: true });
}
