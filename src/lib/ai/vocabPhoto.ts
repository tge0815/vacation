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
  // "fw" = Fremdwort (englisch oder französisch, je nach gewählter Sprache).
  fw: z.string().trim().min(1),
});
const ResultSchema = z.object({ pairs: z.array(PairSchema) });

type PhotoLang = { label: string; extraRules: string; example: string };

const LANGS: Record<"en" | "fr", PhotoLang> = {
  en: {
    label: "Englisch",
    extraRules: "",
    example: '{ "pairs": [ { "de": "Hund", "fw": "dog" } ] }',
  },
  fr: {
    label: "Französisch",
    extraRules: [
      "- Übernimm Akzente exakt (é è ê à ç ù î ï ô û œ) — sie gehören zur Schreibweise.",
      "- Nomen stehen im Buch meist mit Artikel (le/la/l'/les). Übernimm den Artikel mit.",
      "- Lautschrift in eckigen Klammern (z.B. [bɔ̃ʒuʀ]) gehört NICHT zur Vokabel — weglassen.",
      "- Grammatik-Kürzel wie m., f., pl., adj., adv., inv., fam. gehören NICHT zur Vokabel — weglassen.",
    ].join("\n"),
    example: '{ "pairs": [ { "de": "die Stadt", "fw": "la ville" } ] }',
  },
};

function systemPrompt(lang: PhotoLang): string {
  return `Du liest Vokabellisten aus einem Foto (z.B. eine Seite aus einem Schulbuch oder Vokabelheft).
- Erkenne die Wortpaare Deutsch ↔ ${lang.label}, egal welche Spalte links oder rechts steht.
- Gib "de" = deutsches Wort/Wendung, "fw" = ${lang.label.toLowerCase()}es Wort/Wendung.
- Übernimm die Schreibweise möglichst exakt, aber ohne Zeilennummern, Aufzählungszeichen oder Seitenzahlen.
- Lass Überschriften, Beispielsätze und unleserliche Zeilen weg.
- Wenn du dir bei einer Zeile nicht sicher bist, lass sie lieber weg.
- Erfinde NICHTS dazu.${lang.extraRules ? "\n" + lang.extraRules : ""}`;
}

function userPrompt(lang: PhotoLang): string {
  return `Lies alle Vokabelpaare (Deutsch/${lang.label}) aus diesem Foto.
Antworte AUSSCHLIESSLICH mit einem einzigen gültigen JSON-Objekt in einem \`\`\`json-Codeblock, kein Text davor oder danach:
${lang.example}`;
}

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

// Extrahiert Wortpaare Deutsch↔Fremdsprache aus einem Foto (Base64 ohne data:-Prefix).
export async function extractVocabFromImage(opts: {
  base64: string;
  mediaType: ImageMediaType;
  lang?: "en" | "fr";
}): Promise<{ prompt: string; answer: string }[]> {
  const lang = LANGS[opts.lang ?? "en"];
  const msg = await getClient().messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: systemPrompt(lang),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: opts.mediaType, data: opts.base64 },
          },
          { type: "text", text: userPrompt(lang) },
        ],
      },
    ],
  });

  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const parsed = ResultSchema.parse(JSON.parse(extractJson(text)));
  // Als {prompt: deutsch, answer: fremdsprache} zurückgeben — passt zu importVocab.
  return parsed.pairs.map((p) => ({ prompt: p.de, answer: p.fw }));
}
