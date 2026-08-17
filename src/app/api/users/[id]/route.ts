import { NextRequest, NextResponse } from "next/server";
import {
  getUserInFamily,
  updateUser,
  deleteUser,
  usernameTaken,
  clearDailyPlan,
} from "@/lib/db/repo";
import { publicUser } from "@/lib/serialize";
import { localDateStr } from "@/lib/date";
import { authUser, requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Eltern jedes eigene Kind, Kind nur sich selbst (authUser regelt das).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await authUser(req, Number(id));
  if (gate instanceof NextResponse) return gate;
  const user = getUserInFamily(Number(id), gate);
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  const uid = Number(id);
  if (!getUserInFamily(uid, familyId)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  const body = (await req.json()) as {
    name?: string;
    color?: string;
    emoji?: string;
    grade?: number;
    username?: string | null;
    password?: string | null;
    adaptiveVolume?: boolean;
  };

  // Login-Änderung validieren (nur wenn Felder mitgeschickt werden).
  if (body.username !== undefined && body.username !== null && body.username.trim() !== "") {
    const u = body.username.trim();
    if (u.length < 3) return NextResponse.json({ error: "Benutzername mind. 3 Zeichen" }, { status: 400 });
    if (/\s/.test(u)) return NextResponse.json({ error: "Benutzername ohne Leerzeichen" }, { status: 400 });
    if (usernameTaken(u, uid)) {
      return NextResponse.json({ error: "Benutzername ist schon vergeben" }, { status: 409 });
    }
  }
  if (body.password !== undefined && body.password !== null && body.password !== "") {
    if (body.password.length < 4) {
      return NextResponse.json({ error: "Passwort mind. 4 Zeichen" }, { status: 400 });
    }
  }

  const user = updateUser(uid, body);
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  // Adaptiv-Umschaltung wirkt sofort: heutigen Plan verwerfen → wird neu berechnet.
  if (body.adaptiveVolume !== undefined) clearDailyPlan(uid, localDateStr());
  return NextResponse.json({ user: publicUser(user) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const { id } = await params;
  if (!getUserInFamily(Number(id), familyId)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  const ok = deleteUser(Number(id));
  return NextResponse.json({ ok });
}
