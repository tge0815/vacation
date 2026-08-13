"use client";

import { LESSON_ORDER } from "./lessons";

// Nächste Lektion über die feste Reihenfolge aller Welten.
export function NextButton({ lessonKey, onOpen }: { lessonKey: string; onOpen: (k: string) => void }) {
  const idx = LESSON_ORDER.indexOf(lessonKey);
  const next = LESSON_ORDER[idx + 1];
  return (
    <div className="mt-3 flex justify-end">
      {next ? (
        <button
          onClick={() => onOpen(next)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 text-white px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Nächste Lektion →
        </button>
      ) : (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          🏆 Wahnsinn – du hast alle Welten geschafft!
        </span>
      )}
    </div>
  );
}

export function UnityBridge({ js, cs }: { js: string; cs: string }) {
  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
      <div className="bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-400">
        SO SIEHT DAS IN UNITY AUS (C#)
      </div>
      <div className="bg-neutral-950 p-4 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-emerald-400/80 mb-1">Hier (JavaScript)</div>
          <pre className="text-xs font-mono text-neutral-100 whitespace-pre-wrap">{js}</pre>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-sky-400/80 mb-1">Unity (C#)</div>
          <pre className="text-xs font-mono text-sky-100 whitespace-pre-wrap">{cs}</pre>
        </div>
      </div>
    </div>
  );
}
