"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import type { PublicUser } from "@/lib/serialize";
import { Memory } from "./Memory";
import { Snake } from "./Snake";
import { Game2048 } from "./Game2048";

type GameKey = "memory" | "snake" | "2048";

const GAMES: { key: GameKey; name: string; emoji: string; desc: string; unit: string; lower?: boolean }[] = [
  { key: "memory", name: "Memory", emoji: "🃏", desc: "Finde die Pärchen", unit: "Züge", lower: true },
  { key: "snake", name: "Snake", emoji: "🐍", desc: "Friss und wachse", unit: "Punkte" },
  { key: "2048", name: "2048", emoji: "🔢", desc: "Zahlen zusammenschieben", unit: "Punkte" },
];

export function GamesHub({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [selected, setSelected] = useState<GameKey | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d: { user: PublicUser }) => setUser(d.user))
      .catch(() => {});
    fetch(`/api/games/score?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { scores: Record<string, number> }) => setScores(d.scores ?? {}))
      .catch(() => {});
  }, [userId]);

  const setBest = (game: GameKey, best: number) => setScores((s) => ({ ...s, [game]: best }));

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center text-neutral-400">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  const unlocked = user.coins > 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => (selected ? setSelected(null) : router.push(`/kind/${userId}`))}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> {selected ? "Spiele" : "Zurück"}
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
          <span className="text-base leading-none">🪙</span> {user.coins}
        </span>
      </header>

      {!unlocked ? (
        <div className="flex flex-col items-center text-center gap-4 py-16">
          <div className="size-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Lock size={32} className="text-neutral-400" />
          </div>
          <h1 className="text-xl font-bold">Noch gesperrt</h1>
          <p className="text-neutral-500 max-w-xs">
            Schaff heute erst dein Tagesziel — dafür gibt es einen Coin, und dann kannst du hier
            spielen!
          </p>
          <button
            onClick={() => router.push(`/kind/${userId}`)}
            className="rounded-xl bg-sky-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
          >
            Zum Üben
          </button>
        </div>
      ) : selected === "memory" ? (
        <Memory userId={userId} best={scores.memory} onBest={(b) => setBest("memory", b)} />
      ) : selected === "snake" ? (
        <Snake userId={userId} best={scores.snake} onBest={(b) => setBest("snake", b)} />
      ) : selected === "2048" ? (
        <Game2048 userId={userId} best={scores["2048"]} onBest={(b) => setBest("2048", b)} />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1">Spiele</h1>
          <p className="text-neutral-500 mb-6">Such dir ein Spiel aus. Viel Spaß, {user.name}!</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GAMES.map((g) => {
              const best = scores[g.key];
              return (
                <button
                  key={g.key}
                  onClick={() => setSelected(g.key)}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <span className="text-5xl">{g.emoji}</span>
                  <span className="font-semibold text-lg">{g.name}</span>
                  <span className="text-xs text-neutral-500">{g.desc}</span>
                  {best != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                      🏆 {best} {g.unit}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
