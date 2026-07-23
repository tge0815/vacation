"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { submitScore, type GameProps, type ScoreResult } from "./score";

const GRID = 15;
const SPEED = 160;
type P = { x: number; y: number };

function randomFood(snake: P[]): P {
  while (true) {
    const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export function Snake({ userId, best, onBest }: GameProps) {
  const [snake, setSnake] = useState<P[]>([]);
  const [food, setFood] = useState<P>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const submitted = useRef(false);

  const snakeRef = useRef<P[]>([]);
  const foodRef = useRef<P>({ x: 0, y: 0 });
  const dirRef = useRef<P>({ x: 1, y: 0 });
  const overRef = useRef(true);
  const scoreRef = useRef(0);

  const newGame = useCallback(() => {
    const s = [
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 },
    ];
    snakeRef.current = s;
    dirRef.current = { x: 1, y: 0 };
    overRef.current = false;
    scoreRef.current = 0;
    const f = randomFood(s);
    foodRef.current = f;
    setSnake(s);
    setFood(f);
    setScore(0);
    setOver(false);
    setStarted(true);
    setResult(null);
    submitted.current = false;
  }, []);

  const tick = useCallback(() => {
    if (overRef.current) return;
    const d = dirRef.current;
    const prev = snakeRef.current;
    const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };
    if (
      head.x < 0 ||
      head.x >= GRID ||
      head.y < 0 ||
      head.y >= GRID ||
      prev.some((s) => s.x === head.x && s.y === head.y)
    ) {
      overRef.current = true;
      setOver(true);
      return;
    }
    const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
    const body = ate ? [head, ...prev] : [head, ...prev.slice(0, -1)];
    snakeRef.current = body;
    setSnake(body);
    if (ate) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      const f = randomFood(body);
      foodRef.current = f;
      setFood(f);
    }
  }, []);

  const turn = useCallback((nx: number, ny: number) => {
    const c = dirRef.current;
    if (c.x === -nx && c.y === -ny) return; // kein direktes Umkehren
    if (c.x === nx && c.y === ny) return;
    dirRef.current = { x: nx, y: ny };
  }, []);

  useEffect(() => {
    const id = setInterval(tick, SPEED);
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w") turn(0, -1);
      else if (k === "ArrowDown" || k === "s") turn(0, 1);
      else if (k === "ArrowLeft" || k === "a") turn(-1, 0);
      else if (k === "ArrowRight" || k === "d") turn(1, 0);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [tick, turn]);

  useEffect(() => {
    if (over && started && !submitted.current) {
      submitted.current = true;
      submitScore(userId, "snake", score).then((res) => {
        setResult(res);
        onBest?.(res.best);
      });
    }
  }, [over, started, score, userId, onBest]);

  const cells = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const isHead = snake[0]?.x === x && snake[0]?.y === y;
      const isBody = snake.some((s, i) => i > 0 && s.x === x && s.y === y);
      const isFood = food.x === x && food.y === y;
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`rounded-[3px] ${
            isHead
              ? "bg-emerald-600"
              : isBody
                ? "bg-emerald-400"
                : isFood
                  ? "bg-rose-500"
                  : "bg-neutral-200 dark:bg-neutral-800"
          }`}
        />,
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">
          Punkte: {score}
          {(result?.best ?? best) != null && (
            <span className="ml-3 inline-flex items-center gap-1 text-amber-500">
              <Trophy size={13} /> {result?.best ?? best}
            </span>
          )}
        </span>
        <button
          onClick={newGame}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600"
        >
          <RotateCcw size={15} /> {started ? "Neu" : "Start"}
        </button>
      </div>

      <div
        className="grid w-full max-w-sm aspect-square gap-[2px] rounded-xl p-1.5 bg-neutral-100 dark:bg-neutral-900"
        style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
      >
        {cells}
      </div>

      {over && started && (
        <div className="text-center animate-pop">
          <p className="text-lg font-bold">Game Over — {score} Punkte</p>
          {result?.isNewBest && <p className="text-amber-500 font-semibold">🏆 Neuer Rekord!</p>}
        </div>
      )}
      {!started && <p className="text-sm text-neutral-500">Tippe auf Start und steuere mit den Pfeilen.</p>}

      {/* Steuerkreuz für Touch */}
      <div className="grid grid-cols-3 gap-2 w-40 select-none">
        <div />
        <button onClick={() => turn(0, -1)} className={DPAD}>
          <ChevronUp />
        </button>
        <div />
        <button onClick={() => turn(-1, 0)} className={DPAD}>
          <ChevronLeft />
        </button>
        <button onClick={() => turn(0, 1)} className={DPAD}>
          <ChevronDown />
        </button>
        <button onClick={() => turn(1, 0)} className={DPAD}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

const DPAD =
  "flex items-center justify-center h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 active:scale-95 transition";
