import { NextRequest, NextResponse } from "next/server";
import { getUserInFamily, updateUser, deleteUser } from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  const user = getUserInFamily(Number(id), familyId);
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  if (!getUserInFamily(Number(id), familyId)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  const body = (await req.json()) as {
    name?: string;
    color?: string;
    emoji?: string;
    grade?: number;
    pin?: string | null;
  };
  const user = updateUser(Number(id), body);
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  if (!getUserInFamily(Number(id), familyId)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  const ok = deleteUser(Number(id));
  return NextResponse.json({ ok });
}
