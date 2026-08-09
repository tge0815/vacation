import { NextRequest, NextResponse } from "next/server";
import { listVocab, listSubjects, importVocab } from "@/lib/db/repo";
import { englishVocabPairs } from "@/data/englishVocab";

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

// POST /api/vocab { userId } → importiert die statische Englisch-Vokabelliste
// (aus dem Vokabelheft) ins Vokabelheft des Kindes.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number };
  if (!body.userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  const englisch = listSubjects(true).find((s) => s.key === "englisch");
  if (!englisch) return NextResponse.json({ error: "Fach Englisch nicht gefunden" }, { status: 404 });
  const res = importVocab(body.userId, englisch.id, englishVocabPairs());
  return NextResponse.json({ ...res, total: englishVocabPairs().length });
}
