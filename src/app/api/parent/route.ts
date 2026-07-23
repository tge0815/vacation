import { NextRequest, NextResponse } from "next/server";
import { getParentPinHash, setParentPin, verifyPin } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → ist ein Eltern-PIN gesetzt?
export async function GET() {
  const hash = getParentPinHash();
  return NextResponse.json({ pinSet: Boolean(hash) });
}

// POST { action: "verify" | "set", pin, newPin? }
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    action?: "verify" | "set";
    pin?: string;
    newPin?: string | null;
  };
  const hash = getParentPinHash();

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
    setParentPin(body.newPin && body.newPin.length ? body.newPin : null);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
