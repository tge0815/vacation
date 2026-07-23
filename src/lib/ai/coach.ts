import { streamAgent } from "./agent";
import { DEFAULT_MODEL, REASONING_MODEL } from "./run";
import { PARENT_COACH_PROMPT } from "./prompts";
import {
  listUsers,
  listSubjects,
  statsSince,
  recentAttempts,
  currentStreak,
  getTopic,
} from "../db/repo";
import { localDateStr } from "../date";
import type { Exercise } from "./schemas";

function sinceDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateStr(d);
}

// Baut den Datenkontext für den Eltern-Coach aus der DB.
function buildContext(): string {
  const users = listUsers();
  const subjects = listSubjects();
  const subjName = new Map(subjects.map((s) => [s.id, s.name]));
  const since = sinceDaysAgo(14);

  const today = localDateStr();
  const lines: string[] = [`# Heute: ${today}`, "", "# Kinder & Lernstand (letzte 14 Tage)"];

  if (users.length === 0) lines.push("(noch keine Kinder angelegt)");

  for (const u of users) {
    const stats = statsSince(u.id, since);
    const streak = currentStreak(u.id);
    lines.push(`\n## ${u.name} (Klasse ${u.grade}) — Streak ${streak} Tage`);
    if (stats.length === 0) {
      lines.push("- noch keine Übungen");
      continue;
    }
    for (const st of stats) {
      const rate = st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
      lines.push(
        `- ${subjName.get(st.subjectId) ?? "?"}: ${st.minutes} min, ${st.attempts} Aufgaben, ${rate}% richtig`,
      );
    }
    // Letzte Aufgaben zur Einordnung.
    const recent = recentAttempts({ userId: u.id, limit: 6 });
    if (recent.length) {
      lines.push("  letzte Aufgaben:");
      for (const a of recent) {
        let q = "";
        const ok = a.is_correct ? "richtig" : "falsch";
        try {
          q = (JSON.parse(a.exercise_json) as Exercise).question.slice(0, 70);
        } catch {}
        const topic = a.topic_id ? getTopic(a.topic_id)?.name : undefined;
        lines.push(`  - [${a.date}] ${subjName.get(a.subject_id) ?? "?"}${topic ? "/" + topic : ""}: "${q}" → ${ok}`);
      }
    }
  }
  return lines.join("\n");
}

export type CoachEvent =
  | { kind: "delta"; text: string }
  | { kind: "done"; model?: string }
  | { kind: "error"; message: string };

export async function* streamParentCoach(opts: {
  userText: string;
  useReasoning?: boolean;
  history?: { role: "user" | "assistant"; content: string }[];
}): AsyncGenerator<CoachEvent> {
  const context = buildContext();
  const model = opts.useReasoning ? REASONING_MODEL : DEFAULT_MODEL;

  const historyBlock =
    opts.history && opts.history.length
      ? "# Bisheriger Chat:\n" +
        opts.history
          .slice(-8)
          .map((m) => `${m.role === "user" ? "Eltern" : "Coach"}: ${m.content}`)
          .join("\n") +
        "\n\n"
      : "";

  const prompt = `${historyBlock}# Neue Frage der Eltern:\n${opts.userText}`;
  const systemPrompt = `${PARENT_COACH_PROMPT}\n\n${context}`;

  let modelUsed: string | undefined;
  try {
    for await (const chunk of streamAgent({ prompt, systemPrompt, model })) {
      if (chunk.kind === "delta") yield { kind: "delta", text: chunk.text };
      else if (chunk.kind === "done") {
        modelUsed = chunk.model;
      } else if (chunk.kind === "error") {
        yield { kind: "error", message: chunk.message };
        return;
      }
    }
  } catch (e) {
    yield { kind: "error", message: e instanceof Error ? e.message : "Coach-Fehler" };
    return;
  }
  yield { kind: "done", model: modelUsed };
}
