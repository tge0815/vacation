"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Trophy } from "lucide-react";
import { submitScore, type GameProps, type ScoreResult } from "./score";

const COLORS = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
const DURATION = 30; // Sekunden

type Balloon = { id: number; left: number; color: string; dur: number };

export function Balloons({ userId, best, onBest }: GameProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const idRef = useRef(0);
  const scoreRef = useRef(0);

  const spawn = useCallback(() => {
    idRef.current += 1;
    const b: Balloon = {
      id: idRef.current,
      left: 6 + Math.random() * 84,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dur: 2.6 + Math.random() * 2.2,
    };
    setBalloons((prev) => [...prev, b]);
  }, []);

  const start = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(DURATION);
    setBalloons([]);
    setResult(null);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    const spawner = setInterval(spawn, 650);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(spawner);
          clearInterval(timer);
          setRunning(false);
          setBalloons([]);
          submitScore(userId, "balloons", scoreRef.current).then((res) => {
            setResult(res);
            onBest?.(res.best);
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawner);
      clearInterval(timer);
    };
  }, [running, spawn, userId, onBest]);

  function pop(id: number) {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    scoreRef.current += 1;
    setScore(scoreRef.current);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">Getroffen: {score}</span>
        <span className="text-sm font-semibold text-rose-500 nums">{running ? `${timeLeft}s` : ""}</span>
        {(result?.best ?? best) != null && (
          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
            <Trophy size={14} /> {result?.best ?? best}
          </span>
        )}
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-sky-100 dark:bg-sky-950/40 h-[60vh]">
        {balloons.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            aria-label="Ballon"
            className="absolute text-4xl active:scale-90"
            style={{
              left: `${b.left}%`,
              animation: `balloon-rise ${b.dur}s linear forwards`,
              filter: "saturate(1.2)",
              color: b.color,
            }}
            onAnimationEnd={() => setBalloons((prev) => prev.filter((x) => x.id !== b.id))}
          >
            <span style={{ color: b.color }}>🎈</span>
          </button>
        ))}

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            {result ? (
              <>
                <p className="text-xl font-bold">{score} Ballons getroffen!</p>
                {result.isNewBest && <p className="text-amber-500 font-semibold">🏆 Neuer Rekord!</p>}
              </>
            ) : (
              <p className="text-neutral-500">Tippe {DURATION} Sekunden lang so viele Ballons wie möglich!</p>
            )}
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
            >
              <Play size={18} /> {result ? "Nochmal" : "Start"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
