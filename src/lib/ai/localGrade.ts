import type { Exercise, Grade } from "./schemas";

// Manche Aufgaben lassen sich ohne KI sofort bewerten (Multiple-Choice, Zahlen,
// exakte Treffer). Das spart den langsamen Claude-Code-Aufruf komplett.
// Gibt null zurück, wenn eine KI-Bewertung nötig ist (z.B. freier Text/Vorlesen).

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

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function parseNum(s: string): number | null {
  const cleaned = s.replace(/\s/g, "").replace(",", ".").replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function tryLocalGrade(exercise: Exercise, answer: string): Grade | null {
  const a = answer.trim();
  const sol = exercise.solution.trim();

  switch (exercise.inputMode) {
    case "choice": {
      const correct = norm(a) === norm(sol);
      return correct
        ? { isCorrect: true, score: 100, feedback: praise(a) }
        : {
            isCorrect: false,
            score: 0,
            feedback: "Nicht ganz.",
            correction: `Richtig ist: ${sol}`,
          };
    }
    case "number": {
      const na = parseNum(a);
      const ns = parseNum(sol);
      if (na === null || ns === null) return null; // ungewöhnliche Eingabe → KI
      const correct = Math.abs(na - ns) < 1e-6;
      return correct
        ? { isCorrect: true, score: 100, feedback: praise(a) }
        : {
            isCorrect: false,
            score: 0,
            feedback: "Nicht ganz.",
            correction: `Richtig ist: ${sol}`,
          };
    }
    case "fraction":
    case "text": {
      // Nur exakter Treffer wird lokal als richtig gewertet — sonst KI (die
      // kann Tippfehler/gleichwertige Formen wohlwollend beurteilen).
      if (norm(a) === norm(sol)) {
        return { isCorrect: true, score: 100, feedback: praise(a) };
      }
      return null;
    }
    default:
      return null; // reading etc. → KI
  }
}
