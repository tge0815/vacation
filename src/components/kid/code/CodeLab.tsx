"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, RotateCcw, Loader2, Check, Lock, Gamepad2, Boxes } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { WORLDS, lessonMeta, findSeq, findGame, type SeqLesson } from "./lessons";
import { Basics } from "./Basics";
import { GameLessonView } from "./GameLessonView";
import { HelpPanel, ExplainBox } from "./HelpPanel";
import { NextButton, UnityBridge } from "./LessonChrome";

const CELL = 60;

// Sequenz-Engine (Welt 1): Kind-Code sammelt Bewegungs-Schritte im Web-Worker.
const WORKER_SRC = `
self.onmessage = (e) => {
  const code = e.data;
  const steps = [];
  const MAX = 600;
  function push(dx, dy, n) {
    n = Math.floor(n) || 0;
    for (let i = 0; i < n; i++) { if (steps.length >= MAX) throw new Error("Puh, zu viele Schritte!"); steps.push({ dx: dx, dy: dy }); }
  }
  const fuchs = { rechts:(n)=>push(1,0,n), links:(n)=>push(-1,0,n), hoch:(n)=>push(0,-1,n), runter:(n)=>push(0,1,n) };
  function wiederhole(n, fn) {
    n = Math.min(Math.max(0, Math.floor(n) || 0), 200);
    if (typeof fn !== "function") throw new Error("wiederhole braucht eine Funktion: wiederhole(3, () => { ... })");
    for (let i = 0; i < n; i++) fn();
  }
  try { new Function("fuchs", "wiederhole", code)(fuchs, wiederhole); self.postMessage({ ok: true, steps: steps }); }
  catch (err) { self.postMessage({ ok: false, error: String((err && err.message) || err) }); }
};
`;

type Status = "idle" | "running" | "win" | "fail" | "error";

