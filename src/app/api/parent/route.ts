import { NextRequest, NextResponse } from "next/server";
import { getParentPinHash, setParentPin, verifyPin } from "@/lib/db/repo";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → ist ein Eltern-PIN gesetzt (für diese Familie)?
export async function GET(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const hash = getParentPinHash(familyId);
  return NextResponse.json({ pinSet: Boolean(hash) });
}

// POST { action: "verify" | "set", pin, newPin? }
export async function POST(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const body = (await req.json()) as {
    action?: "verify" | "set";
    pin?: string;
    newPin?: string | null;
  };
  const hash = getParentPinHash(familyId);

  if (body.action === "verify") {
    // Kein PIN gesetzt → Zugang offen (Eltern richten ihn beim ersten Mal ein).
    const ok = !hash || verifyPin(hash, body.pin ?? "");
    return NextResponse.json({ ok });
  }

  if (body.action === "set") {
    // PIN ändern nur wenn aktueller PIN stimmt (oder noch keiner gesetzt).
    if (hash && !verifyPin(hash, body.pin ?? "")) {
      return NextResponse.json({ ok: false, error: "Aktueller PIN falsch" }, { status: 403 });
    }
    setParentPin(familyId, body.newPin && body.newPin.length ? body.newPin : null);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
