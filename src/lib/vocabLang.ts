// Welche Sprache liegt in welchem Lernbereich?
//
// Die Trennung der Vokabelhefte läuft komplett über subject_id: dueVocab() und
// recordVocab() arbeiten immer innerhalb eines Fachs, deshalb vermischen sich
// englische und französische Vokabeln nie — ohne zusätzliche Spalte.
//
// Englisch liegt historisch im eigenen Lernbereich "Vokabeln" (Migration 019),
// Französisch im Fach "Französisch" (Migration 034).

import { listSubjects } from "@/lib/db/repo";
import { englishVocabPairs } from "@/data/englishVocab";
import { frenchVocabPairs } from "@/data/frenchVocab";

export const VOCAB_LANGS = ["en", "fr"] as const;
export type VocabLang = (typeof VOCAB_LANGS)[number];

type LangConfig = {
  /** Fach (subjects.key), in dem das Vokabelheft dieser Sprache liegt. */
  subjectKey: string;
  /** Anzeigename der Sprache. */
  label: string;
  /** Wie im Training gezeigt: "Deutsch↔Englisch". */
  pairLabel: string;
  /** Statische Buch-Vokabeln zum Importieren. */
  pairs: () => { prompt: string; answer: string }[];
};

const CONFIG: Record<VocabLang, LangConfig> = {
  en: {
    subjectKey: "vokabeln",
    label: "Englisch",
    pairLabel: "Deutsch↔Englisch",
    pairs: englishVocabPairs,
  },
  fr: {
    subjectKey: "franzoesisch",
    label: "Französisch",
    pairLabel: "Deutsch↔Französisch",
    pairs: frenchVocabPairs,
  },
};

export function isVocabLang(v: unknown): v is VocabLang {
  return typeof v === "string" && (VOCAB_LANGS as readonly string[]).includes(v);
}

/** Sprache aus einem Request-Wert lesen; ohne Angabe bleibt es bei Englisch. */
export function parseLang(v: unknown): VocabLang {
  return isVocabLang(v) ? v : "en";
}

export function langConfig(lang: VocabLang): LangConfig {
  return CONFIG[lang];
}

/** Lernbereich zu einer Sprache. null, wenn das Fach (noch) nicht existiert. */
export function langSubject(lang: VocabLang): { id: number; name: string } | null {
  const key = CONFIG[lang].subjectKey;
  const s = listSubjects(true).find((x) => x.key === key);
  return s ? { id: s.id, name: s.name } : null;
}

/** Sprache zu einem Fach — für die Anzeige im Eltern-Bereich. */
export function langOfSubjectKey(subjectKey: string): VocabLang | null {
  for (const lang of VOCAB_LANGS) {
    if (CONFIG[lang].subjectKey === subjectKey) return lang;
  }
  return null;
}
