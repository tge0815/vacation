import { NextRequest, NextResponse } from "next/server";
import { verifyFamilyLogin } from "@/lib/db/repo";
import { signSession, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { email, password } → Familien-Login.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; password?: string };
  const fam = verifyFamilyLogin(body.email ?? "", body.password ?? "");
  if (!fam) {
    return NextResponse.json({ error: "E-Mail oder Passwort falsch" }, { status: 401 });
  }
  const token = await signSession(fam.id);
  const res = NextResponse.json({ ok: true, family: { id: fam.id, name: fam.name } });
  res.cookies.set(sessionCookie(token));
  return res;
}
