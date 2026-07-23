"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { PublicUser } from "@/lib/serialize";
import { Balloons } from "./Balloons";
import { ConnectFour } from "./ConnectFour";
import { JumpRunner } from "./JumpRunner";
import { Breakout } from "./Breakout";
import { Memory } from "./Memory";
import { Snake } from "./Snake";
import { Game2048 } from "./Game2048";

type GameKey = "balloons" | "connect4" | "jump" | "breakout" | "memory" | "snake" | "2048";

const GAMES: { key: GameKey; name: string; emoji: string; desc: string; unit: string }[] = [
  { key: "balloons", name: "Ballons", emoji: "🎈", desc: "Tippe die Ballons", unit: "Treffer" },
  { key: "connect4", name: "Vier gewinnt", emoji: "🔴", desc: "Gegen den Computer", unit: "Siege" },
  { key: "jump", name: "Jump", emoji: "🐥", desc: "Flieg durch die Röhren", unit: "Punkte" },
  { key: "breakout", name: "Breakout", emoji: "🧱", desc: "Ball & Schläger", unit: "Punkte" },
  { key: "memory", name: "Memory", emoji: "🃏", desc: "Finde die Pärchen", unit: "Züge" },
  { key: "snake", name: "Snake", emoji: "🐍", desc: "Friss und wachse", unit: "Punkte" },
  { key: "2048", name: "2048", emoji: "🔢", desc: "Zahlen schieben", unit: "Punkte" },
];

export function GamesHub({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [coins, setCoins] = useState(0);
  const [selected, setSelected] = useState<GameKey | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d: { user: PublicUser }) => {
        setUser(d.user);
        setCoins(d.user.coins);
      })
      .catch(() => {});
    fetch(`/api/games/score?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { scores: Record<string, number> }) => setScores(d.scores ?? {}))
      .catch(() => {});
  }, [userId]);

  const setBest = (game: GameKey, best: number) => setScores((s) => ({ ...s, [game]: best }));

  async function playGame(key: GameKey) {
    setMsg(null);
    try {
      const res = await fetch("/api/games/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = (await res.json()) as { ok: boolean; coins: number };
      if (d.ok) {
        setCoins(d.coins);
        setSelected(key);
      } else {
        setMsg("Keine Coins mehr! Schaff ein Fach, dann gibt's einen Coin.");
      }
    } catch {
      setMsg("Etwas ist schiefgelaufen.");
    }
  }

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center text-neutral-400">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

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
          <span className="text-base leading-none">🪙</span> {coins}
        </span>
      </header>

      {selected === "balloons" ? (
        <Balloons userId={userId} best={scores.balloons} onBest={(b) => setBest("balloons", b)} />
      ) : selected === "connect4" ? (
        <ConnectFour userId={userId} best={scores.connect4} onBest={(b) => setBest("connect4", b)} />
      ) : selected === "jump" ? (
        <JumpRunner userId={userId} best={scores.jump} onBest={(b) => setBest("jump", b)} />
      ) : selected === "breakout" ? (
        <Breakout userId={userId} best={scores.breakout} onBest={(b) => setBest("breakout", b)} />
      ) : selected === "memory" ? (
        <Memory userId={userId} best={scores.memory} onBest={(b) => setBest("memory", b)} />
      ) : selected === "snake" ? (
        <Snake userId={userId} best={scores.snake} onBest={(b) => setBest("snake", b)} />
      ) : selected === "2048" ? (
        <Game2048 userId={userId} best={scores["2048"]} onBest={(b) => setBest("2048", b)} />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1">Spiele</h1>
          <p className="text-neutral-500 mb-4">
            Jede Runde kostet <span className="font-semibold">1 🪙</span>. Coins bekommst du, wenn du
            ein Fach fertig übst.
          </p>
          {msg && (
            <div className="mb-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-2 text-sm">
              {msg}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {GAMES.map((g) => {
              const best = scores[g.key];
              const canPlay = coins > 0;
              return (
                <button
                  key={g.key}
                  onClick={() => playGame(g.key)}
                  disabled={!canPlay}
                  className={`flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 transition ${
                    canPlay ? "hover:shadow-xl hover:-translate-y-1" : "opacity-50"
                  }`}
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
