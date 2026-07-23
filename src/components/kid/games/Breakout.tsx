"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { submitScore, type GameProps, type ScoreResult } from "./score";

const W = 360;
const H = 440;
const PADDLE_W = 66;
const PADDLE_H = 12;
const BR = 7; // Ball-Radius
const COLS = 7;
const ROWS = 5;
const MARGIN = 16;
const BRICK_H = 16;
const COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

type Brick = { x: number; y: number; w: number; alive: boolean; color: string };

export function Breakout({ userId, best, onBest }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<"idle" | "run" | "over">("idle");
  const [waiting, setWaiting] = useState(true);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const paddleX = useRef(W / 2);
  const ball = useRef({ x: W / 2, y: H - 40, vx: 0, vy: 0 });
  const onPaddle = useRef(true);
  const bricks = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const phaseRef = useRef<"idle" | "run" | "over">("idle");
  const rafRef = useRef(0);

  const buildBricks = useCallback(() => {
    const bw = (W - 2 * MARGIN - (COLS - 1) * 6) / COLS;
    const arr: Brick[] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        arr.push({
          x: MARGIN + c * (bw + 6),
          y: 44 + r * (BRICK_H + 6),
          w: bw,
          alive: true,
          color: COLORS[r % COLORS.length],
        });
    bricks.current = arr;
  }, []);

  const newGame = useCallback(() => {
    buildBricks();
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    onPaddle.current = true;
    setWaiting(true);
    ball.current = { x: paddleX.current, y: H - 40, vx: 0, vy: 0 };
    setResult(null);
    phaseRef.current = "run";
    setPhase("run");
  }, [buildBricks]);

  const endGame = useCallback(() => {
    phaseRef.current = "over";
    setPhase("over");
    submitScore(userId, "breakout", scoreRef.current).then((res) => {
      setResult(res);
      onBest?.(res.best);
    });
  }, [userId, onBest]);

  const launch = useCallback(() => {
    if (phaseRef.current !== "run") {
      newGame();
      return;
    }
    if (onPaddle.current) {
      onPaddle.current = false;
      setWaiting(false);
      ball.current.vx = 2.4 * (Math.random() < 0.5 ? -1 : 1);
      ball.current.vy = -4;
    }
  }, [newGame]);

  useEffect(() => {
    buildBricks();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const loop = () => {
      const b = ball.current;
      if (phaseRef.current === "run") {
        if (onPaddle.current) {
          b.x = paddleX.current;
          b.y = H - 24 - PADDLE_H - BR;
        } else {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x - BR < 0 || b.x + BR > W) b.vx = -b.vx;
          if (b.y - BR < 0) b.vy = -b.vy;
          // Paddle
          const py = H - 24 - PADDLE_H;
          if (
            b.vy > 0 &&
            b.y + BR >= py &&
            b.y + BR <= py + PADDLE_H + 6 &&
            b.x > paddleX.current - PADDLE_W / 2 &&
            b.x < paddleX.current + PADDLE_W / 2
          ) {
            b.vy = -Math.abs(b.vy);
            b.vx += (b.x - paddleX.current) / 12;
          }
          // Bricks
          for (const br of bricks.current) {
            if (!br.alive) continue;
            if (b.x > br.x && b.x < br.x + br.w && b.y - BR < br.y + BRICK_H && b.y + BR > br.y) {
              br.alive = false;
              b.vy = -b.vy;
              scoreRef.current += 10;
              setScore(scoreRef.current);
              break;
            }
          }
          if (bricks.current.every((x) => !x.alive)) {
            endGame();
          }
          if (b.y - BR > H) {
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) endGame();
            else {
              onPaddle.current = true;
              setWaiting(true);
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = isDark ? "#0a0a0a" : "#f1f5f9";
      ctx.fillRect(0, 0, W, H);
      for (const br of bricks.current) {
        if (!br.alive) continue;
        ctx.fillStyle = br.color;
        ctx.fillRect(br.x, br.y, br.w, BRICK_H);
      }
      ctx.fillStyle = "#0ea5e9";
      ctx.fillRect(paddleX.current - PADDLE_W / 2, H - 24 - PADDLE_H, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(b.x, b.y, BR, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const move = (clientX: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (clientX - rect.left) * (W / rect.width);
      paddleX.current = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
    };
    const onPointer = (e: PointerEvent) => move(e.clientX);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paddleX.current = Math.max(PADDLE_W / 2, paddleX.current - 24);
      else if (e.key === "ArrowRight")
        paddleX.current = Math.min(W - PADDLE_W / 2, paddleX.current + 24);
    };
    const cvs = canvasRef.current;
    cvs?.addEventListener("pointermove", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(rafRef.current);
      cvs?.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [buildBricks, endGame]);

  const bestScore = result?.best ?? best;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">Punkte: {score}</span>
        <span className="text-sm text-rose-500">{"❤️".repeat(Math.max(0, lives))}</span>
        <div className="flex items-center gap-3">
          {bestScore != null && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-500">
              <Trophy size={14} /> {bestScore}
            </span>
          )}
          <button
            onClick={newGame}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600"
          >
            <RotateCcw size={15} /> Neu
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-sm select-none" onClick={launch}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto rounded-2xl touch-none" />
        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
            <p className="text-xl font-bold">{score} Punkte</p>
            {result?.isNewBest && <p className="text-amber-500 font-semibold">🏆 Rekord!</p>}
            <p className="text-neutral-500 text-sm">Tippen für nochmal</p>
          </div>
        )}
        {phase === "run" && waiting && (
          <div className="absolute inset-x-0 bottom-16 text-center pointer-events-none">
            <p className="text-neutral-500 text-sm">Tippen zum Abschießen · Maus/Finger bewegt</p>
          </div>
        )}
      </div>
    </div>
  );
}
