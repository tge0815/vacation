import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser, usernameTaken } from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";
import { requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Profil-Liste ist Eltern-Sache (enthält u.a. Benutzernamen aller Kinder).
export async function GET(req: NextRequest) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  return NextResponse.json({ users: listUsers(familyId).map(publicUser) });
}

export async function POST(req: NextRequest) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const body = (await req.json()) as {
    name?: string;
    color?: string;
    emoji?: string;
    grade?: number;
    username?: string | null;
    password?: string | null;
  };
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }

  // Login ist optional; wenn gesetzt, müssen Benutzername + Passwort passen.
  const username = body.username?.trim() || null;
  const password = body.password || null;
  if (username || password) {
    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Benutzername mind. 3 Zeichen" }, { status: 400 });
    }
    if (/\s/.test(username)) {
      return NextResponse.json({ error: "Benutzername ohne Leerzeichen" }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Passwort mind. 4 Zeichen" }, { status: 400 });
    }
    if (usernameTaken(username)) {
      return NextResponse.json({ error: "Benutzername ist schon vergeben" }, { status: 409 });
    }
  }

  const user = createUser({
    familyId,
    name: body.name.trim(),
    color: body.color,
    emoji: body.emoji,
    grade: body.grade,
    username,
    password,
  });
  return NextResponse.json({ user: publicUser(user) });
}
