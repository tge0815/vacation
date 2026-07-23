import { NextRequest, NextResponse } from "next/server";
import { getUser, updateUser, deleteUser } from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUser(Number(id));
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteUser(Number(id));
  return NextResponse.json({ ok });
}
