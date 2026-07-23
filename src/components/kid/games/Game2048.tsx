"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type Board = number[][];
type Dir = "left" | "right" | "up" | "down";

const empty = (): Board => Array.from({ length: 4 }, () => [0, 0, 0, 0]);

function addTile(b: Board): boolean {
  const free: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (b[r][c] === 0) free.push([r, c]);
  if (free.length === 0) return false;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  b[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function slide(line: number[]): { line: number[]; gained: number } {
  const n = line.filter((v) => v);
  const res: number[] = [];
  let gained = 0;
  for (let i = 0; i < n.length; i++) {
    if (n[i] === n[i + 1]) {
      res.push(n[i] * 2);
      gained += n[i] * 2;
      i++;
    } else res.push(n[i]);
  }
  while (res.length < 4) res.push(0);
  return { line: res, gained };
}

function lineCoords(dir: Dir): [number, number][][] {
  const lines: [number, number][][] = [];
  for (let i = 0; i < 4; i++) {
    const line: [number, number][] = [];
    for (let j = 0; j < 4; j++) {
      if (dir === "left") line.push([i, j]);
      else if (dir === "right") line.push([i, 3 - j]);
      else if (dir === "up") line.push([j, i]);
      else line.push([3 - j, i]);
    }
    lines.push(line);
  }
  return lines;
}

function move(board: Board, dir: Dir): { board: Board; gained: number; moved: boolean } {
  const b = board.map((r) => [...r]);
  let gained = 0;
  let moved = false;
  for (const coords of lineCoords(dir)) {
    const vals = coords.map(([r, c]) => b[r][c]);
    const { line, gained: g } = slide(vals);
    gained += g;
    coords.forEach(([r, c], idx) => {
      if (b[r][c] !== line[idx]) moved = true;
      b[r][c] = line[idx];
    });
  }
  return { board: b, gained, moved };
}

function canMove(b: Board): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (b[r][c] === 0) return true;
      if (c < 3 && b[r][c] === b[r][c + 1]) return true;
      if (r < 3 && b[r][c] === b[r + 1][c]) return true;
    }
  return false;
}

const TILE: Record<number, string> = {
  0: "bg-neutral-200 dark:bg-neutral-800 text-transparent",
  2: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  4: "bg-sky-200 text-sky-800 dark:bg-sky-500/30 dark:text-sky-200",
  8: "bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200",
  16: "bg-amber-300 text-amber-900 dark:bg-amber-500/40 dark:text-amber-100",
  32: "bg-orange-300 text-orange-900 dark:bg-orange-500/40 dark:text-orange-100",
  64: "bg-orange-400 text-white dark:bg-orange-500/60",
  128: "bg-emerald-300 text-emerald-900 dark:bg-emerald-500/40 dark:text-emerald-100",
  256: "bg-emerald-400 text-white dark:bg-emerald-500/60",
  512: "bg-violet-400 text-white dark:bg-violet-500/60",
  1024: "bg-violet-500 text-white",
  2048: "bg-rose-500 text-white",
};

export function Game2048() {
  const [board, setBoard] = useState<Board>(empty);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const boardRef = useRef<Board>(empty());
  const overRef = useRef(false);

  const newGame = useCallback(() => {
    const b = empty();
    addTile(b);
    addTile(b);
    boardRef.current = b;
    overRef.current = false;
    setBoard(b.map((r) => [...r]));
    setScore(0);
    setOver(false);
  }, []);

  const doMove = useCallback((dir: Dir) => {
    if (overRef.current) return;
    const { board: nb, gained, moved } = move(boardRef.current, dir);
    if (!moved) return;
    addTile(nb);
    boardRef.current = nb;
    setBoard(nb.map((r) => [...r]));
    if (gained) setScore((s) => s + gained);
    if (!canMove(nb)) {
      overRef.current = true;
      setOver(true);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(newGame, 0);
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [newGame, doMove]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-sm text-neutral-500 nums">Punkte: {score}</span>
        <button
          onClick={newGame}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600"
        >
          <RotateCcw size={15} /> Neu
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-xs p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900">
        {board.flat().map((v, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg nums ${TILE[v] ?? TILE[2048]}`}
          >
            {v || ""}
          </div>
        ))}
      </div>

      {over && <p className="text-lg font-bold animate-pop">Vorbei — {score} Punkte</p>}

      <div className="grid grid-cols-3 gap-2 w-40 select-none">
        <div />
        <button onClick={() => doMove("up")} className={DPAD}>
          <ChevronUp />
        </button>
        <div />
        <button onClick={() => doMove("left")} className={DPAD}>
          <ChevronLeft />
        </button>
        <button onClick={() => doMove("down")} className={DPAD}>
          <ChevronDown />
        </button>
        <button onClick={() => doMove("right")} className={DPAD}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

const DPAD =
  "flex items-center justify-center h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 active:scale-95 transition";
