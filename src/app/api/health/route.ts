import { NextResponse } from "next/server";
import { DEFAULT_MODEL } from "@/lib/ai/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Öffentliche Liveness-Probe (ohne Login). Prüft, dass die App läuft und ein
// API-Key konfiguriert ist — OHNE einen KI-Aufruf, damit dieser offene Endpunkt
// kein Token-Verbrenn-/Missbrauchsvektor ist. Die Gültigkeit des Keys zeigt sich
// beim ersten echten Aufgaben-Abruf (angemeldet).
export async function GET() {
  const keySet = Boolean(process.env.ANTHROPIC_API_KEY);
  if (!keySet) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY ist nicht gesetzt (.env)." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, model: DEFAULT_MODEL });
}
