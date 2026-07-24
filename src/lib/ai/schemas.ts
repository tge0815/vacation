import { z } from "zod";

export const INPUT_MODES = ["text", "choice", "number", "fraction", "reading", "gaps"] as const;
export type InputMode = (typeof INPUT_MODES)[number];

// Eine generierte Aufgabe. `solution`/`solutionExplanation` werden dem Kind
// erst nach dem Abschicken gezeigt.
export const ExerciseSchema = z.object({
  inputMode: z.enum(INPUT_MODES),
  instruction: z.string().min(1),
  question: z.string().min(1),
  choices: z.array(z.string()).optional(),
  passage: z.string().optional(),
  // Bei inputMode "gaps": eine Lösung pro Lücke (Reihenfolge = Reihenfolge der ___).
  blanks: z.array(z.string()).optional(),
  solution: z.string().min(1),
  // Weitere gültige Antworten (Synonyme, alternative Formen/Schreibweisen),
  // damit die Bewertung lokal und sofort passieren kann.
  acceptable: z.array(z.string()).optional(),
  solutionExplanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// Mehrere Aufgaben in einem einzigen KI-Aufruf (spart Subprozess-Overhead).
export const ExerciseBatchSchema = z.object({
  exercises: z.array(ExerciseSchema).min(1),
});

// Bewertung einer Kind-Antwort.
export const GradeSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(1),
  correction: z.string().optional(),
});
export type Grade = z.infer<typeof GradeSchema>;

// Bewertung des Vorlesens (Zieltext vs. Transkript).
export const ReadingGradeSchema = z.object({
  accuracyPct: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(1),
  missedWords: z.array(z.string()).optional(),
});
export type ReadingGrade = z.infer<typeof ReadingGradeSchema>;
