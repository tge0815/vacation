"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, X, Globe, Map as MapIcon } from "lucide-react";
import { MapBoard, type MapData, type Country } from "./MapBoard";
import europeRaw from "@/data/europe.map.json";
import worldRaw from "@/data/world.map.json";

const EUROPE = europeRaw as MapData;
const WORLD = worldRaw as MapData;

type Region = "europe" | "world";
type Mode = "find" | "name";
type Round = { target: Country; mode: Mode; choices: string[] };
type Result = { correct: boolean; correctId: string; pickedId?: string; chosenName?: string };

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Grobe Fläche aus dem Pfad (für faire Zielauswahl auf der Weltkarte).
function area(d: string): number {
  const nums = d.match(/-?\d+/g);
  if (!nums) return 0;
  let minx = 1e9,
    miny = 1e9,
    maxx = -1e9,
    maxy = -1e9;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = +nums[i];
    const y = +nums[i + 1];
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  return (maxx - minx) * (maxy - miny);
}

export function MapSession({ userId }: { userId: number }) {
  const router = useRouter();
  const [ids, setIds] = useState<{ subjectId: number; topicId: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [coin, setCoin] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d: { subjects: { id: number; key: string; topics: { id: number; key: string }[] }[] }) => {
        const geo = d.subjects.find((s) => s.key === "geografie");
        const topic = geo?.topics.find((t) => t.key === "landkarte");
        if (geo && topic) setIds({ subjectId: geo.id, topicId: topic.id });
      })
      .catch(() => {});
  }, []);

  const mapData = region === "world" ? WORLD : EUROPE;

  // Zielländer: Europa alle, Welt nur die größten (fair anzuklicken).
  const targets = useMemo(() => {
    if (region === "world") {
      return [...WORLD.countries].sort((a, b) => area(b.d) - area(a.d)).slice(0, 60);
    }
    return EUROPE.countries;
  }, [region]);

  const newRound = useCallback((data: MapData, pool: Country[]) => {
    const target = pool[Math.floor(Math.random() * pool.length)];
    const mode: Mode = Math.random() < 0.5 ? "find" : "name";
    let choices: string[] = [];
    if (mode === "name") {
      const others = shuffle(data.countries.filter((c) => c.id !== target.id))
        .slice(0, 3)
        .map((c) => c.name);
      choices = shuffle([target.name, ...others]);
    }
    setRound({ target, mode, choices });
    setResult(null);
    startRef.current = Date.now();
  }, []);

  const start = useCallback(
    (r: Region) => {
      setRegion(r);
      setScore(0);
      setTotal(0);
      const data = r === "world" ? WORLD : EUROPE;
      const pool =
        r === "world"
          ? [...WORLD.countries].sort((a, b) => area(b.d) - area(a.d)).slice(0, 60)
          : EUROPE.countries;
      newRound(data, pool);
    },
    [newRound],
  );

  const log = useCallback(
    async (correct: boolean, answer: string, r: Round) => {
      if (!ids) return;
      setTotal((t) => t + 1);
      if (correct) setScore((s) => s + 1);
      try {
        const res = await fetch("/api/exercise/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            subjectId: ids.subjectId,
            topicId: ids.topicId,
            inputMode: "map",
            question: r.mode === "find" ? `Finde: ${r.target.name}` : "Welches Land ist markiert?",
            answer,
            solution: r.target.name,
            isCorrect: correct,
            durationSec: Math.round((Date.now() - startRef.current) / 1000),
          }),
        });
        const d = (await res.json()) as { reward?: { awarded: boolean } };
        if (d.reward?.awarded) setCoin(true);
      } catch {}
    },
    [ids, userId],
  );

  function pickOnMap(id: string) {
    if (!round || result || round.mode !== "find") return;
    const correct = id === round.target.id;
    setResult({ correct, correctId: round.target.id, pickedId: id });
    const country = mapData.countries.find((c) => c.id === id);
    log(correct, country?.name ?? id, round);
  }

  function chooseName(name: string) {
    if (!round || result || round.mode !== "name") return;
    const correct = name === round.target.name;
    setResult({ correct, correctId: round.target.id, chosenName: name });
    log(correct, name, round);
  }

  if (!ids) {
    return (
      <main className="flex-1 flex items-center justify-center text-neutral-400">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 flex-1 flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => (region ? setRegion(null) : router.push(`/kind/${userId}`))}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> {region ? "Karte wechseln" : "Zurück"}
        </button>
        {region && (
          <span className="text-sm text-neutral-500 nums">
            {score}/{total} richtig
          </span>
        )}
      </header>

      {coin && (
        <div className="mb-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 text-sm font-semibold text-center">
          🪙 Tagesziel geschafft — du hast einen Coin!
        </div>
      )}

      {!region ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Landkarte</h1>
          <p className="text-neutral-500">Welche Karte möchtest du üben?</p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => start("europe")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 w-36 hover:shadow-xl hover:-translate-y-1 transition"
            >
              <MapIcon size={36} className="text-cyan-500" />
              <span className="font-semibold">Europa</span>
              <span className="text-xs text-neutral-500">39 Länder</span>
            </button>
            <button
              onClick={() => start("world")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 w-36 hover:shadow-xl hover:-translate-y-1 transition"
            >
              <Globe size={36} className="text-blue-500" />
              <span className="font-semibold">Welt</span>
              <span className="text-xs text-neutral-500">die größten Länder</span>
            </button>
          </div>
        </div>
      ) : round ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] px-4 py-3 text-center font-semibold text-lg">
            {round.mode === "find" ? (
              <>
                Klick auf: <span className="text-cyan-600 dark:text-cyan-400">{round.target.name}</span>
              </>
            ) : (
              "Welches Land ist gelb markiert?"
            )}
          </div>

          <MapBoard
            map={mapData}
            pickable={round.mode === "find" && !result}
            highlightId={round.mode === "name" ? round.target.id : undefined}
            result={result ? { correctId: result.correctId, pickedId: result.pickedId } : null}
            onPick={pickOnMap}
          />

          {round.mode === "name" && !result && (
            <div className="grid grid-cols-2 gap-2">
              {round.choices.map((name) => (
                <button
                  key={name}
                  onClick={() => chooseName(name)}
                  className="rounded-xl border-2 border-neutral-200 dark:border-neutral-800 px-4 py-3 font-medium hover:border-cyan-400 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {result && (
            <div className="flex items-center justify-between gap-3 animate-pop">
              <span
                className={`inline-flex items-center gap-2 font-bold ${
                  result.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {result.correct ? <Check size={20} /> : <X size={20} />}
                {result.correct ? "Richtig!" : `Das war ${round.target.name}`}
              </span>
              <button
                onClick={() => newRound(mapData, targets)}
                className="rounded-xl bg-cyan-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
              >
                Weiter
              </button>
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}
