import { NextRequest, NextResponse } from "next/server";
import { listVocab } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/vocab?userId=1 → Vokabelheft (mit richtig/falsch & Box).
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  const vocab = listVocab(userId).map((v) => ({
    id: v.id,
    prompt: v.prompt,
    answer: v.answer,
    seen: v.seen,
    correct: v.correct,
    wrong: v.wrong,
    box: v.box,
  }));
  return NextResponse.json({ vocab });
}
