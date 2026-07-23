"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; pending?: boolean };

const SUGGESTIONS = [
  "Wie war die Woche insgesamt?",
  "Welches Fach sollte mehr geübt werden?",
  "Wer hat die längste Serie?",
];

export function ParentCoach() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (streaming || !text.trim()) return;
    setError(null);
    setStreaming(true);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: Msg = { role: "user", content: text };
    const asst: Msg = { role: "assistant", content: "", pending: true };
    setMessages((p) => [...p, userMsg, asst]);
    setInput("");

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, useReasoning, history }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let sep: number;
        while ((sep = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          if (!block.startsWith("data:")) continue;
          const payload = block.slice(5).trim();
          try {
            const ev = JSON.parse(payload) as
              | { kind: "delta"; text: string }
              | { kind: "done" }
              | { kind: "error"; message: string };
            if (ev.kind === "delta") {
              const t = ev.text;
              setMessages((p) =>
                p.map((m, i) => (i === p.length - 1 ? { ...m, content: m.content + t, pending: true } : m)),
              );
            } else if (ev.kind === "done") {
              setMessages((p) =>
                p.map((m, i) => (i === p.length - 1 ? { ...m, pending: false } : m)),
              );
            } else if (ev.kind === "error") {
              throw new Error(ev.message);
            }
          } catch (e) {
            if (e instanceof Error && e.message) throw e;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setMessages((p) => p.filter((m) => !(m.role === "assistant" && m.pending)));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] flex flex-col h-[70vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-violet-500" />
          <span className="font-semibold">Lern-Coach</span>
        </div>
        <button
          onClick={() => setUseReasoning((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            useReasoning
              ? "bg-violet-500/10 text-violet-600 border-violet-500/30"
              : "border-neutral-200 dark:border-neutral-700 text-neutral-500"
          }`}
        >
          <Sparkles size={12} /> {useReasoning ? "Opus" : "Sonnet"}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 py-8">
            <p className="mb-3">Frag mich zum Lernfortschritt deiner Kinder.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap text-sm ${
                m.role === "user"
                  ? "bg-sky-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {m.content || (m.pending ? <Loader2 className="animate-spin" size={16} /> : "")}
            </div>
          </div>
        ))}
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 p-3 border-t border-black/[0.06] dark:border-white/[0.06]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frage stellen…"
          className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 text-white px-4 disabled:opacity-40 hover:opacity-90"
        >
          {streaming ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
