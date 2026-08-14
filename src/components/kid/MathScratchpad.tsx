"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, PencilLine, ChevronDown, ChevronUp, Pencil, Keyboard } from "lucide-react";

type Mode = "draw" | "type";

// Rechenkästchen (kariertes „Tabellenblatt") zum schriftlichen Rechnen unter
// Mathe-Aufgaben. Zwei Modi:
//  - Zeichnen: mit Finger/Apple Pencil aufs Karopapier (ideal fürs iPad)
//  - Tippen: freies Textfeld (ideal fürs Handy)
// Reine Nebenrechnung – wird nicht bewertet.
export function MathScratchpad() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<Mode>("draw");
  const [typed, setTyped] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Modus merken (pro Gerät).
  useEffect(() => {
    try {
      const m = localStorage.getItem("lc-mathpad-mode");
      if (m === "type" || m === "draw") setMode(m);
    } catch {}
  }, []);
  function switchMode(m: Mode) {
    setMode(m);
    try {
      localStorage.setItem("lc-mathpad-mode", m);
    } catch {}
  }

  useEffect(() => {
    if (!open || mode !== "draw") return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const setup = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = "#1e3a8a";
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [open, mode]);

  function point(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function down(e: React.PointerEvent) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }
  function up() {
    drawing.current = false;
    last.current = null;
  }
  function clear() {
    if (mode === "type") {
      setTyped("");
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  const squaredBg = {
    backgroundColor: "#ffffff",
    backgroundImage:
      "repeating-linear-gradient(#dbeafe 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, #dbeafe 0 1px, transparent 1px 26px)",
  } as const;

  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300"
        >
          <PencilLine size={16} className="text-sky-500" />
          Nebenrechnung
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {open && (
          <div className="flex items-center gap-2">
            {/* Modus-Umschalter */}
            <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchMode("draw")}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${
                  mode === "draw" ? "bg-sky-500 text-white" : "text-neutral-500"
                }`}
              >
                <Pencil size={13} /> Zeichnen
              </button>
              <button
                type="button"
                onClick={() => switchMode("type")}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${
                  mode === "type" ? "bg-sky-500 text-white" : "text-neutral-500"
                }`}
              >
                <Keyboard size={13} /> Tippen
              </button>
            </div>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-500"
            >
              <Eraser size={15} /> Löschen
            </button>
          </div>
        )}
      </div>

      {open && mode === "draw" && (
        <div ref={wrapRef} className="relative h-64 w-full" style={squaredBg}>
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            onPointerCancel={up}
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: "none", cursor: "crosshair" }}
          />
        </div>
      )}

      {open && mode === "type" && (
        <textarea
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          spellCheck={false}
          rows={7}
          placeholder="Tippe deine Rechnung, z. B.&#10;  34&#10;+ 58&#10;----&#10;  92"
          className="w-full h-64 resize-none font-mono text-base leading-[26px] text-blue-900 p-3 focus:outline-none"
          style={{ ...squaredBg, tabSize: 4 }}
        />
      )}
    </div>
  );
}
