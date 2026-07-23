"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { submitScore, type GameProps, type ScoreResult } from "./score";

const ROWS = 6;
const COLS = 7;
type Board = number[][]; // 0 leer, 1 Kind, 2 Computer

const empty = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function dropRow(b: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r][col] === 0) return r;
  return -1;
}

function winner(b: Board): number {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        let k = 1;
        while (
          k < 4 &&
          r + dr * k >= 0 &&
          r + dr * k < ROWS &&
          c + dc * k >= 0 &&
          c + dc * k < COLS &&
          b[r + dr * k][c + dc * k] === p
        )
          k++;
        if (k === 4) return p;
      }
    }
  return 0;
}

function validCols(b: Board): number[] {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (b[0][c] === 0) cols.push(c);
  return cols;
}

function wouldWin(b: Board, col: number, player: number): boolean {
  const r = dropRow(b, col);
  if (r < 0) return false;
  b[r][col] = player;
  const w = winner(b) === player;
  b[r][col] = 0;
  return w;
}

function aiMove(b: Board): number {
  const cols = validCols(b);
  for (const c of cols) if (wouldWin(b, c, 2)) return c; // selbst gewinnen
  for (const c of cols) if (wouldWin(b, c, 1)) return c; // Kind blocken
  const weighted = cols.sort((a, c) => Math.abs(3 - a) - Math.abs(3 - c));
  const top = weighted.slice(0, Math.min(3, weighted.length));
  return top[Math.floor(Math.random() * top.length)];
}

export function ConnectFour({ userId, best, onBest }: GameProps) {
  const [board, setBoard] = useState<Board>(empty);
  const [state, setState] = useState<"play" | "win" | "lose" | "draw">("play");
  const [busy, setBusy] = useState(false);
  const [wins, setWins] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const winsRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const newGame = useCallback(() => {
    setBoard(empty());
    setState("play");
    setBusy(false);
    setResult(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function play(col: number) {
    if (state !== "play" || busy) return;
    const b = board.map((r) => [...r]);
    const r = dropRow(b, col);
    if (r < 0) return;
    b[r][col] = 1;
    if (winner(b) === 1) {
      setBoard(b);
      setState("win");
      winsRef.current += 1;
      setWins(winsRef.current);
      submitScore(userId, "connect4", winsRef.current).then((res) => {
        setResult(res);
        onBest?.(res.best);
      });
      return;
    }
    if (validCols(b).length === 0) {
      setBoard(b);
      setState("draw");
      return;
    }
    setBoard(b);
    setBusy(true);
    timer.current = setTimeout(() => {
      const b2 = b.map((row) => [...row]);
      const col2 = aiMove(b2);
      const r2 = dropRow(b2, col2);
      b2[r2][col2] = 2;
      setBoard(b2);
      setBusy(false);
      if (winner(b2) === 2) setState("lose");
      else if (validCols(b2).length === 0) setState("draw");
    }, 450);
  }

  const bestWins = result?.best ?? best;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm">
        <span className="text-sm text-neutral-500 nums">Siege: {wins}</span>
        {bestWins != null && (
          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
            <Trophy size={14} /> {bestWins}
          </span>
        )}
        <button
          onClick={newGame}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600"
        >
          <RotateCcw size={15} /> Neu
        </button>
      </div>

      <div className="rounded-2xl bg-blue-500 p-2 w-full max-w-sm">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => play(c)}
              className="flex flex-col gap-1.5"
              aria-label={`Spalte ${c + 1}`}
            >
              {Array.from({ length: ROWS }).map((_, r) => {
                const v = board[r][c];
                return (
                  <span
                    key={r}
                    className={`aspect-square rounded-full ${
                      v === 1 ? "bg-amber-400" : v === 2 ? "bg-rose-500" : "bg-white dark:bg-neutral-900"
                    }`}
                  />
                );
              })}
            </button>
          ))}
        </div>
      </div>

      <div className="h-8 flex items-center">
        {state === "win" && (
          <p className="font-bold text-emerald-600 dark:text-emerald-400 animate-pop">
            Gewonnen! 🎉 {result?.isNewBest && "Neuer Rekord!"}
          </p>
        )}
        {state === "lose" && <p className="font-bold text-rose-500 animate-pop">Der Computer gewinnt.</p>}
        {state === "draw" && <p className="font-bold text-neutral-500 animate-pop">Unentschieden.</p>}
        {state === "play" && <p className="text-sm text-neutral-400">Du bist Gelb — tippe auf eine Spalte.</p>}
      </div>

      {state !== "play" && (
        <button
          onClick={newGame}
          className="rounded-xl bg-blue-500 text-white px-5 py-2 font-semibold hover:opacity-90"
        >
          Nochmal
        </button>
      )}
    </div>
  );
}
