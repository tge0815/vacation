import { getSubject, getTopic, listTopics, recentAttempts, recentTopicPerformance } from "../db/repo";
import type { SubjectRow, TopicRow } from "../db/sqlite";
import { runAgentJson, DEFAULT_MODEL, REASONING_MODEL } from "./run";
import {
  ExerciseSchema,
  GradeSchema,
  ReadingGradeSchema,
  type Exercise,
  type Grade,
  type ReadingGrade,
} from "./schemas";
import {
  exerciseSystemPrompt,
  exercisePrompt,
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

export async function generateExercise(opts: {
  userId: number;
  subjectId: number;
  topicId?: number | null;
}): Promise<GeneratedExercise> {
  const subject = getSubject(opts.subjectId);
  if (!subject) throw new Error("Fach nicht gefunden");

  let topic: TopicRow | null = opts.topicId ? getTopic(opts.topicId) : null;
  if (!topic) {
    const topics = listTopics(opts.subjectId);
    if (topics.length === 0) throw new Error("Keine Themen für dieses Fach");
    // Deterministisch-genug ohne Math.random: nach Attempt-Zahl rotieren.
    const attemptsCount = recentAttempts({ userId: opts.userId, subjectId: opts.subjectId, limit: 1 })
      .length;
    topic = topics[(recentAttempts({ userId: opts.userId }).length + attemptsCount) % topics.length];
  }

  const difficulty = nextDifficulty(opts.userId, topic.id);
  const forceReading = topic.input_hint === "reading";

  const avoid = recentAttempts({ userId: opts.userId, subjectId: opts.subjectId, limit: 6 })
    .map((a) => {
      try {
        return (JSON.parse(a.exercise_json) as Exercise).question;
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const exercise = await runAgentJson({
    systemPrompt: exerciseSystemPrompt(),
    prompt: exercisePrompt({
      subject: subject.name,
      topic: topic.name,
      topicDescription: topic.description ?? "",
      difficulty,
      avoid,
      forceReading,
    }),
    schema: ExerciseSchema,
    model: DEFAULT_MODEL,
  });

  // Sicherheitsnetz: reading immer mit passage.
  if (forceReading) {
    exercise.inputMode = "reading";
    if (!exercise.passage) exercise.passage = exercise.question;
  }

  return { exercise, subject, topic, difficulty };
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
