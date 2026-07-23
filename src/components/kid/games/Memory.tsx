"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const POOL = ["🦊", "🐼", "🦁", "🐯", "🐸", "🐙", "🦄", "🐝", "🐬", "🦉", "🐰", "🐢"];
const PAIRS = 6;

type Card = { id: number; emoji: string; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Memory() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); // Indizes der offenen Karten
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const newGame = useCallback(() => {
    const chosen = shuffle(POOL).slice(0, PAIRS);
    const deck = shuffle([...chosen, ...chosen]).map((emoji, id) => ({ id, emoji, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setLocked(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(newGame, 0);
    return () => {
      clearTimeout(t);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [newGame]);

  function clickCard(i: number) {
    if (locked || flipped.includes(i) || cards[i]?.matched) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        setCards((prev) => prev.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)));
        setFlipped([]);
      } else {
        setLocked(true);
        timer.current = setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  }

  const won = cards.length > 0 && cards.every((c) => c.matched);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">Züge: {moves}</span>
        <button
          onClick={newGame}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600"
        >
          <RotateCcw size={15} /> Neu
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm">
        {cards.map((card, i) => {
          const open = flipped.includes(i) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => clickCard(i)}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition ${
                open
                  ? card.matched
                    ? "bg-emerald-500/15"
                    : "bg-sky-500/15"
                  : "bg-sky-500 hover:bg-sky-600"
              }`}
            >
              <span className={open ? "" : "opacity-0"}>{card.emoji}</span>
            </button>
          );
        })}
      </div>

      {won && (
        <div className="text-center animate-pop">
          <p className="text-lg font-bold">Geschafft in {moves} Zügen! 🎉</p>
          <button
            onClick={newGame}
            className="mt-2 rounded-xl bg-emerald-500 text-white px-5 py-2 font-semibold hover:opacity-90"
          >
            Nochmal
          </button>
        </div>
      )}
    </div>
  );
}
