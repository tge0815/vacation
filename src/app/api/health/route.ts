import { NextResponse } from "next/server";
import { streamAgent } from "@/lib/ai/agent";
import { DEFAULT_MODEL } from "@/lib/ai/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Schneller Auth-/Erreichbarkeits-Check der KI. Öffne /api/health im Browser.
// { ok: true } = angemeldet & erreichbar. { ok: false, error } sonst.
export async function GET() {
  try {
    let text = "";
    for await (const chunk of streamAgent({
      prompt: "Antworte nur mit: OK",
      systemPrompt: "Du bist ein Test. Antworte ausschließlich mit dem Wort OK.",
      model: DEFAULT_MODEL,
      inactivityTimeoutMs: 40_000,
    })) {
      if (chunk.kind === "delta") text += chunk.text;
      else if (chunk.kind === "error") {
        return NextResponse.json({ ok: false, error: chunk.message }, { status: 503 });
      }
    }
    return NextResponse.json({ ok: true, model: DEFAULT_MODEL, reply: text.trim().slice(0, 40) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" },
      { status: 503 },
    );
  }
}
