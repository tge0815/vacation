import { NextRequest, NextResponse } from "next/server";
import { importVocab, listSubjects } from "@/lib/db/repo";
import { authUser } from "@/lib/auth/server";
import {
  extractVocabFromImage,
  ALLOWED_IMAGE_TYPES,
  type ImageMediaType,
} from "@/lib/ai/vocabPhoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// POST /api/vocab/photo { userId, image }  (image = data-URL vom Foto)
// Die KI liest die Vokabeln aus dem Foto und importiert sie ins Vokabelheft.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: number; image?: string };
  const gate = await authUser(req, Number(body.userId));
  if (gate instanceof NextResponse) return gate;

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

  const vok = listSubjects(true).find((s) => s.key === "vokabeln");
  if (!vok) {
    return NextResponse.json({ error: "Lernbereich Vokabeln nicht gefunden" }, { status: 404 });
  }

  try {
    const pairs = await extractVocabFromImage({ base64, mediaType });
    if (pairs.length === 0) {
      return NextResponse.json({ added: 0, skipped: 0, total: 0, pairs: [] });
    }
    const res = importVocab(Number(body.userId), vok.id, pairs);
    return NextResponse.json({ ...res, total: pairs.length, pairs });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Foto konnte nicht gelesen werden.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
