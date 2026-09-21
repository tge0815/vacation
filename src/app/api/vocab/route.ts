import { NextRequest, NextResponse } from "next/server";
import { listVocab, importVocab, listUsers, getUserInFamily } from "@/lib/db/repo";
import { authUser, requireParent } from "@/lib/auth/server";
import { langConfig, langSubject, parseLang, VOCAB_LANGS } from "@/lib/vocabLang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/vocab?userId=1&lang=fr → Vokabelheft einer Sprache (mit richtig/
// falsch & Box). Ohne lang: Englisch, wie bisher.
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const gate = await authUser(req, userId);
  if (gate instanceof NextResponse) return gate;

  const lang = parseLang(req.nextUrl.searchParams.get("lang"));
  const subject = langSubject(lang);
  if (!subject) {
    return NextResponse.json({ error: "Lernbereich nicht gefunden", vocab: [] }, { status: 404 });
  }

  const vocab = listVocab(userId, subject.id).map((v) => ({
    id: v.id,
    prompt: v.prompt,
    answer: v.answer,
    seen: v.seen,
    correct: v.correct,
    wrong: v.wrong,
    box: v.box,
  }));
  return NextResponse.json({
    lang,
    subjectId: subject.id,
    subjectName: subject.name,
    vocab,
    langs: VOCAB_LANGS.map((l) => ({ lang: l, label: langConfig(l).label })),
  });
}

// POST /api/vocab { userId, lang } → importiert die statische Buch-Vokabelliste
// der Sprache ins Vokabelheft des Kindes (Englisch oder Französisch).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; allUsers?: boolean; lang?: string };

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

  const lang = parseLang(body.lang);
  const subject = langSubject(lang);
  if (!subject) {
    return NextResponse.json(
      { error: `Lernbereich für ${langConfig(lang).label} nicht gefunden` },
      { status: 404 },
    );
  }

  const pairs = langConfig(lang).pairs();
  let added = 0;
  let skipped = 0;
  for (const uid of targetUserIds) {
    const r = importVocab(uid, subject.id, pairs);
    added += r.added;
    skipped += r.skipped;
  }
  return NextResponse.json({
    lang,
    added,
    skipped,
    total: pairs.length,
    users: targetUserIds.length,
  });
}
