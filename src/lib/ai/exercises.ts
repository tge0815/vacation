import { getSubject, getTopic, listTopics, recentAttempts, recentTopicPerformance } from "../db/repo";
import type { SubjectRow, TopicRow } from "../db/sqlite";
import { runAgentJson, DEFAULT_MODEL, REASONING_MODEL } from "./run";
import {
  ExerciseBatchSchema,
  GradeSchema,
  ReadingGradeSchema,
  type Exercise,
  type Grade,
  type ReadingGrade,
} from "./schemas";
import {
  exerciseBatchSystemPrompt,
  exerciseBatchPrompt,
  gradeSystemPrompt,
  gradePrompt,
  readingSystemPrompt,
  readingPrompt,
} from "./prompts";

export type GeneratedExercise = {
  exercise: Exercise;
  subject: SubjectRow;
  topic: TopicRow;
  difficulty: number;
};

// Adaptive Schwierigkeit aus der jüngsten Performance des Kindes im Thema.
function nextDifficulty(userId: number, topicId: number): number {
  const perf = recentTopicPerformance(userId, topicId);
  let d = perf.lastDifficulty || 2;
  if (perf.attempts >= 3) {
    const rate = perf.correct / perf.attempts;
    if (rate >= 0.8) d += 1;
    else if (rate <= 0.4) d -= 1;
  }
  return Math.min(5, Math.max(1, d));
}

// Mehrere Aufgaben in EINEM KI-Aufruf erzeugen (spart Subprozess-Overhead pro
// Aufgabe). Themen werden über die aktiven Themen des Fachs verteilt.
export async function generateBatch(opts: {
  userId: number;
  subjectId: number;
  topicId?: number | null;
  count: number;
}): Promise<GeneratedExercise[]> {
  const subject = getSubject(opts.subjectId);
  if (!subject) throw new Error("Fach nicht gefunden");

  const count = Math.max(1, Math.min(8, opts.count));

  // Themen für die Aufgaben bestimmen (fixes Thema oder rotierend verteilt).
  let chosen: TopicRow[];
  if (opts.topicId) {
    const t = getTopic(opts.topicId);
    if (!t) throw new Error("Thema nicht gefunden");
    chosen = Array.from({ length: count }, () => t);
  } else {
    const topics = listTopics(opts.subjectId);
    if (topics.length === 0) throw new Error("Keine Themen für dieses Fach");
    const offset = recentAttempts({ userId: opts.userId }).length;
    chosen = Array.from({ length: count }, (_, i) => topics[(offset + i) % topics.length]);
  }

  const items = chosen.map((t) => ({
    topic: t,
    difficulty: nextDifficulty(opts.userId, t.id),
    forceReading: t.input_hint === "reading",
  }));

  const avoid = recentAttempts({ userId: opts.userId, subjectId: opts.subjectId, limit: 8 })
    .map((a) => {
      try {
        return (JSON.parse(a.exercise_json) as Exercise).question;
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const result = await runAgentJson({
    systemPrompt: exerciseBatchSystemPrompt(),
    prompt: exerciseBatchPrompt({
      subject: subject.name,
      items: items.map((it) => ({
        topic: it.topic.name,
        topicDescription: it.topic.description ?? "",
        difficulty: it.difficulty,
        forceReading: it.forceReading,
      })),
      avoid,
    }),
    schema: ExerciseBatchSchema,
    model: DEFAULT_MODEL,
  });

  // Ergebnisse mit den vorgegebenen Themen zusammenführen (nur so viele wie geliefert).
  return result.exercises.slice(0, items.length).map((exercise, i) => {
    const { topic, difficulty, forceReading } = items[i];
    if (forceReading) {
      exercise.inputMode = "reading";
      if (!exercise.passage) exercise.passage = exercise.question;
    }
    return { exercise, subject, topic, difficulty };
  });
}

export async function gradeExercise(opts: {
  subjectKey: string;
  topicKey?: string;
  exercise: Exercise;
  answer: string;
}): Promise<Grade> {
  // Textaufgaben brauchen mehr Schluss-Folgern → Reasoning-Modell.
  const useReasoning =
    opts.subjectKey === "mathe" &&
    (opts.topicKey === "textaufgaben" || opts.topicKey === "massstab");
  return runAgentJson({
    systemPrompt: gradeSystemPrompt(),
    prompt: gradePrompt({
      instruction: opts.exercise.instruction,
      question: opts.exercise.question,
      solution: opts.exercise.solution,
      solutionExplanation: opts.exercise.solutionExplanation,
      answer: opts.answer,
    }),
    schema: GradeSchema,
    model: useReasoning ? REASONING_MODEL : DEFAULT_MODEL,
  });
}

export async function evaluateReading(opts: {
  passage: string;
  transcript: string;
}): Promise<ReadingGrade> {
  return runAgentJson({
    systemPrompt: readingSystemPrompt(),
    prompt: readingPrompt({ passage: opts.passage, transcript: opts.transcript }),
    schema: ReadingGradeSchema,
    model: DEFAULT_MODEL,
  });
}
