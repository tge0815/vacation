"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  Mic,
  Square,
  Trophy,
  Send,
  Sparkles,
} from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { color } from "@/components/colors";
import { useSpeech } from "./useSpeech";
import type { Exercise } from "@/lib/ai/schemas";

type Gen = {
  exercise: Exercise;
  subjectId: number;
  subjectKey: string;
  topicId: number;
  topicKey: string;
  topicName: string;
  difficulty: number;
};

type Grade = {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correction?: string;
  accuracyPct?: number;
  missedWords?: string[];
};

type SubjectMeta = {
  name: string;
  color: string;
  goalMinutes: number;
  secondsDoneAtStart: number;
};

type Phase = "loading" | "answer" | "graded" | "error";

export function ExercisePlayer({
  userId,
  subjectId,
  topicId,
}: {
  userId: number;
  subjectId: number;
  topicId?: number | null;
}) {
  const router = useRouter();
  const speech = useSpeech("de-DE");

  const [phase, setPhase] = useState<Phase>("loading");
  const [gen, setGen] = useState<Gen | null>(null);
  const [answer, setAnswer] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<SubjectMeta | null>(null);
  const [committedSec, setCommittedSec] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const exerciseStart = useRef<number>(0);

  const totalSec = (meta?.secondsDoneAtStart ?? 0) + committedSec;
  const totalMin = Math.floor(totalSec / 60);
  const goalMin = meta?.goalMinutes ?? 0;
  const goalReached = goalMin > 0 && totalMin >= goalMin;


  // Reiner Fetch (alle setState-Aufrufe liegen NACH dem ersten await) —
  // damit sicher aus einem Effekt aufrufbar, ohne synchrones setState.
  const doGenerate = useCallback(async () => {
    try {
      const r = await fetch("/api/exercise/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subjectId, topicId: topicId ?? null }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setGen(d as Gen);
      exerciseStart.current = Date.now();
      setPhase("answer");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setPhase("error");
    }
  }, [userId, subjectId, topicId]);

  // Aus Event-Handlern aufgerufen (Button „Nächste Aufgabe", Fehler-Retry).
  const nextExercise = useCallback(() => {
    setPhase("loading");
    setGrade(null);
    setAnswer("");
    setChoice(null);
    setErr(null);
    speech.setTranscript("");
    doGenerate();
  }, [doGenerate, speech]);

  useEffect(() => {
    // Meta (Fach, Ziel, bisheriger Fortschritt) inline laden.
    fetch(`/api/progress?userId=${userId}`)
      .then((r) => r.json())
      .then(
        (d: {
          subjects: {
            subjectId: number;
            name: string;
            color: string;
            goalMinutes: number;
            secondsDone: number;
          }[];
        }) => {
          const s = d.subjects.find((x) => x.subjectId === subjectId);
          if (s)
            setMeta({
              name: s.name,
              color: s.color,
              goalMinutes: s.goalMinutes,
              secondsDoneAtStart: s.secondsDone,
            });
        },
      )
      .catch(() => {});
    // Erste Aufgabe erzeugen — via Microtask, damit setState nicht synchron
    // im Effekt-Body passiert (doGenerate setzt State erst nach dem Fetch).
    const t = setTimeout(() => doGenerate(), 0);
    return () => clearTimeout(t);
  }, [userId, subjectId, doGenerate]);

  function afterGrade(durationSec: number) {
    const newCommitted = committedSec + durationSec;
    setCommittedSec(newCommitted);
    setPhase("graded");
    // Ziel gerade erreicht? Einmalig feiern (im Event-Handler, kein Effekt).
    const total = (meta?.secondsDoneAtStart ?? 0) + newCommitted;
    if (goalMin > 0 && Math.floor(total / 60) >= goalMin && !celebrated) {
      setCelebrated(true);
      setShowCelebrate(true);
    }
  }

  async function submitAnswer() {
    if (!gen || submitting) return;
    const finalAnswer = gen.exercise.inputMode === "choice" ? choice ?? "" : answer.trim();
    if (!finalAnswer) return;
    setSubmitting(true);
    const durationSec = Math.round((Date.now() - exerciseStart.current) / 1000);
    try {
      const r = await fetch("/api/exercise/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subjectId,
          subjectKey: gen.subjectKey,
          topicId: gen.topicId,
          topicKey: gen.topicKey,
          difficulty: gen.difficulty,
          exercise: gen.exercise,
          answer: finalAnswer,
          durationSec,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setGrade(d.grade as Grade);
      afterGrade(durationSec);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReading() {
    if (!gen || submitting) return;
    const transcript = speech.transcript.trim();
    if (!transcript) return;
    if (speech.listening) speech.stop();
    setSubmitting(true);
    const durationSec = Math.round((Date.now() - exerciseStart.current) / 1000);
    try {
      const r = await fetch("/api/exercise/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subjectId,
          topicId: gen.topicId,
          difficulty: gen.difficulty,
          exercise: gen.exercise,
          transcript,
          durationSec,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setGrade({ ...(d.grade as Grade), isCorrect: d.isCorrect });
      afterGrade(durationSec);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  const c = color(meta?.color ?? "sky");
  const ex = gen?.exercise;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 flex-1 flex flex-col">
      {showCelebrate && <Confetti />}

      {/* Kopf: Fortschritt + zurück */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push(`/kind/${userId}`)}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <ArrowLeft size={16} /> Zurück
          </button>
          <span className="text-sm font-medium">
            {meta?.name}
            {gen?.topicName ? ` · ${gen.topicName}` : ""}
          </span>
          <span className="text-sm text-neutral-500 nums">
            {totalMin}/{goalMin}m
          </span>
        </div>
        {goalMin > 0 && (
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goalReached ? "bg-emerald-500" : c.bg}`}
              style={{ width: `${Math.min(100, (totalMin / Math.max(1, goalMin)) * 100)}%` }}
            />
          </div>
        )}
      </header>

      {/* Belohnungs-Screen */}
      {showCelebrate ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-pop">
          <Trophy size={64} className="text-amber-500" />
          <h2 className="text-2xl font-bold">Tagesziel geschafft!</h2>
          <p className="text-neutral-500">
            Du hast heute {totalMin} Minuten {meta?.name} geübt. Super gemacht!
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                setShowCelebrate(false);
                nextExercise();
              }}
              className="rounded-xl bg-neutral-200 dark:bg-neutral-800 px-5 py-2.5 font-semibold hover:opacity-90"
            >
              Weiter üben
            </button>
            <button
              onClick={() => router.push(`/kind/${userId}`)}
              className="rounded-xl bg-emerald-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
            >
              Fertig für heute
            </button>
          </div>
        </div>
      ) : phase === "loading" ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm">Ich denke mir eine Aufgabe aus…</p>
        </div>
      ) : phase === "error" ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <X size={40} className="text-rose-500" />
          <p className="text-neutral-600 dark:text-neutral-300">{err}</p>
          <button
            onClick={nextExercise}
            className="rounded-xl bg-sky-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
          >
            Nochmal versuchen
          </button>
        </div>
      ) : ex ? (
        <div className="flex-1 flex flex-col">
          {/* Aufgabenkarte */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 mb-4">
            <p className="text-sm font-medium text-neutral-500 mb-2">{ex.instruction}</p>
            {ex.inputMode === "reading" ? (
              <p className="text-xl leading-relaxed font-medium">{ex.passage ?? ex.question}</p>
            ) : (
              <p className="text-xl leading-relaxed font-semibold whitespace-pre-wrap">{ex.question}</p>
            )}
          </div>

          {/* Eingabe je nach Modus */}
          {phase === "answer" && (
            <div className="flex flex-col gap-3">
              {ex.inputMode === "choice" && ex.choices ? (
                <div className="grid grid-cols-1 gap-2">
                  {ex.choices.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChoice(opt)}
                      className={`text-left rounded-xl border-2 px-4 py-3 font-medium transition ${
                        choice === opt
                          ? `${c.border} ${c.soft}`
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    onClick={submitAnswer}
                    disabled={!choice || submitting}
                    className={`mt-1 inline-flex items-center justify-center gap-2 rounded-xl ${c.bg} text-white font-semibold py-3 disabled:opacity-40 hover:opacity-90`}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Prüfen
                  </button>
                </div>
              ) : ex.inputMode === "reading" ? (
                <ReadingInput
                  speech={speech}
                  submitting={submitting}
                  colorBg={c.bg}
                  onEvaluate={submitReading}
                  onSkip={nextExercise}
                />
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAnswer();
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    inputMode={ex.inputMode === "number" ? "decimal" : "text"}
                    placeholder={
                      ex.inputMode === "fraction"
                        ? "z.B. 3/4"
                        : ex.inputMode === "number"
                          ? "Deine Zahl"
                          : "Deine Antwort"
                    }
                    className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-lg focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!answer.trim() || submitting}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${c.bg} text-white font-semibold py-3 disabled:opacity-40 hover:opacity-90`}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Prüfen
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bewertung */}
          {phase === "graded" && grade && (
            <div className="flex flex-col gap-4 animate-pop">
              <div
                className={`rounded-2xl p-5 ${
                  grade.isCorrect
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-lg mb-1">
                  {grade.isCorrect ? <Check size={22} /> : <X size={22} />}
                  {grade.isCorrect ? "Richtig!" : "Nicht ganz."}
                  {typeof grade.accuracyPct === "number" && (
                    <span className="ml-auto text-sm font-medium">{grade.accuracyPct}% gelesen</span>
                  )}
                </div>
                <p className="text-neutral-700 dark:text-neutral-200">{grade.feedback}</p>
                {grade.correction && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold">Richtig wäre:</span> {grade.correction}
                  </p>
                )}
                {grade.missedWords && grade.missedWords.length > 0 && (
                  <p className="mt-2 text-sm">Üben: {grade.missedWords.join(", ")}</p>
                )}
              </div>
              <button
                onClick={nextExercise}
                className={`inline-flex items-center justify-center gap-2 rounded-xl ${c.bg} text-white font-semibold py-3 hover:opacity-90`}
              >
                <Sparkles size={18} /> Nächste Aufgabe
              </button>
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}

function ReadingInput({
  speech,
  submitting,
  colorBg,
  onEvaluate,
  onSkip,
}: {
  speech: ReturnType<typeof useSpeech>;
  submitting: boolean;
  colorBg: string;
  onEvaluate: () => void;
  onSkip: () => void;
}) {
  if (!speech.supported) {
    return (
      <div className="rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 p-4 text-sm">
        <p className="font-medium mb-1">Vorlesen geht hier gerade nicht.</p>
        <p>
          Dein Browser oder die Verbindung erlaubt kein Mikrofon. Vorlesen funktioniert am besten in
          Chrome über <span className="font-mono">localhost</span> oder eine HTTPS-Adresse.
        </p>
        <button onClick={onSkip} className="mt-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 font-semibold">
          Aufgabe überspringen
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center">
        <button
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-4 font-semibold text-white transition ${
            speech.listening ? "bg-rose-500 animate-wiggle" : colorBg
          }`}
        >
          {speech.listening ? <Square size={20} /> : <Mic size={20} />}
          {speech.listening ? "Stopp" : "Vorlesen starten"}
        </button>
      </div>
      {speech.transcript && (
        <div className="rounded-xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="font-medium">Ich habe gehört:</span> {speech.transcript}
        </div>
      )}
      {speech.error && <p className="text-sm text-rose-500">{speech.error}</p>}
      <button
        onClick={onEvaluate}
        disabled={!speech.transcript.trim() || speech.listening || submitting}
        className={`inline-flex items-center justify-center gap-2 rounded-xl ${colorBg} text-white font-semibold py-3 disabled:opacity-40 hover:opacity-90`}
      >
        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
        Auswerten
      </button>
    </div>
  );
}
