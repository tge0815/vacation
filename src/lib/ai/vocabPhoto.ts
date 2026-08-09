import { z } from "zod";
import { getClient } from "./agent";
import { DEFAULT_MODEL } from "./run";

// Erlaubte Bildformate für die Anthropic-Vision-API.
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export type ImageMediaType = (typeof ALLOWED_IMAGE_TYPES)[number];

const PairSchema = z.object({
  de: z.string().trim().min(1),
  en: z.string().trim().min(1),
});
const ResultSchema = z.object({ pairs: z.array(PairSchema) });

const SYSTEM = `Du liest Vokabellisten aus einem Foto (z.B. eine Seite aus einem Schul-Vokabelheft).
- Erkenne die Wortpaare Deutsch ↔ Englisch, egal welche Spalte links oder rechts steht.
- Gib "de" = deutsches Wort/Wendung, "en" = englisches Wort/Wendung.
- Übernimm die Schreibweise möglichst exakt, aber ohne Zeilennummern, Aufzählungszeichen oder Seitenzahlen.
- Lass Überschriften, Beispielsätze und unleserliche Zeilen weg.
- Wenn du dir bei einer Zeile nicht sicher bist, lass sie lieber weg.
- Erfinde NICHTS dazu.`;

const PROMPT = `Lies alle Vokabelpaare (Deutsch/Englisch) aus diesem Foto.
Antworte AUSSCHLIESSLICH mit einem einzigen gültigen JSON-Objekt in einem \`\`\`json-Codeblock, kein Text davor oder danach:
{ "pairs": [ { "de": "Hund", "en": "dog" } ] }`;

function extractJson(text: string): string {
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Keine JSON-Struktur in der Antwort gefunden.");
  }
  return candidate.slice(start, end + 1);
}

// Extrahiert deutsch/englisch-Wortpaare aus einem Foto (Base64 ohne data:-Prefix).
export async function extractVocabFromImage(opts: {
  base64: string;
  mediaType: ImageMediaType;
}): Promise<{ prompt: string; answer: string }[]> {
  const msg = await getClient().messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: opts.mediaType, data: opts.base64 },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const parsed = ResultSchema.parse(JSON.parse(extractJson(text)));
  // Als {prompt: deutsch, answer: englisch} zurückgeben — passt zu importVocab.
  return parsed.pairs.map((p) => ({ prompt: p.de, answer: p.en }));
}
