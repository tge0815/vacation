import { NextRequest, NextResponse } from "next/server";
import { importVocab, listUsers, getUserInFamily } from "@/lib/db/repo";
import { requireParent } from "@/lib/auth/server";
import {
  extractVocabFromImage,
  ALLOWED_IMAGE_TYPES,
  type ImageMediaType,
} from "@/lib/ai/vocabPhoto";
import { langConfig, langSubject, parseLang } from "@/lib/vocabLang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// POST /api/vocab/photo { userId?, allUsers?, image, lang? }  (image = data-URL vom Foto)
// Die KI liest die Vokabeln aus dem Foto und importiert sie ins Vokabelheft —
// entweder für EIN Kind (userId) oder für ALLE Kinder der Familie (allUsers).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: number;
    allUsers?: boolean;
    image?: string;
    lang?: string;
  };

  // Vokabel-Import ist Eltern-Sache. Zielkinder serverseitig ableiten.
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

  if (!body.image) {
    return NextResponse.json({ error: "Kein Bild übergeben." }, { status: 400 });
  }

  // data-URL zerlegen: "data:image/jpeg;base64,...."
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(body.image.trim());
  if (!m) {
    return NextResponse.json({ error: "Bildformat nicht erkannt." }, { status: 400 });
  }
  const mediaType = m[1] as ImageMediaType;
  const base64 = m[2];
  if (!ALLOWED_IMAGE_TYPES.includes(mediaType)) {
    return NextResponse.json(
      { error: "Nur JPEG, PNG, GIF oder WebP werden unterstützt." },
      { status: 400 },
    );
  }
  // ~5 MB Base64-Limit (grob), um Timeouts/Speicher zu begrenzen.
  if (base64.length > 7_000_000) {
    return NextResponse.json(
      { error: "Bild zu groß. Bitte ein kleineres Foto verwenden." },
      { status: 413 },
    );
  }

  const lang = parseLang(body.lang);
  const subject = langSubject(lang);
  if (!subject) {
    return NextResponse.json(
      { error: `Lernbereich für ${langConfig(lang).label} nicht gefunden` },
      { status: 404 },
    );
  }

  try {
    // Foto nur EINMAL von der KI lesen, dann in alle Zielkinder übernehmen.
    const pairs = await extractVocabFromImage({ base64, mediaType, lang });
    if (pairs.length === 0) {
      return NextResponse.json({
        lang,
        added: 0,
        skipped: 0,
        total: 0,
        users: targetUserIds.length,
      });
    }
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Foto konnte nicht gelesen werden.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
