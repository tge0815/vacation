"use client";

import { useState } from "react";
import { Delete, X } from "lucide-react";

type Props = {
  title: string;
  onSubmit: (pin: string) => void;
  onCancel?: () => void;
  error?: string | null;
  length?: number;
};

// Kindgerechtes Zahlenfeld für die PIN-Eingabe.
export function PinPad({ title, onSubmit, onCancel, error, length = 4 }: Props) {
  const [pin, setPin] = useState("");

  function press(d: string) {
    if (pin.length >= length) return;
    const next = pin + d;
    setPin(next);
    if (next.length === length) {
      // kurz anzeigen, dann abschicken
      setTimeout(() => {
        onSubmit(next);
        setPin("");
      }, 150);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl animate-pop">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onCancel && (
            <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600">
              <X size={22} />
            </button>
          )}
        </div>

        <div className="flex justify-center gap-3 mb-2">
          {Array.from({ length }).map((_, i) => (
            <div
              key={i}
              className={`size-4 rounded-full ${
                i < pin.length ? "bg-sky-500" : "bg-neutral-200 dark:bg-neutral-700"
              }`}
            />
          ))}
        </div>
        <p className="h-5 text-center text-sm text-rose-500">{error ?? ""}</p>

        <div className="grid grid-cols-3 gap-3 mt-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-2xl font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            className="h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-2xl font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition"
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
