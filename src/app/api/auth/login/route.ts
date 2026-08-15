import { NextRequest, NextResponse } from "next/server";
import {
  verifyFamilyLogin,
  verifyChildLogin,
  verifyAdminLogin,
  touchFamilyLogin,
  touchUserLogin,
  touchAdminLogin,
} from "@/lib/db/repo";
import { signSession, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { identifier, password } → Login.
// Enthält der Identifier ein "@", ist es ein Eltern-Login (E-Mail). Sonst wird
// zuerst ein Admin-Login versucht, danach ein Kind-Login (beide per
// Benutzername). Antwort nennt die Rolle + das Redirect-Ziel.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { identifier?: string; email?: string; password?: string };
  const identifier = (body.identifier ?? body.email ?? "").trim();
  const password = body.password ?? "";

  if (identifier.includes("@")) {
    const fam = verifyFamilyLogin(identifier, password);
    if (!fam) {
      return NextResponse.json({ error: "E-Mail oder Passwort falsch" }, { status: 401 });
    }
    touchFamilyLogin(fam.id);
    const token = await signSession(fam.id, "parent", 0);
    const res = NextResponse.json({ ok: true, role: "parent", redirect: "/" });
    res.cookies.set(sessionCookie(token));
    return res;
  }

  // Admin-Login (eigenes Konto, keiner Familie zugeordnet).
  const admin = verifyAdminLogin(identifier, password);
  if (admin) {
    touchAdminLogin(admin.id);
    const token = await signSession(0, "admin", admin.id);
    const res = NextResponse.json({ ok: true, role: "admin", redirect: "/admin" });
    res.cookies.set(sessionCookie(token));
    return res;
  }

  const child = verifyChildLogin(identifier, password);
  if (!child) {
    return NextResponse.json({ error: "Benutzername oder Passwort falsch" }, { status: 401 });
  }
  touchUserLogin(child.id);
  const token = await signSession(child.family_id, "child", child.id);
  const res = NextResponse.json({ ok: true, role: "child", redirect: `/kind/${child.id}` });
  res.cookies.set(sessionCookie(token));
  return res;
}