export function CodeLab({ userId }: { userId: number }) {
  const router = useRouter();
  const [done, setDone] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [lessonKey, setLessonKey] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  const load = useCallback(() => {
    fetch(`/api/code/progress?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { done?: string[]; coins?: number }) => {
        setDone(d.done ?? []);
        setCoins(d.coins ?? 0);
      })
      .catch(() => {});
  }, [userId]);
  useEffect(() => {
    load();
    fetch(`/api/progress?userId=${userId}`)
      .then((r) => r.json())
      .then((p: { subjectsWithGoal?: number; subjectsReached?: number }) => {
        const g = p.subjectsWithGoal ?? 0;
        const reached = p.subjectsReached ?? 0;
        setUnlocked(g === 0 || reached >= g);
      })
      .catch(() => setUnlocked(true));
  }, [load, userId]);

  const seq = lessonKey ? findSeq(lessonKey) : undefined;
  const game = lessonKey ? findGame(lessonKey) : undefined;

  function markDone(key: string, newCoins: number) {
    setCoins(newCoins);
    setDone((d) => (d.includes(key) ? d : [...d, key]));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => (lessonKey ? setLessonKey(null) : router.push(`/kind/${userId}`))}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> {lessonKey ? "Übersicht" : "Zurück"}
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
          🪙 {coins}
        </span>
      </header>

      {unlocked === null ? (
        <div className="flex justify-center py-20 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : !unlocked ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 mb-4">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-semibold">Noch abgeschlossen</h1>
          <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
            Die Spiele-Werkstatt schaltet sich frei, sobald du heute alle Lern-Tagesziele geschafft
            hast. Erst üben – dann coden! 🦊
          </p>
          <button
            onClick={() => router.push(`/kind/${userId}`)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-violet-500 text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            Zu den Übungen
          </button>
        </div>
      ) : lessonKey === "basics" ? (
        <Basics
          userId={userId}
          alreadyDone={done.includes("basics")}
          onCompleted={(c) => markDone("basics", c)}
        />
      ) : game ? (
        <GameLessonView
          userId={userId}
          lesson={game}
          alreadyDone={done.includes(game.key)}
          onOpen={setLessonKey}
          onCompleted={(c) => markDone(game.key, c)}
        />
      ) : seq ? (
        <SeqLessonView
          userId={userId}
          lesson={seq}
          alreadyDone={done.includes(seq.key)}
          onOpen={setLessonKey}
          onCompleted={(c) => markDone(seq.key, c)}
        />
      ) : (
        <Home done={done} onOpen={setLessonKey} />
      )}
    </main>
  );
}

function Home({ done, onOpen }: { done: string[]; onOpen: (k: string) => void }) {
  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-violet-500/10 text-violet-500 mb-3">
          <Gamepad2 size={30} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Spiele-Werkstatt</h1>
        <p className="text-neutral-500 mt-1 text-sm">
          In 10 Welten vom ersten Befehl zum eigenen Spiel. Du schreibst echten Code – und siehst
          sofort, was passiert.
        </p>
      </div>

      <div className="space-y-8">
        <button
          onClick={() => onOpen("basics")}
          className="w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition bg-white dark:bg-neutral-900 border-black/[0.06] dark:border-white/[0.06] hover:shadow-md hover:-translate-y-0.5"
        >
          <span
            className={`shrink-0 size-10 rounded-xl flex items-center justify-center text-white ${
              done.includes("basics") ? "bg-emerald-500" : "bg-sky-500"
            }`}
          >
            {done.includes("basics") ? <Check size={20} /> : <Boxes size={20} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">Grundlagen: Begriffe</div>
            <div className="text-xs text-neutral-500 truncate">
              GameObject, Modell, Textur, Skin … zum Anfassen
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-500">🪙 3</span>
        </button>

        {WORLDS.map((world, wi) => {
          const prev = WORLDS[wi - 1];
          const worldUnlocked = wi === 0 || (prev?.keys.every((k) => done.includes(k)) ?? true);
          return (
            <div key={world.n}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2 flex items-center gap-2">
                {world.title}
                {!worldUnlocked && <Lock size={12} />}
              </h2>
              <div className="space-y-3">
                {world.keys.map((key, i) => {
                  const meta = lessonMeta(key)!;
                  const isDone = done.includes(key);
                  const locked = !worldUnlocked || (i > 0 && !done.includes(world.keys[i - 1]));
                  return (
                    <button
                      key={key}
                      onClick={() => !locked && onOpen(key)}
                      disabled={locked}
                      className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        locked
                          ? "bg-neutral-100 dark:bg-neutral-900/50 border-transparent opacity-60 cursor-not-allowed"
                          : "bg-white dark:bg-neutral-900 border-black/[0.06] dark:border-white/[0.06] hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <span
                        className={`shrink-0 size-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          isDone ? "bg-emerald-500" : "bg-violet-500"
                        }`}
                      >
                        {isDone ? <Check size={20} /> : i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{meta.title}</div>
                        <div className="text-xs text-neutral-500 truncate">{meta.goal}</div>
                      </div>
                      {locked ? (
                        <Lock size={18} className="text-neutral-400" />
                      ) : (
                        <span className="text-xs font-semibold text-amber-500">🪙 {meta.coins}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SeqLessonView({
  userId,
  lesson,
  alreadyDone,
  onOpen,
  onCompleted,
}: {
  userId: number;
  lesson: SeqLesson;
  alreadyDone: boolean;
  onOpen: (k: string) => void;
  onCompleted: (coins: number) => void;
}) {
  const storageKey = `codelab:${userId}:${lesson.key}`;
  const [code, setCode] = useState(lesson.starter);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foxRef = useRef({ ...lesson.fox });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {}
    setCode(saved ?? lesson.starter);
    foxRef.current = { ...lesson.fox };
    setStatus("idle");
    setMessage(null);
    requestAnimationFrame(draw);
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.key]);

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }

  function cell(n: number) {
    return n * CELL + CELL / 2;
  }
  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const W = lesson.cols * CELL;
    const H = lesson.rows * CELL;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#eaf6ea";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#c3dcc3";
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
    ctx.font = `${Math.floor(CELL * 0.6)}px system-ui, sans-serif`;
    ctx.fillText("⭐", cell(lesson.star.x), cell(lesson.star.y));
    ctx.font = `${Math.floor(CELL * 0.66)}px system-ui, sans-serif`;
    ctx.fillText("🦊", cell(foxRef.current.x), cell(foxRef.current.y));
  }

  function saveCode(v: string) {
    setCode(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {}
  }

  function reset() {
    cleanup();
    foxRef.current = { ...lesson.fox };
    setStatus("idle");
    setMessage(null);
    draw();
  }

  function animate(steps: { dx: number; dy: number }[]) {
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i >= steps.length) {
        cleanup();
        if (foxRef.current.x === lesson.star.x && foxRef.current.y === lesson.star.y) win();
        else {
          setStatus("fail");
          setMessage("Fast! Der Fuchs steht noch nicht auf dem Stern. Schau nochmal auf die Zahlen. 🔎");
        }
        return;
      }
      const s = steps[i++];
      const nx = foxRef.current.x + s.dx;
      const ny = foxRef.current.y + s.dy;
      if (nx < 0 || nx >= lesson.cols || ny < 0 || ny >= lesson.rows) {
        cleanup();
        setStatus("fail");
        setMessage("Autsch! Der Fuchs ist vom Feld gefallen. Versuch's nochmal. 🍂");
        return;
      }
      foxRef.current = { x: nx, y: ny };
      draw();
    }, 170);
  }

  function run() {
    cleanup();
    foxRef.current = { ...lesson.fox };
    draw();
    setStatus("running");
    setMessage(null);
    const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    const timeout = setTimeout(() => {
      cleanup();
      setStatus("error");
      setMessage("Das hat zu lange gedauert – vielleicht eine Endlosschleife? 🌀");
    }, 1500);
    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(timeout);
      const d = e.data as { ok: boolean; steps?: { dx: number; dy: number }[]; error?: string };
      worker.terminate();
      workerRef.current = null;
      if (!d.ok) {
        setStatus("error");
        setMessage("Hoppla, im Code steckt ein Fehler: " + (d.error ?? "unbekannt"));
        return;
      }
      if (!d.steps || d.steps.length === 0) {
        setStatus("fail");
        setMessage("Der Fuchs hat sich nicht bewegt. Sag ihm, wohin er laufen soll! 🦊");
        return;
      }
      animate(d.steps);
    };
    worker.postMessage(code);
  }

  async function win() {
    setStatus("win");
    setMessage("Geschafft! ⭐ Der Fuchs ist am Ziel.");
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

  return (
    <div>
      {status === "win" && <Confetti />}
      <div className="mb-3">
        <h1 className="text-xl font-semibold">{lesson.title}</h1>
        <p className="mt-1 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 px-3 py-1.5 text-sm font-medium">
          🎯 {lesson.goal}
        </p>
      </div>
      <ExplainBox text={lesson.explain} />

      <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-3 mb-3 flex justify-center">
        <canvas
          ref={canvasRef}
          width={lesson.cols * CELL}
          height={lesson.rows * CELL}
          className="max-w-full h-auto rounded-lg"
          style={{ width: lesson.cols * CELL, maxWidth: "100%" }}
        />
      </div>

      <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center justify-between bg-neutral-900 px-3 py-2">
          <span className="text-xs font-semibold text-neutral-400">DEIN CODE</span>
          <div className="flex gap-2">
            <button onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-800">
              <RotateCcw size={13} /> Zurücksetzen
            </button>
            <button
              onClick={run}
              disabled={status === "running"}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {status === "running" ? <Loader2 className="animate-spin" size={13} /> : <Play size={13} />} Start
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => saveCode(e.target.value)}
          onKeyDown={onEditorKey}
          spellCheck={false}
          rows={7}
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
            <li>fuchs.rechts(n) · fuchs.links(n)</li>
            <li>fuchs.hoch(n) · fuchs.runter(n)</li>
            <li>wiederhole(n, () =&gt; {"{ ... }"})</li>
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
