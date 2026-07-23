"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { submitScore, type GameProps, type ScoreResult } from "./score";

const W = 360;
const H = 520;
const R = 14; // Vogel-Radius
const GAP = 150;
const PIPE_W = 56;
const SPEED = 2.6;
const GRAV = 0.5;
const FLAP = -8.2;

type Pipe = { x: number; gapY: number; passed: boolean };

export function JumpRunner({ userId, best, onBest }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"idle" | "run" | "over">("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);

  const yRef = useRef(H / 2);
  const vyRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const phaseRef = useRef<"idle" | "run" | "over">("idle");
  const rafRef = useRef(0);

  const reset = useCallback(() => {
    yRef.current = H / 2;
    vyRef.current = 0;
    pipesRef.current = [{ x: W + 60, gapY: H / 2, passed: false }];
    scoreRef.current = 0;
    setScore(0);
    setResult(null);
  }, []);

  const flap = useCallback(() => {
    if (phaseRef.current === "over") return;
    if (phaseRef.current === "idle") {
      reset();
      phaseRef.current = "run";
      setPhase("run");
    }
    vyRef.current = FLAP;
  }, [reset]);

  const endGame = useCallback(() => {
    phaseRef.current = "over";
    setPhase("over");
    submitScore(userId, "jump", scoreRef.current).then((res) => {
      setResult(res);
      onBest?.(res.best);
    });
  }, [userId, onBest]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const loop = () => {
      // Update
      if (phaseRef.current === "run") {
        vyRef.current += GRAV;
        yRef.current += vyRef.current;
        const pipes = pipesRef.current;
        for (const p of pipes) p.x -= SPEED;
        if (pipes.length && pipes[pipes.length - 1].x < W - 210) {
          pipes.push({ x: W + PIPE_W, gapY: 120 + Math.random() * (H - 240), passed: false });
        }
        while (pipes.length && pipes[0].x < -PIPE_W) pipes.shift();
        const bx = 84;
        for (const p of pipes) {
          if (!p.passed && p.x + PIPE_W < bx) {
            p.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
          const inX = bx + R > p.x && bx - R < p.x + PIPE_W;
          if (inX && (yRef.current - R < p.gapY - GAP / 2 || yRef.current + R > p.gapY + GAP / 2)) {
            endGame();
          }
        }
        if (yRef.current + R > H || yRef.current - R < 0) endGame();
      }

      // Draw
      ctx.fillStyle = isDark ? "#0c1a2b" : "#bae6fd";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#10b981";
      for (const p of pipesRef.current) {
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY - GAP / 2);
        ctx.fillRect(p.x, p.gapY + GAP / 2, PIPE_W, H - (p.gapY + GAP / 2));
      }
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(84, yRef.current, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(90, yRef.current - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [flap, endGame]);

  const onTap = useCallback(() => {
    if (phaseRef.current === "over") {
      reset();
      phaseRef.current = "run";
      setPhase("run");
      vyRef.current = FLAP;
    } else {
      flap();
    }
  }, [reset, flap]);

  const bestScore = result?.best ?? best;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">Punkte: {score}</span>
        {bestScore != null && (
          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
            <Trophy size={14} /> {bestScore}
          </span>
        )}
      </div>

      <div className="relative w-full max-w-sm select-none" onClick={onTap}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto rounded-2xl touch-none"
        />
        {phase !== "run" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
            {phase === "over" && result ? (
              <>
                <p className="text-xl font-bold text-white drop-shadow">{score} Punkte</p>
                {result.isNewBest && <p className="text-amber-300 font-semibold drop-shadow">🏆 Rekord!</p>}
                <p className="text-white/90 text-sm drop-shadow">Tippen für nochmal</p>
              </>
            ) : (
              <p className="text-white font-semibold drop-shadow">Tippen zum Fliegen</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
