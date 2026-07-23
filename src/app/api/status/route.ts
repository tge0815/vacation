import { NextResponse } from "next/server";
import { DEFAULT_MODEL, REASONING_MODEL, MODEL_LABELS } from "@/lib/ai/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    backend: "Max-Plan",
    models: {
      default: { id: DEFAULT_MODEL, label: MODEL_LABELS[DEFAULT_MODEL] ?? "Default" },
      reasoning: { id: REASONING_MODEL, label: MODEL_LABELS[REASONING_MODEL] ?? "Reasoning" },
    },
  });
}
