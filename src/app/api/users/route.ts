import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser } from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  return NextResponse.json({ users: listUsers(familyId).map(publicUser) });
}

export async function POST(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const body = (await req.json()) as {
    name?: string;
    color?: string;
    emoji?: string;
    pin?: string | null;
    grade?: number;
  };
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }
  const user = createUser({
    familyId,
    name: body.name.trim(),
    color: body.color,
    emoji: body.emoji,
    pin: body.pin && body.pin.length ? body.pin : null,
    grade: body.grade,
  });
  return NextResponse.json({ user: publicUser(user) });
}
