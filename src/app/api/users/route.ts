import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser } from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ users: listUsers().map(publicUser) });
}

export async function POST(req: NextRequest) {
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
    name: body.name.trim(),
    color: body.color,
    emoji: body.emoji,
    pin: body.pin && body.pin.length ? body.pin : null,
    grade: body.grade,
  });
  return NextResponse.json({ user: publicUser(user) });
}
