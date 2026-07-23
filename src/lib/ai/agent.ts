import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export type AgentChunk =
  | { kind: "delta"; text: string }
  | { kind: "done"; tokensIn: number; tokensOut: number; model?: string }
  | { kind: "error"; message: string };

// Streamt eine Antwort vom Claude Agent SDK (Max-Plan-Auth via Claude Code).
// Kein API-Key nötig. Kein Tool-Zugriff (reine Textgenerierung).
export async function* streamAgent(opts: {
  prompt: string;
  systemPrompt: string;
  model: string;
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
  armTimer();

  const q = query({
    prompt: opts.prompt,
    options: {
      systemPrompt: opts.systemPrompt,
      model: opts.model,
      maxTurns: 1,
      allowedTools: [],
      includePartialMessages: true,
      abortController: ctrl,
    },
  });

  let streamedText = "";
  let finalText = "";
  let tokensIn = 0;
  let tokensOut = 0;
  let modelUsed: string | undefined;

  try {
    for await (const m of q as AsyncIterable<SDKMessage>) {
      armTimer();
      if (m.type === "stream_event") {
        const ev = m.event;
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          const t = ev.delta.text;
          streamedText += t;
          yield { kind: "delta", text: t };
        }
      } else if (m.type === "assistant") {
        const blocks = (m.message?.content ?? []) as { type: string; text?: string }[];
        finalText = blocks
          .filter((b) => b.type === "text" && typeof b.text === "string")
          .map((b) => b.text as string)
          .join("");
        if (!streamedText && finalText) {
          yield { kind: "delta", text: finalText };
          streamedText = finalText;
        }
        modelUsed = m.message?.model;
        if (m.message?.usage) {
          tokensIn = m.message.usage.input_tokens ?? tokensIn;
          tokensOut = m.message.usage.output_tokens ?? tokensOut;
        }
        if (m.error) {
          yield {
            kind: "error",
            message: `Agent-SDK-Fehler: ${m.error}. Prüfe ob Claude Code authentifiziert ist (claude login).`,
          };
          return;
        }
      } else if (m.type === "result") {
        if (m.subtype === "error_max_turns" || m.subtype === "error_during_execution") {
          yield { kind: "error", message: `Agent-SDK abgebrochen: ${m.subtype}` };
          return;
        }
        yield { kind: "done", tokensIn, tokensOut, model: modelUsed };
        return;
      }
    }
  } catch (e) {
    if (timedOut) {
      yield {
        kind: "error",
        message: `Die KI hat ${Math.round(inactivityMs / 1000)} s nicht geantwortet. Mögliche Ursachen: Subscription-Limit, hängender Claude-Code-Subprozess oder Netzwerk. Nochmal versuchen.`,
      };
      return;
    }
    const msg = e instanceof Error ? e.message : "Agent-SDK-Fehler";
    yield { kind: "error", message: msg };
  } finally {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }
}
