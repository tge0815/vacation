"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Check,
  Lock,
  Palette,
  Eraser,
  Undo2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { DRAW_WORLDS, drawMeta, findDraw, DRAW_ORDER, type DrawLesson } from "./lessons";

const SIZE = 340; // Zeichenfläche (quadratisch)

const COLORS = ["#26242b", "#8a5a44", "#e23d54", "#2f6df6", "#f7b32b", "#39b98a", "#ffffff"];
const BRUSHES = [3, 6, 11];

export function DrawLab({ userId }: { userId: number }) {
  const router = useRouter();
  const [done, setDone] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [lessonKey, setLessonKey] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  const load = useCallback(() => {
    fetch(`/api/draw/progress?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { done?: string[]; coins?: number }) => {
        setDone(d.done ?? []);
        setCoins(d.coins ?? 0);
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    load();
    // Freischaltung wie bei der Spiele-Werkstatt: erst der heutige Lernweg.
    fetch(`/api/path?userId=${userId}`)
      .then((r) => r.json())
      .then((p: { allRequiredDone?: boolean }) => setUnlocked(Boolean(p.allRequiredDone)))
      .catch(() => setUnlocked(true));
  }, [load, userId]);

  const lesson = lessonKey ? findDraw(lessonKey) : undefined;

  function markDone(key: string, newCoins: number) {
    setCoins(newCoins);
    setDone((d) => (d.includes(key) ? d : [...d, key]));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => (lessonKey ? setLessonKey(null) : router.push(`/kind/${userId}`))}
          className="pill pill-sm"
        >
          <ArrowLeft size={15} /> {lessonKey ? "Übersicht" : "Zurück"}
        </button>
        <span className="pill pill-sm pill-peach">🪙 {coins}</span>
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
          <h1 className="text-xl font-extrabold">Noch abgeschlossen</h1>
          <p className="dl-muted font-semibold mt-2 max-w-sm mx-auto">
            Die Zeichen-Werkstatt schaltet sich frei, sobald du heute deinen Lernweg geschafft hast.
            Erst üben – dann zeichnen! 🦊
          </p>
          <button onClick={() => router.push(`/kind/${userId}`)} className="pill pill-lilac mt-5 px-5 py-3">
            Zu den Übungen
          </button>
        </div>
      ) : lesson ? (
        <LessonView
          userId={userId}
          lesson={lesson}
          alreadyDone={done.includes(lesson.key)}
          onOpen={setLessonKey}
          onCompleted={(c) => markDone(lesson.key, c)}
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
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-pink-500/10 text-pink-500 mb-3">
          <Palette size={30} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Zeichen-Werkstatt</h1>
        <p className="dl-muted mt-1 text-sm font-semibold">
          Manga zeichnen lernen – Schritt für Schritt. Von den ersten Strichen bis zur eigenen Figur.
          Zeichne direkt hier auf dem Bildschirm über die Hilfslinien.
        </p>
      </div>

      <div className="space-y-8">
        {DRAW_WORLDS.map((world, wi) => {
          const prev = DRAW_WORLDS[wi - 1];
          const worldUnlocked = wi === 0 || (prev?.keys.every((k) => done.includes(k)) ?? true);
          return (
            <div key={world.n}>
              <h2 className="text-xs font-extrabold uppercase tracking-wide dl-muted mb-2 flex items-center gap-2">
                {world.title}
                {!worldUnlocked && <Lock size={12} />}
              </h2>
              <div className="space-y-3">
                {world.keys.map((key, i) => {
                  const meta = drawMeta(key)!;
                  const isDone = done.includes(key);
                  const locked = !worldUnlocked || (i > 0 && !done.includes(world.keys[i - 1]));
                  return (
                    <button
                      key={key}
                      onClick={() => !locked && onOpen(key)}
                      disabled={locked}
                      className={`sticker w-full flex items-center gap-3 p-4 text-left transition ${
                        locked ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
                      }`}
                    >
                      <span
                        className={`shrink-0 size-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          isDone ? "bg-emerald-500" : "bg-pink-500"
                        }`}
                      >
                        {isDone ? <Check size={20} /> : i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold">{meta.title}</div>
                        <div className="text-xs dl-muted truncate font-semibold">{meta.goal}</div>
                      </div>
                      {locked ? (
                        <Lock size={18} className="text-neutral-400" />
                      ) : (
                        <span className="text-xs font-bold text-amber-500">🪙 {meta.coins}</span>
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

function LessonView({
  userId,
  lesson,
  alreadyDone,
  onOpen,
  onCompleted,
}: {
  userId: number;
  lesson: DrawLesson;
  alreadyDone: boolean;
  onOpen: (k: string) => void;
  onCompleted: (coins: number) => void;
}) {
  const guideRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<ImageData[]>([]);

  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(BRUSHES[1]);
  const [eraser, setEraser] = useState(false);
  const [guideOn, setGuideOn] = useState(true);
  const [finished, setFinished] = useState(false);
  const [awardMsg, setAwardMsg] = useState<string | null>(null);

  // Vorlage/Hilfslinien einmal (und bei Lektionswechsel) zeichnen.
  useEffect(() => {
    const g = guideRef.current?.getContext("2d");
    if (g) {
      g.clearRect(0, 0, SIZE, SIZE);
      lesson.guide(g, SIZE, SIZE);
    }
    // Zeichenebene leeren + Historie zurücksetzen.
    const d = drawRef.current?.getContext("2d");
    if (d) d.clearRect(0, 0, SIZE, SIZE);
    undoStack.current = [];
    setFinished(false);
    setAwardMsg(null);
  }, [lesson.key]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = drawRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  }

  function pushUndo() {
    const d = drawRef.current?.getContext("2d");
    if (!d) return;
    undoStack.current.push(d.getImageData(0, 0, SIZE, SIZE));
    if (undoStack.current.length > 25) undoStack.current.shift();
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = true;
    last.current = pos(e);
    stroke(e); // Punkt setzen (Antippen zeichnet auch)
  }
  function stroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const d = drawRef.current?.getContext("2d");
    if (!d) return;
    const p = pos(e);
    const from = last.current ?? p;
    d.save();
    d.lineCap = "round";
    d.lineJoin = "round";
    d.lineWidth = eraser ? brush * 2.4 : brush;
    if (eraser) d.globalCompositeOperation = "destination-out";
    else d.strokeStyle = color;
    d.beginPath();
    d.moveTo(from.x, from.y);
    d.lineTo(p.x, p.y);
    d.stroke();
    d.restore();
    last.current = p;
  }
  function end() {
    drawing.current = false;
    last.current = null;
  }

  function undo() {
    const d = drawRef.current?.getContext("2d");
    const img = undoStack.current.pop();
    if (d && img) d.putImageData(img, 0, 0);
  }
  function clearDraw() {
    const d = drawRef.current?.getContext("2d");
    if (!d) return;
    pushUndo();
    d.clearRect(0, 0, SIZE, SIZE);
  }

  async function finish() {
    setFinished(true);
    try {
      const res = await fetch("/api/draw/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lessonKey: lesson.key }),
      });
      const d = (await res.json()) as { coins?: number; awarded?: boolean };
      if (typeof d.coins === "number") onCompleted(d.coins);
      setAwardMsg(d.awarded ? `Geschafft! +🪙 ${lesson.coins}` : "Schön geübt! ⭐");
    } catch {
      setAwardMsg("Geschafft! ⭐");
    }
  }

  const nextKey = DRAW_ORDER[DRAW_ORDER.indexOf(lesson.key) + 1];

  return (
    <div>
      {finished && <Confetti />}
      <div className="mb-3">
        <h1 className="text-xl font-extrabold">{lesson.title}</h1>
        <p className="mt-1 inline-flex items-center gap-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-300 px-3 py-1.5 text-sm font-bold">
          🎯 {lesson.goal}
        </p>
      </div>

      <div className="sticker p-4 text-sm font-semibold mb-3">{lesson.explain}</div>

      {/* Schritte */}
      <ol className="mb-4 space-y-1.5">
        {lesson.steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm font-semibold">
            <span className="shrink-0 size-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      {/* Zeichenfläche: Vorlage (grau) + Zeichenebene darüber */}
      <div className="flex justify-center">
        <div
          className="relative rounded-2xl overflow-hidden border-[2.5px] bg-white"
          style={{ borderColor: "var(--dl-outline)", boxShadow: "5px 5px 0 var(--dl-shadow)", width: SIZE, maxWidth: "100%", aspectRatio: "1 / 1" }}
        >
          <canvas
            ref={guideRef}
            width={SIZE}
            height={SIZE}
            className="absolute inset-0 w-full h-full"
            style={{ display: guideOn ? "block" : "none" }}
          />
          <canvas
            ref={drawRef}
            width={SIZE}
            height={SIZE}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            onPointerDown={start}
            onPointerMove={stroke}
            onPointerUp={end}
            onPointerCancel={end}
            onPointerLeave={end}
          />
        </div>
      </div>

      {/* Werkzeuge */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {COLORS.map((col) => (
          <button
            key={col}
            onClick={() => {
              setColor(col);
              setEraser(false);
            }}
            className={`size-8 rounded-full border-[2.5px] transition ${
              color === col && !eraser ? "scale-110" : ""
            }`}
            style={{
              background: col,
              borderColor: color === col && !eraser ? "var(--dl-outline)" : "rgba(0,0,0,0.15)",
            }}
            title="Farbe"
          />
        ))}
        <span className="w-px h-7 bg-neutral-300 dark:bg-neutral-700 mx-1" />
        {BRUSHES.map((b) => (
          <button
            key={b}
            onClick={() => setBrush(b)}
            className={`size-8 rounded-xl border-[2.5px] flex items-center justify-center ${
              brush === b ? "bg-neutral-100 dark:bg-neutral-800" : ""
            }`}
            style={{ borderColor: brush === b ? "var(--dl-outline)" : "rgba(0,0,0,0.15)" }}
            title="Strichstärke"
          >
            <span className="rounded-full bg-neutral-800 dark:bg-neutral-200" style={{ width: b, height: b }} />
          </button>
        ))}
        <span className="w-px h-7 bg-neutral-300 dark:bg-neutral-700 mx-1" />
        <button
          onClick={() => setEraser((v) => !v)}
          className={`pill pill-sm ${eraser ? "pill-sun" : ""}`}
          title="Radiergummi"
        >
          <Eraser size={15} />
        </button>
        <button onClick={undo} className="pill pill-sm" title="Rückgängig">
          <Undo2 size={15} />
        </button>
        <button onClick={clearDraw} className="pill pill-sm" title="Alles löschen">
          <Trash2 size={15} />
        </button>
        <button onClick={() => setGuideOn((v) => !v)} className="pill pill-sm" title="Hilfslinien an/aus">
          {guideOn ? <EyeOff size={15} /> : <Eye size={15} />}
          <span className="hidden sm:inline">{guideOn ? "Vorlage aus" : "Vorlage an"}</span>
        </button>
      </div>

      {/* Tipps */}
      {lesson.tips && lesson.tips.length > 0 && (
        <div className="sticker p-4 mt-4 text-sm">
          <div className="font-extrabold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" /> Tipps
          </div>
          <ul className="space-y-1 font-semibold dl-muted list-disc pl-5">
            {lesson.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fertig */}
      {awardMsg ? (
        <div className="mt-4 space-y-3">
          <p className="sticker p-4 text-center font-extrabold" style={{ background: "var(--dl-green)", color: "#26242b" }}>
            {awardMsg}
            {alreadyDone && " (schon gemeistert)"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {nextKey && (
              <button onClick={() => onOpen(nextKey)} className="pill pill-peach px-5 py-3">
                Nächste Lektion →
              </button>
            )}
            <button onClick={() => onOpen("")} className="pill px-5 py-3">
              Zur Übersicht
            </button>
          </div>
        </div>
      ) : (
        <button onClick={finish} className="pill pill-mint w-full py-3 mt-4">
          <Check size={18} /> Fertig – ich hab's gezeichnet!
        </button>
      )}
    </div>
  );
}
