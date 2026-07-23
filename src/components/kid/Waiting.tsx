"use client";

import { useEffect, useState } from "react";
import { Loader2, Layers } from "lucide-react";

const MESSAGES = [
  "Ich denke mir eine gute Aufgabe aus…",
  "Gleich geht's los…",
  "Noch einen kleinen Moment…",
  "Fast fertig…",
];

// Freundlicher Ladebildschirm mit wechselnden Sprüchen und einem Balken, der
// langsam vorrückt (die echte Dauer ist unbekannt, aber es fühlt sich lebendig
// an statt „eingefroren").
export function LoadingView({ colorBg = "bg-sky-500" }: { colorBg?: string }) {
  const [pct, setPct] = useState(8);
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const bar = setInterval(() => {
      // nähert sich sanft 95 % und bleibt dort, bis die Aufgabe wirklich da ist
      setPct((p) => (p < 95 ? p + Math.max(0.8, (95 - p) * 0.07) : p));
    }, 300);
    const rot = setInterval(() => setMsg((i) => (i + 1) % MESSAGES.length), 2500);
    return () => {
      clearInterval(bar);
      clearInterval(rot);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6">
      <div className="text-5xl animate-wiggle" aria-hidden>
        ✏️
      </div>
      <p className="text-neutral-600 dark:text-neutral-300 font-medium">{MESSAGES[msg]}</p>
      <div className="w-full max-w-xs h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorBg} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Kleine Vorrats-Anzeige: wie viele Aufgaben liegen schon bereit, lädt gerade
// im Hintergrund noch etwas nach?
export function QueueIndicator({ count, loading }: { count: number; loading: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
      <Layers size={13} />
      <span>Vorrat</span>
      <span className="nums font-semibold text-emerald-500">{count}</span>
      {loading && <Loader2 className="animate-spin" size={12} />}
    </div>
  );
}
