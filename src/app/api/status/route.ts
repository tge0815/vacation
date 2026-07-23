import { NextResponse } from "next/server";
import { DEFAULT_MODEL, REASONING_MODEL, modelLabel } from "@/lib/ai/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    backend: "Max-Plan",
    models: {
      default: { id: DEFAULT_MODEL, label: modelLabel(DEFAULT_MODEL) },
      reasoning: { id: REASONING_MODEL, label: modelLabel(REASONING_MODEL) },
    },
  });
}
