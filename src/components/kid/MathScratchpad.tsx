"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, PencilLine, ChevronDown, ChevronUp } from "lucide-react";

// Rechenkästchen (kariertes „Tabellenblatt") zum schriftlichen Rechnen unter
// Mathe-Aufgaben. Zeichnen mit Finger oder Apple Pencil (Pointer-Events).
// Reine Nebenrechnung – wird nicht bewertet. Das Papier bleibt bewusst hell
// (auch im Dark-Mode), damit es wie echtes Karopapier aussieht.
export function MathScratchpad() {
  const [open, setOpen] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
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
      ctx.strokeStyle = "#1e3a8a"; // dunkelblauer „Stift"
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [open]);

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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
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
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-500"
          >
            <Eraser size={15} /> Löschen
          </button>
        )}
      </div>
      {open && (
        <div
          ref={wrapRef}
          className="relative h-64 w-full"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage:
              "repeating-linear-gradient(#dbeafe 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, #dbeafe 0 1px, transparent 1px 26px)",
          }}
        >
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
    </div>
  );
}
