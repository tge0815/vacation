import type { Exercise, Grade } from "./schemas";

// Getippte Antworten (Multiple-Choice, Zahlen, Text, Brüche) werden lokal und
// sofort bewertet — kein langsamer KI-Aufruf. Möglich ist das, weil die KI beim
// Generieren bereits "solution" + "acceptable" (gültige Alternativen) mitliefert.
// Nur Vorlesen (reading) braucht weiterhin die KI (eigener Endpunkt).

const PRAISE = [
  "Richtig! Super gemacht.",
  "Genau richtig! Weiter so.",
  "Stimmt! Klasse.",
  "Perfekt gelöst!",
  "Richtig! Das sitzt.",
];

function praise(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % PRAISE.length;
  return PRAISE[h];
}

function norm(s: string, caseSensitive = false): string {
  const t = s
    .trim()
    .replace(/\s+/g, " ")
    // Typografische Apostrophe/Akzentzeichen auf den geraden Apostroph
    // vereinheitlichen: Tablet-Tastaturen liefern oft ’ statt ', und
    // "j'aime" darf nicht daran scheitern.
    .replace(/[\u2018\u2019\u02bc\u00b4`]/g, "'")
    .replace(/[.!?,;:]+$/, "");
  return caseSensitive ? t : t.toLowerCase();
}

// Akzente entfernen: "élève" → "eleve". Für Französisch werten wir eine
// Antwort ohne Akzente als richtig — auf Tastatur und Tablet sind sie mühsam
// und ein fehlender Accent aigu ist kein Vokabelfehler. Die richtige
// Schreibweise wird aber als Hinweis mitgegeben, damit sie sich einprägt.
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseNum(s: string): number | null {
  const cleaned = s.replace(/\s/g, "").replace(",", ".").replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function wrong(exercise: Exercise): Grade {
  const expl = exercise.solutionExplanation ? ` ${exercise.solutionExplanation}` : "";
  return {
    isCorrect: false,
    score: 0,
    feedback: "Nicht ganz.",
    correction: `Richtig ist: ${exercise.solution}.${expl}`,
  };
}

// caseSensitive=true (Deutsch): Groß-/Kleinschreibung zählt.
// accentTolerant=true (Französisch): fehlende Akzente sind kein Fehler.
export function tryLocalGrade(
  exercise: Exercise,
  answer: string,
  caseSensitive = false,
  accentTolerant = false,
): Grade | null {
  if (exercise.inputMode === "reading") return null; // Vorlesen → KI

  const a = answer.trim();

  // Zahlen numerisch vergleichen (42 == 42,0).
  if (exercise.inputMode === "number") {
    const na = parseNum(a);
    const ns = parseNum(exercise.solution);
    const alts = (exercise.acceptable ?? []).map(parseNum).filter((x): x is number => x !== null);
    if (na !== null && ns !== null) {
      const ok = [ns, ...alts].some((v) => Math.abs(na - v) < 1e-6);
      return ok ? { isCorrect: true, score: 100, feedback: praise(a) } : wrong(exercise);
    }
    // Unparsbare Eingabe → trotzdem als falsch werten (kein KI-Umweg).
    return wrong(exercise);
  }

  // choice / text / fraction: gegen solution + acceptable (normalisiert) prüfen.
  const solutions = [exercise.solution, ...(exercise.acceptable ?? [])];
  const accepted = new Set(solutions.map((s) => norm(s, caseSensitive)));
  if (accepted.has(norm(a, caseSensitive))) {
    return { isCorrect: true, score: 100, feedback: praise(a) };
  }

  // Französisch: gleiche Antwort, nur ohne Akzente → richtig, mit Hinweis auf
  // die korrekte Schreibweise.
  if (accentTolerant) {
    const key = stripAccents(norm(a, caseSensitive));
    const hit = solutions.find((s) => stripAccents(norm(s, caseSensitive)) === key);
    if (hit) {
      return {
        isCorrect: true,
        score: 100,
        feedback: praise(a),
        correction: `Richtig! Mit Akzent schreibt man: ${hit}`,
      };
    }
  }

  return wrong(exercise);
}
