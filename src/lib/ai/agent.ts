import Anthropic from "@anthropic-ai/sdk";

export type AgentChunk =
  | { kind: "delta"; text: string }
  | { kind: "done"; tokensIn: number; tokensOut: number; model?: string }
  | { kind: "error"; message: string };

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    // Liest ANTHROPIC_API_KEY aus der Umgebung (docker-compose / .env).
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY ist nicht gesetzt. Trage den API-Key in .env ein (siehe .env.example) und starte den Container neu.",
      );
    }
    client = new Anthropic();
  }
  return client;
}

// Streamt eine Textantwort über die Anthropic-API (API-Key, kein Max-Plan mehr).
// Reine Textgenerierung, keine Tools.
export async function* streamAgent(opts: {
  prompt: string;
  systemPrompt: string;
  model: string;
  maxTokens?: number;
  abortController?: AbortController;
  /** Max. ms Inaktivität (kein Event), bevor abgebrochen wird. Default 120s. */
  inactivityTimeoutMs?: number;
}): AsyncGenerator<AgentChunk> {
  const inactivityMs = opts.inactivityTimeoutMs ?? 120_000;
  const ctrl = opts.abortController ?? new AbortController();
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  let timedOut = false;
  const armTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, inactivityMs);
  };

  let stream: ReturnType<Anthropic["messages"]["stream"]>;
  try {
    stream = getClient().messages.stream(
      {
        model: opts.model,
        max_tokens: opts.maxTokens ?? 8192,
        system: opts.systemPrompt,
        messages: [{ role: "user", content: opts.prompt }],
      },
      { signal: ctrl.signal },
    );
  } catch (e) {
    yield { kind: "error", message: e instanceof Error ? e.message : "KI-Fehler" };
    return;
  }

  armTimer();
  let tokensIn = 0;
  let tokensOut = 0;
  let modelUsed: string | undefined;

  try {
    for await (const event of stream) {
      armTimer();
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield { kind: "delta", text: event.delta.text };
      }
    }
    const final = await stream.finalMessage();
    modelUsed = final.model;
    tokensIn = final.usage.input_tokens ?? 0;
    tokensOut = final.usage.output_tokens ?? 0;
    yield { kind: "done", tokensIn, tokensOut, model: modelUsed };
  } catch (e) {
    if (timedOut) {
      yield {
        kind: "error",
        message: `Die KI hat ${Math.round(inactivityMs / 1000)} s nicht geantwortet. Nochmal versuchen.`,
      };
      return;
    }
    const msg = e instanceof Error ? e.message : "KI-Fehler";
    yield { kind: "error", message: msg };
  } finally {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }
}
