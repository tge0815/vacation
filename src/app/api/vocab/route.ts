import { NextRequest, NextResponse } from "next/server";
import { listVocab, listSubjects, importVocab, listUsers, getUserInFamily } from "@/lib/db/repo";
import { englishVocabPairs } from "@/data/englishVocab";
import { authUser, requireParent } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/vocab?userId=1 → Vokabelheft (mit richtig/falsch & Box).
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;
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
  const body = (await req.json()) as { userId?: number; allUsers?: boolean };

  // Vokabel-Import ist Eltern-Sache.
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  let targetUserIds: number[];
  if (body.allUsers) {
    targetUserIds = listUsers(familyId).map((u) => u.id);
    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: "Keine Kinder angelegt." }, { status: 400 });
    }
  } else {
    if (!getUserInFamily(Number(body.userId), familyId)) {
      return NextResponse.json({ error: "Kind nicht gefunden" }, { status: 404 });
    }
    targetUserIds = [Number(body.userId)];
  }

  const vok = listSubjects(true).find((s) => s.key === "vokabeln");
  if (!vok) return NextResponse.json({ error: "Lernbereich Vokabeln nicht gefunden" }, { status: 404 });

  const pairs = englishVocabPairs();
  let added = 0;
  let skipped = 0;
  for (const uid of targetUserIds) {
    const r = importVocab(uid, vok.id, pairs);
    added += r.added;
    skipped += r.skipped;
  }
  return NextResponse.json({ added, skipped, total: pairs.length, users: targetUserIds.length });
}
