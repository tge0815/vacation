"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import type { GameLesson } from "./lessons";
import { HelpPanel, ExplainBox } from "./HelpPanel";
import { NextButton, UnityBridge } from "./LessonChrome";

const CELL = 54;

// Live-Spiel-Engine im Web-Worker: onUpdate() pro Frame, taste() liest Tasten,
// dazu Punkte (hud), Gegner (Kollision = verloren), Zufall und Schwerkraft
// (fuchs.springe / fuchs.amBoden). Ein Watchdog beendet Endlosschleifen.
const WORKER_SRC = `
let timer = null;
self._keys = {};
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "key") { self._keys[m.name] = m.down; return; }
  if (m.type === "stop") { if (timer) { clearInterval(timer); timer = null; } return; }
  if (m.type !== "start") return;
  if (timer) { clearInterval(timer); timer = null; }
  self._keys = {};
  const cfg = m.cfg, code = m.code;
  const fox = { x: cfg.fox.x, y: cfg.fox.y, vy: 0, amBoden: true };
  fox.springe = function () { if (fox.amBoden) { fox.vy = -0.55; fox.amBoden = false; } };
  const muenzen = (cfg.targets || []).map((t) => ({ x: t.x, y: t.y, weg: false }));
  const gegner = (cfg.enemies || []).map((en) => ({
    x: en.axis === "h" ? en.from : en.line,
    y: en.axis === "v" ? en.from : en.line,
    _pos: en.from, _dir: 1, _e: en,
  }));
  let onUpdateFn = null, collectCb = null, hudText = "";
  const taste = (n) => !!self._keys[n];
  const onUpdate = (fn) => { onUpdateFn = fn; };
  const beimEinsammeln = (fn) => { collectCb = fn; };
  const hud = (t) => { hudText = String(t); };
  const zufall = (a, b) => { a = Math.floor(a); b = Math.floor(b); return a + Math.floor(Math.random() * (b - a + 1)); };
  try {
    new Function("fuchs","taste","onUpdate","beimEinsammeln","hud","zufall","gegner","muenzen","cols","rows", code)
      (fox, taste, onUpdate, beimEinsammeln, hud, zufall, gegner, muenzen, cfg.cols, cfg.rows);
  } catch (err) { self.postMessage({ type: "error", error: String((err && err.message) || err) }); return; }
  const started = Date.now();
  const G = 0.03;
  timer = setInterval(() => {
    if (cfg.gravity) fox.amBoden = fox.y >= cfg.rows - 1 - 0.001;
    try { if (onUpdateFn) onUpdateFn(); }
    catch (err) { clearInterval(timer); timer = null; self.postMessage({ type: "error", error: String((err && err.message) || err) }); return; }
    if (cfg.gravity) {
      fox.vy += G; fox.y += fox.vy;
      if (fox.y >= cfg.rows - 1) { fox.y = cfg.rows - 1; fox.vy = 0; fox.amBoden = true; }
      else if (fox.y < 0) { fox.y = 0; fox.vy = 0; fox.amBoden = false; }
      else fox.amBoden = false;
    }
    fox.x = Math.max(0, Math.min(cfg.cols - 1, fox.x));
    if (!cfg.gravity) fox.y = Math.max(0, Math.min(cfg.rows - 1, fox.y));
    for (const gg of gegner) {
      gg._pos += gg._dir * gg._e.speed;
      if (gg._pos >= gg._e.to) { gg._pos = gg._e.to; gg._dir = -1; }
      else if (gg._pos <= gg._e.from) { gg._pos = gg._e.from; gg._dir = 1; }
      gg.x = gg._e.axis === "h" ? gg._pos : gg._e.line;
      gg.y = gg._e.axis === "v" ? gg._pos : gg._e.line;
    }
    let status = "playing";
    for (const gg of gegner) { if (Math.abs(gg.x - fox.x) < 0.6 && Math.abs(gg.y - fox.y) < 0.6) { status = "lose"; break; } }
    if (status === "playing") {
      for (const c of muenzen) {
        if (!c.weg && Math.abs(c.x - fox.x) < 0.5 && Math.abs(c.y - fox.y) < 0.5) {
          c.weg = true;
          if (collectCb) { try { collectCb(); } catch (err) { clearInterval(timer); timer = null; self.postMessage({ type: "error", error: String((err && err.message) || err) }); return; } }
        }
      }
    }
    if (status === "playing") {
      if (cfg.winOn === "collectAll" && muenzen.length > 0 && muenzen.every((c) => c.weg)) status = "win";
      else if (cfg.winOn === "reachGoal" && cfg.goalCell && Math.abs(cfg.goalCell.x - fox.x) < 0.6 && Math.abs(cfg.goalCell.y - fox.y) < 0.6) status = "win";
    }
    const elapsed = (Date.now() - started) / 1000;
    if (status === "playing" && cfg.timeLimit && elapsed >= cfg.timeLimit) status = "timeout";
    self.postMessage({
      type: "frame",
      fox: { x: fox.x, y: fox.y },
      coins: muenzen.map((c) => ({ x: c.x, y: c.y, weg: c.weg })),
      enemies: gegner.map((gg) => ({ x: gg.x, y: gg.y })),
      hud: hudText,
      time: cfg.timeLimit ? Math.max(0, cfg.timeLimit - elapsed) : elapsed,
      status: status,
    });
    if (status !== "playing") { clearInterval(timer); timer = null; }
  }, 1000 / 30);
};
`;

