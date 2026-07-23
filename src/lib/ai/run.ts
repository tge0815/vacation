import { z } from "zod";
import { streamAgent } from "./agent";

// Standard: schnelles Haiku für Aufgaben-Generierung, einfache Bewertung und
// Vorlesen. Reasoning: Sonnet für Textaufgaben/Maßstab und den Eltern-Coach.
export const DEFAULT_MODEL = process.env.LEARN_AGENT_DEFAULT_MODEL ?? "claude-haiku-4-5-20251001";
export const REASONING_MODEL = process.env.LEARN_AGENT_REASONING_MODEL ?? "claude-sonnet-4-6";

export function modelLabel(id: string): string {
  if (id.includes("haiku")) return "Haiku";
  if (id.includes("sonnet")) return "Sonnet";
  if (id.includes("opus")) return "Opus";
  return "KI";
}

// Sammelt die komplette Agent-Antwort als Text ein.
export async function runAgentText(opts: {
  prompt: string;
  systemPrompt: string;
  model?: string;
  label?: string;
}): Promise<string> {
  const requested = opts.model ?? DEFAULT_MODEL;
  let text = "";
  let usedModel: string | undefined;
  for await (const chunk of streamAgent({
    prompt: opts.prompt,
    systemPrompt: opts.systemPrompt,
    model: requested,
  })) {
    if (chunk.kind === "delta") text += chunk.text;
    else if (chunk.kind === "done") usedModel = chunk.model;
    else if (chunk.kind === "error") throw new Error(chunk.message);
  }
  // Nachweis, welches Modell wirklich geantwortet hat (z.B. um Haiku zu prüfen).
  console.log(
    `[lern-ai]${opts.label ? " " + opts.label : ""} angefragt=${requested} · verwendet=${usedModel ?? "?"}`,
  );
  return text.trim();
}

// Extrahiert das erste JSON-Objekt aus einer (evtl. mit ```json umrahmten) Antwort.
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

// Fordert strukturiertes JSON an und validiert es mit einem zod-Schema.
// Ein Retry mit verschärfter Anweisung bei Parse-/Validierungsfehler.
export async function runAgentJson<T>(opts: {
  prompt: string;
  systemPrompt: string;
  schema: z.ZodType<T>;
  model?: string;
  label?: string;
}): Promise<T> {
  const jsonHint =
    "\n\nAntworte AUSSCHLIESSLICH mit einem einzigen gültigen JSON-Objekt in einem ```json-Codeblock. Kein Text davor oder danach.";

  const attempt = async (extra: string): Promise<T> => {
    const raw = await runAgentText({
      prompt: opts.prompt + extra,
      systemPrompt: opts.systemPrompt,
      model: opts.model,
      label: opts.label,
    });
    const parsed = JSON.parse(extractJson(raw));
    return opts.schema.parse(parsed);
  };

  try {
    return await attempt(jsonHint);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return await attempt(
      `${jsonHint}\n\nDein vorheriger Versuch war ungültig (${reason}). Halte dich EXAKT an das geforderte JSON-Schema.`,
    );
  }
}
