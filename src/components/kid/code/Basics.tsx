"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Confetti } from "@/components/Confetti";

// --- Interaktive Anatomie: drehbarer Würfel (Mesh -> Textur -> Material) ---
const V = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const F = [[4, 5, 6, 7], [1, 0, 3, 2], [5, 1, 2, 6], [0, 4, 7, 3], [7, 6, 2, 3], [0, 1, 5, 4]];
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];
const SKINS = [
  { name: "Fuchs", faces: ["#f97316", "#fb923c", "#ea580c", "#fdba74", "#c2410c", "#fed7aa"] },
  { name: "Ozean", faces: ["#0ea5e9", "#38bdf8", "#0369a1", "#7dd3fc", "#075985", "#bae6fd"] },
  { name: "Wald", faces: ["#16a34a", "#4ade80", "#15803d", "#86efac", "#166534", "#bbf7d0"] },
  { name: "Beere", faces: ["#7c3aed", "#a78bfa", "#6d28d9", "#c4b5fd", "#5b21b6", "#ddd6fe"] },
];
type Mode = "mesh" | "texture" | "material";
const MODE_TEXT: Record<Mode, [string, string]> = {
  mesh: ["Gerüst (Mesh)", "Das nackte Drahtgitter aus lauter Dreiecken. Es bestimmt nur die Form – noch keine Farbe."],
  texture: ["Textur", "Jetzt kleben wir Farben/ein Bild auf die Flächen – wie Aufkleber auf das Gerüst. Form gleich, Aussehen neu."],
  material: ["Material & Licht", "Die Oberfläche reagiert aufs Licht – hellere und dunklere Seiten. So wirkt der Körper echt und 3D."],
};

function CubeExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("mesh");
  const [skin, setSkin] = useState(0);
  const [spin, setSpin] = useState(true);
  const st = useRef({ mode: "mesh" as Mode, skin: 0, spin: true, angle: 0.6, ax: -0.5, drag: false, lx: 0, ly: 0 });

  useEffect(() => {
    st.current.mode = mode;
    st.current.skin = skin;
    st.current.spin = spin;
  }, [mode, skin, spin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const s = canvas.width;
    const rot = (p: number[]) => {
      const { angle, ax } = st.current;
      const x1 = p[0] * Math.cos(angle) - p[2] * Math.sin(angle);
      const z1 = p[0] * Math.sin(angle) + p[2] * Math.cos(angle);
      const y2 = p[1] * Math.cos(ax) - z1 * Math.sin(ax);
      const z2 = p[1] * Math.sin(ax) + z1 * Math.cos(ax);
      return [x1, y2, z2];
    };
    const proj = (p: number[]) => {
      const d = 4, f = d / (d - p[2]);
      return [s / 2 + p[0] * f * s * 0.28, s / 2 + p[1] * f * s * 0.28];
    };
    const shade = (hex: string, k: number) => {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.min(255, ((n >> 16) & 255) * k) | 0;
      const g = Math.min(255, ((n >> 8) & 255) * k) | 0;
      const b = Math.min(255, (n & 255) * k) | 0;
      return `rgb(${r},${g},${b})`;
    };
    const draw = () => {
      ctx.clearRect(0, 0, s, s);
      const RV = V.map(rot);
      if (st.current.mode === "mesh") {
        ctx.strokeStyle = "#6ea0ff";
        ctx.lineWidth = 2.4;
        ctx.lineJoin = "round";
        for (const [a, b] of EDGES) {
          const pa = proj(RV[a]), pb = proj(RV[b]);
          ctx.beginPath();
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
          ctx.stroke();
        }
        ctx.fillStyle = "#6ea0ff";
        for (const p of RV) {
          const q = proj(p);
          ctx.beginPath();
          ctx.arc(q[0], q[1], 3.6, 0, 7);
          ctx.fill();
        }
      } else {
        const light = [0.4, -0.7, 0.6];
        const faces = F.map((idx, i) => {
          const pts = idx.map((j) => RV[j]);
          const z = pts.reduce((a, p) => a + p[2], 0) / 4;
          return { idx, i, z, pts };
        }).sort((a, b) => a.z - b.z);
        for (const face of faces) {
          const a = face.pts[0], b = face.pts[1], c = face.pts[2];
          const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
          const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
          const nx = u[1] * v[2] - u[2] * v[1];
          const ny = u[2] * v[0] - u[0] * v[2];
          const nz = u[0] * v[1] - u[1] * v[0];
          const L = Math.hypot(nx, ny, nz) || 1;
          if (nz / L <= 0) continue;
          let col = SKINS[st.current.skin].faces[face.i];
          if (st.current.mode === "material") {
            const k = 0.55 + 0.75 * Math.max(0, (nx * light[0] + ny * light[1] + nz * light[2]) / L);
            col = shade(col, k);
          }
          ctx.beginPath();
          face.idx.forEach((j, k) => {
            const q = proj(RV[j]);
            if (k) ctx.lineTo(q[0], q[1]);
            else ctx.moveTo(q[0], q[1]);
          });
          ctx.closePath();
          ctx.fillStyle = col;
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,.18)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      if (st.current.spin && !st.current.drag) st.current.angle += 0.008;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  function down(e: React.PointerEvent) {
    st.current.drag = true;
    setSpin(false);
    st.current.lx = e.clientX;
    st.current.ly = e.clientY;
    canvasRef.current?.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    if (!st.current.drag) return;
    st.current.angle += (e.clientX - st.current.lx) * 0.01;
    st.current.ax += (e.clientY - st.current.ly) * 0.01;
    st.current.lx = e.clientX;
    st.current.ly = e.clientY;
  }
  function up() {
    st.current.drag = false;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[260px_1fr] items-center">
      <div className="rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden aspect-square">
        <canvas
          ref={canvasRef}
          width={520}
          height={520}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="w-full h-full"
          style={{ touchAction: "none", cursor: "grab" }}
        />
      </div>
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {(["mesh", "texture", "material"] as Mode[]).map((m, i) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-xl px-3 py-2 text-sm font-semibold border transition ${
                mode === m
                  ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {i + 1} · {m === "mesh" ? "Gerüst" : m === "texture" ? "+ Textur" : "+ Material"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => {
              setSkin((s) => (s + 1) % SKINS.length);
              if (mode === "mesh") setMode("texture");
            }}
            className="rounded-xl px-3 py-2 text-sm font-semibold border border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300"
          >
            🎨 Skin: {SKINS[skin].name}
          </button>
          <button
            onClick={() => setSpin((s) => !s)}
            className="rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800"
          >
            {spin ? "⏸" : "▶"} Drehung
          </button>
        </div>
        <p className="text-sm">
          <b>{MODE_TEXT[mode][0]}:</b> <span className="text-neutral-600 dark:text-neutral-300">{MODE_TEXT[mode][1]}</span>
        </p>
      </div>
    </div>
  );
}

// --- Glossar ---
const TERMS: { t: string; en: string; d: string }[] = [
  { t: "GameObject", en: "Spiel-Objekt", d: "Jedes Ding im Spiel: Spieler, Münze, Kamera, Licht. Alles ist ein GameObject." },
  { t: "Component", en: "Baustein", d: "Fähigkeiten, die ein GameObject bekommt – z. B. ein Skript oder ein Collider." },
  { t: "Szene", en: "Scene", d: "Der Schauplatz / das Level – die Bühne, auf der die GameObjects stehen." },
  { t: "Modell / Mesh", en: "Model / Mesh", d: "Das 3D-Gerüst aus vielen Dreiecken. Es bestimmt nur die Form – noch ohne Farbe." },
  { t: "Textur", en: "Texture", d: "Das Bild, das auf das Gerüst geklebt wird – wie Aufkleber auf die Form." },
  { t: "Material", en: "Material", d: "Die Regeln fürs Aussehen: welche Textur, wie glänzend/matt, wie das Licht wirkt." },
  { t: "Skin", en: "Skin", d: "Ein anderes Aussehen für dieselbe Figur – gleiches Modell, andere Farben. Wie ein Kostüm." },
  { t: "Sprite", en: "Sprite", d: "Ein flaches Bild für 2D-Spiele – statt eines 3D-Modells." },
  { t: "Collider", en: "Collider", d: "Die unsichtbare Hülle für Zusammenstöße – sie sagt, wo etwas anstößt." },
  { t: "Rigidbody", en: "Physik", d: "Macht ein Ding echt: Schwerkraft, Stöße, Fallen und Rollen." },
  { t: "Prefab", en: "Bauplan", d: "Einmal bauen, beliebig oft platzieren – z. B. 100 Gegner aus einem Prefab." },
  { t: "Frame / Update()", en: "Bild pro Sekunde", d: "Das Spiel zeichnet viele Bilder pro Sekunde. Jedes Bild = ein Frame; Update() läuft in jedem Frame." },
];

// --- Quiz ---
type Q = { q: string; options: string[]; correct: number };
const QUIZ: Q[] = [
  { q: "Was ist eine Textur?", options: ["Das Drahtgitter-Gerüst (die Form)", "Das Bild, das auf die Form geklebt wird", "Die Schwerkraft"], correct: 1 },
  { q: "Ein Skin ist …", options: ["ein neues Aussehen für dieselbe Figur", "ein Zusammenstoß", "eine Schleife"], correct: 0 },
  { q: "Was ist ein GameObject?", options: ["nur der Spieler", "jedes Ding im Spiel (Spieler, Münze, Kamera …)", "ein Bild für 2D"], correct: 1 },
  { q: "Was macht Update()?", options: ["läuft einmal am Anfang", "läuft in jedem Bild (Frame)", "sperrt eine App"], correct: 1 },
];

export function Basics({
  userId,
  alreadyDone,
  onCompleted,
}: {
  userId: number;
  alreadyDone: boolean;
  onCompleted: (coins: number) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [checked, setChecked] = useState(false);
  const [won, setWon] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const allCorrect = answers.every((a, i) => a === QUIZ[i].correct);

  async function check() {
    setChecked(true);
    if (allCorrect && !won) {
      setWon(true);
      try {
        const res = await fetch("/api/code/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, lessonKey: "basics" }),
        });
        const d = (await res.json()) as { coins?: number };
        if (typeof d.coins === "number") onCompleted(d.coins);
      } catch {}
    }
  }

  return (
    <div>
      {won && <Confetti />}
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Grundlagen: Woraus besteht ein Spiel?</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Die wichtigsten Begriffe der Spiele-Profis – zum Anfassen und Verstehen.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-4 mb-6">
        <h2 className="font-semibold mb-3">🧊 Probier's aus: ein Spiel-Objekt entsteht</h2>
        <CubeExplorer />
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-3">📖 Das Wörterbuch</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TERMS.map((term) => (
            <div key={term.t} className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-3.5">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{term.t}</span>
                <span className="text-xs text-neutral-400">{term.en}</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{term.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-4">
        <h2 className="font-semibold mb-1">🧠 Kurzes Quiz</h2>
        <p className="text-sm text-neutral-500 mb-4">Alle vier richtig → Münzen! {alreadyDone && "(schon geschafft)"}</p>
        <div className="space-y-5">
          {QUIZ.map((item, qi) => (
            <div key={qi}>
              <div className="font-medium mb-2">{qi + 1}. {item.q}</div>
              <div className="grid gap-2">
                {item.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  const showRight = checked && oi === item.correct;
                  const showWrong = checked && picked && oi !== item.correct;
                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (won) return;
                        setChecked(false);
                        setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
                      }}
                      className={`flex items-center gap-2 text-left rounded-xl border-2 px-3 py-2 text-sm transition ${
                        showRight
                          ? "border-emerald-500 bg-emerald-500/10"
                          : showWrong
                            ? "border-rose-500 bg-rose-500/10"
                            : picked
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <span className="flex-1">{opt}</span>
                      {showRight && <Check size={16} className="text-emerald-500" />}
                      {showWrong && <X size={16} className="text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {checked && !allCorrect && (
          <p className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-400">
            Fast! Schau dir die rot markierten nochmal an und probier's erneut. 🔎
          </p>
        )}
        {won && (
          <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Stark! Alle Begriffe sitzen. {!alreadyDone && "+🪙"}
          </p>
        )}

        {!won && (
          <button
            onClick={check}
            disabled={!allAnswered}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 text-white px-5 py-2.5 font-semibold disabled:opacity-40 hover:opacity-90"
          >
            Antworten prüfen
          </button>
        )}
      </section>
    </div>
  );
}