const KEYMAP: Record<string, string> = {
  ArrowRight: "rechts", ArrowLeft: "links", ArrowUp: "hoch", ArrowDown: "runter",
  d: "rechts", a: "links", w: "hoch", s: "runter", " ": "turbo",
};

type Status = "idle" | "running" | "win" | "fail" | "error";
type Frame = {
  fox: { x: number; y: number };
  coins: { x: number; y: number; weg: boolean }[];
  enemies: { x: number; y: number }[];
  hud: string;
  time: number;
  status: string;
};

export function GameLessonView({
  userId,
  lesson,
  alreadyDone,
  onOpen,
  onCompleted,
}: {
  userId: number;
  lesson: GameLesson;
  alreadyDone: boolean;
  onOpen: (k: string) => void;
  onCompleted: (coins: number) => void;
}) {
  const storageKey = `codelab:${userId}:${lesson.key}`;
  const [code, setCode] = useState(lesson.starter);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [time, setTime] = useState<number | null>(lesson.timeLimit ?? null);
  const [hud, setHud] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const watchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {}
    setCode(saved ?? lesson.starter);
    setStatus("idle");
    setMessage(null);
    setHud("");
    setTime(lesson.timeLimit ?? null);
    requestAnimationFrame(() =>
      drawFrame({
        fox: lesson.fox,
        coins: (lesson.targets ?? []).map((t) => ({ ...t, weg: false })),
        enemies: (lesson.enemies ?? []).map((e) => ({
          x: e.axis === "h" ? e.from : e.line,
          y: e.axis === "v" ? e.from : e.line,
        })),
        hud: "",
        time: lesson.timeLimit ?? 0,
        status: "idle",
      }),
    );
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.key]);

  function saveCode(v: string) {
    setCode(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {}
  }

  function stopAll() {
    runningRef.current = false;
    if (watchRef.current) clearInterval(watchRef.current);
    watchRef.current = null;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop" });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }

  function onKeyDown(e: KeyboardEvent) {
    const name = KEYMAP[e.key];
    if (!name) return;
    e.preventDefault();
    workerRef.current?.postMessage({ type: "key", name, down: true });
  }
  function onKeyUp(e: KeyboardEvent) {
    const name = KEYMAP[e.key];
    if (!name) return;
    e.preventDefault();
    workerRef.current?.postMessage({ type: "key", name, down: false });
  }

  function cell(n: number) {
    return n * CELL + CELL / 2;
  }
  function drawFrame(f: Frame) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const W = lesson.cols * CELL;
    const H = lesson.rows * CELL;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = lesson.gravity ? "#e7f0ff" : "#eaf6ea";
    ctx.fillRect(0, 0, W, H);
    if (lesson.gravity) {
      ctx.fillStyle = "#c7d2fe";
      ctx.fillRect(0, (lesson.rows - 1) * CELL + CELL - 6, W, 6); // Boden
    }
    ctx.strokeStyle = lesson.gravity ? "#cdddf7" : "#c3dcc3";
    ctx.lineWidth = 1;
    for (let x = 0; x <= lesson.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, H);
      ctx.stroke();
    }
    for (let y = 0; y <= lesson.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(W, y * CELL);
      ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.floor(CELL * 0.55)}px system-ui, sans-serif`;
    if (lesson.goalCell) ctx.fillText("⭐", cell(lesson.goalCell.x), cell(lesson.goalCell.y));
    for (const c of f.coins) if (!c.weg) ctx.fillText(lesson.targetIcon ?? "🪙", cell(c.x), cell(c.y));
    for (const g of f.enemies) ctx.fillText("👾", cell(g.x), cell(g.y));
    ctx.font = `${Math.floor(CELL * 0.62)}px system-ui, sans-serif`;
    ctx.fillText("🦊", cell(f.fox.x), cell(f.fox.y));
  }

  async function win() {
    stopAll();
    setStatus("win");
    setMessage("Geschafft! ⭐ Stark gespielt.");
    try {
      const res = await fetch("/api/code/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lessonKey: lesson.key }),
      });
      const d = (await res.json()) as { coins?: number };
      if (typeof d.coins === "number") onCompleted(d.coins);
    } catch {}
  }

  function run() {
    stopAll();
    setStatus("running");
    setMessage(null);
    setHud("");
    runningRef.current = true;

    const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    lastFrameRef.current = Date.now();

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as { type: string } & Partial<Frame> & { error?: string };
      if (d.type === "error") {
        stopAll();
        setStatus("error");
        setMessage("Hoppla, im Code steckt ein Fehler: " + (d.error ?? "unbekannt"));
        return;
      }
      if (d.type === "frame") {
        lastFrameRef.current = Date.now();
        drawFrame(d as Frame);
        setHud(d.hud ?? "");
        if (lesson.timeLimit != null) setTime(d.time ?? 0);
        if (d.status === "win") win();
        else if (d.status === "lose") {
          stopAll();
          setStatus("fail");
          setMessage("Erwischt vom Gegner! 👾 Nicht berühren – versuch's nochmal.");
        } else if (d.status === "timeout") {
          stopAll();
          setStatus("fail");
          setMessage("Zeit um! ⏱ Probier eine schnellere Route.");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvasRef.current?.focus();

    watchRef.current = setInterval(() => {
      if (runningRef.current && Date.now() - lastFrameRef.current > 1500) {
        stopAll();
        setStatus("error");
        setMessage("Das Spiel hängt – vielleicht eine Endlosschleife im onUpdate? 🌀");
      }
    }, 500);

    worker.postMessage({
      type: "start",
      code,
      cfg: {
        cols: lesson.cols,
        rows: lesson.rows,
        fox: lesson.fox,
        winOn: lesson.winOn,
        targets: lesson.targets ?? [],
        goalCell: lesson.goalCell ?? null,
        enemies: lesson.enemies ?? [],
        gravity: lesson.gravity ?? false,
        timeLimit: lesson.timeLimit ?? null,
      },
    });
  }

  function pad(name: string, down: boolean) {
    workerRef.current?.postMessage({ type: "key", name, down });
  }

  function onEditorKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart;
      const v = t.value.slice(0, s) + "  " + t.value.slice(t.selectionEnd);
      saveCode(v);
      requestAnimationFrame(() => {
        t.selectionStart = t.selectionEnd = s + 2;
      });
    }
  }

  const DPAD = [
    { name: "hoch", label: "▲", col: "col-start-2 row-start-1" },
    { name: "links", label: "◀", col: "col-start-1 row-start-2" },
    { name: "runter", label: "▼", col: "col-start-2 row-start-2" },
    { name: "rechts", label: "▶", col: "col-start-3 row-start-2" },
  ];

  // Spickzettel je nach Lektion.
  const cheats: string[] = [];
  cheats.push('taste("rechts") · onUpdate(() => {…})');
  if (lesson.gravity) cheats.push("fuchs.springe() · fuchs.amBoden");
  if (lesson.targets?.length) cheats.push("beimEinsammeln(() => {…}) · hud(text)");
  if (lesson.enemies?.length) cheats.push("gegner[0].x · gegner[0].y");
  if (lesson.key.startsWith("w8")) cheats.push("zufall(1, 3)");

  return (
    <div>
      {status === "win" && <Confetti />}
      <div className="mb-3">
        <h1 className="text-xl font-semibold">{lesson.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 px-3 py-1.5 text-sm font-medium">
            🎯 {lesson.goal}
          </span>
          {lesson.timeLimit != null && time != null && (
            <span
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                time < 6 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              ⏱ {Math.ceil(time)}s
            </span>
          )}
          {hud && (
            <span className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-sm font-semibold">
              {hud}
            </span>
          )}
        </div>
      </div>
      <ExplainBox text={lesson.explain} />

      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-3 mb-3 flex flex-col items-center gap-3">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          width={lesson.cols * CELL}
          height={lesson.rows * CELL}
          className="max-w-full h-auto rounded-lg outline-none"
          style={{ width: lesson.cols * CELL, maxWidth: "100%" }}
        />
        <div className="flex items-end gap-4 sm:hidden select-none">
          <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
            {DPAD.map((b) => (
              <button
                key={b.name}
                className={`${b.col} size-11 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-lg font-bold active:bg-violet-500 active:text-white`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  pad(b.name, true);
                }}
                onPointerUp={() => pad(b.name, false)}
                onPointerLeave={() => pad(b.name, false)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button
            className="size-11 rounded-xl bg-amber-400 text-white text-lg font-bold active:scale-95"
            onPointerDown={(e) => {
              e.preventDefault();
              pad("turbo", true);
            }}
            onPointerUp={() => pad("turbo", false)}
            onPointerLeave={() => pad("turbo", false)}
            title="Turbo / Leertaste"
          >
            ⚡
          </button>
        </div>
        <p className="text-xs text-neutral-400 hidden sm:block">
          Steuerung: Pfeiltasten{lesson.key.startsWith("w4") ? " + Leertaste (Turbo)" : ""} · klicke zuerst ins Spielfeld
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center justify-between bg-neutral-900 px-3 py-2">
          <span className="text-xs font-semibold text-neutral-400">DEIN CODE</span>
          <div className="flex gap-2">
            <button onClick={stopAll} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-800">
              <Square size={13} /> Stopp
            </button>
            <button onClick={run} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:opacity-90">
              {status === "running" ? <Loader2 className="animate-spin" size={13} /> : <Play size={13} />} Start
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => saveCode(e.target.value)}
          onKeyDown={onEditorKey}
          spellCheck={false}
          rows={8}
          className="w-full bg-neutral-950 text-neutral-100 font-mono text-sm p-3 leading-relaxed focus:outline-none resize-y"
          style={{ tabSize: 2 }}
        />
      </div>

      {message && (
        <p
          className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
            status === "win"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : status === "error"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          {message}
          {status === "win" && !alreadyDone && " +🪙"}
        </p>
      )}

      {status === "win" && <NextButton lessonKey={lesson.key} onOpen={onOpen} />}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-900/50 p-4 text-sm">
          <div className="font-semibold mb-2">🧰 Deine Befehle</div>
          <ul className="space-y-1 font-mono text-xs text-neutral-600 dark:text-neutral-300">
            {cheats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <HelpPanel
          lessonKey={lesson.key}
          hints={lesson.hints}
          solution={lesson.solution}
          onUseSolution={() => saveCode(lesson.solution)}
        />
      </div>

      <UnityBridge js={lesson.bridgeJs} cs={lesson.bridgeCs} />
    </div>
  );
}
