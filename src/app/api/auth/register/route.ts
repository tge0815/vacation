import { NextRequest, NextResponse } from "next/server";
import { createFamily, getFamilyByEmail } from "@/lib/db/repo";
import { signSession, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { name, email, password, invite } → legt eine Familie an (nur mit gültigem
// Einladungscode) und meldet sie direkt an.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    invite?: string;
  };
  const invite = process.env.LEARN_INVITE_CODE ?? "";
  if (!invite || (body.invite ?? "").trim() !== invite) {
    return NextResponse.json({ error: "Einladungscode ungültig" }, { status: 403 });
  }
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name und gültige E-Mail nötig" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Passwort mind. 6 Zeichen" }, { status: 400 });
  }
  if (getFamilyByEmail(email)) {
    return NextResponse.json({ error: "E-Mail ist schon vergeben" }, { status: 409 });
  }
  const fam = createFamily(name, email, password);
  const token = await signSession(fam.id);
  const res = NextResponse.json({ ok: true, family: { id: fam.id, name: fam.name } });
  res.cookies.set(sessionCookie(token));
  return res;
}
