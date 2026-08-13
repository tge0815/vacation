"use client";

import { useEffect, useState } from "react";
import { Lightbulb, KeyRound } from "lucide-react";

// Gestufte Hilfe: erst Erklärung, dann Tipps EINZELN einblenden, die Lösung
// nur als letzter Ausweg über einen eigenen Knopf (mit Nachfrage).
export function HelpPanel({
  lessonKey,
  hints,
  solution,
  onUseSolution,
}: {
  lessonKey: string;
  hints: string[];
  solution: string;
  onUseSolution: () => void;
}) {
  const [shown, setShown] = useState(0);

  // Bei Lektionswechsel zurücksetzen.
  useEffect(() => setShown(0), [lessonKey]);

  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-900/50 p-4">
      <div className="flex items-center gap-2 font-semibold text-sm mb-1">
        <Lightbulb size={16} className="text-amber-500" /> Brauchst du Hilfe?
      </div>
      {shown === 0 ? (
        <p className="text-sm text-neutral-500">
          Versuch es erst selbst! Wenn du nicht weiterkommst, hol dir Tipp für Tipp.
        </p>
      ) : (
        <ol className="mt-1 space-y-1.5">
          {hints.slice(0, shown).map((h, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="shrink-0 font-bold text-amber-500">Tipp {i + 1}:</span>
              <span className="text-neutral-700 dark:text-neutral-300">{h}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {shown < hints.length && (
          <button
            onClick={() => setShown((s) => s + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-sm font-semibold hover:bg-amber-500/20"
          >
            <Lightbulb size={14} /> {shown === 0 ? "Tipp anzeigen" : "Nächster Tipp"}
          </button>
        )}
        {shown >= hints.length && (
          <button
            onClick={() => {
              if (confirm("Willst du die Lösung wirklich sehen? Probieren macht schlauer! 🦊")) {
                onUseSolution();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <KeyRound size={14} /> Lösung zeigen
          </button>
        )}
      </div>
    </div>
  );
}

// Erklär-Kasten oben in jeder Lektion.
export function ExplainBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-4 mb-4">
      <div className="text-xs font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-1">
        💡 Neu gelernt
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line">{text}</p>
    </div>
  );
}
