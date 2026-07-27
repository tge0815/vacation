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
  Gamepad2,
} from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { color } from "@/components/colors";
import { useSpeech } from "./useSpeech";
import { LoadingView, QueueIndicator } from "./Waiting";
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
  goalType: "minutes" | "count";
  goalTarget: number;
  secondsDoneAtStart: number;
  attemptsAtStart: number;
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
  const [gapValues, setGapValues] = useState<string[]>([]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<SubjectMeta | null>(null);
  const [committedSec, setCommittedSec] = useState(0);
  const [committedCount, setCommittedCount] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [pendingCelebrate, setPendingCelebrate] = useState(false);
  const [coinAwarded, setCoinAwarded] = useState(false);
  const exerciseStart = useRef<number>(0);
  // Warteschlange vorab generierter Aufgaben. Ein KI-Aufruf liefert mehrere
  // Aufgaben; die App zieht daraus sofort und füllt im Hintergrund nach.
  const queueRef = useRef<Gen[]>([]);
  const fetchingRef = useRef(false);
  const activeRef = useRef(true);
  const lastErrorRef = useRef<string | null>(null);
  const BATCH = 5;
  const TARGET = 10; // Vorrat wird bis hierhin aufgefüllt
  // Reaktive Spiegel der Warteschlange für die Vorrats-Anzeige.
  const [queueCount, setQueueCount] = useState(0);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const bumpQueue = useCallback(() => setQueueCount(queueRef.current.length), []);

  // Erledigt-Wert je nach Ziel-Typ: Minuten oder Anzahl Aufgaben.
  const isCount = meta?.goalType === "count";
  const doneValue = isCount
    ? (meta?.attemptsAtStart ?? 0) + committedCount
    : Math.floor(((meta?.secondsDoneAtStart ?? 0) + committedSec) / 60);
  const goalTarget = meta?.goalTarget ?? 0;
  const goalReached = goalTarget > 0 && doneValue >= goalTarget;
  const unit = isCount ? "" : "m";

  // Ein Bündel Aufgaben holen (ohne setState) — liefert Array oder [] bei Fehler.
  const fetchBatch = useCallback(
    async (count: number): Promise<Gen[]> => {
      try {
        const r = await fetch("/api/exercise/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, subjectId, topicId: topicId ?? null, count }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Fehler");
        lastErrorRef.current = null;
        return (d.exercises ?? []) as Gen[];
      } catch (e) {
        lastErrorRef.current = e instanceof Error ? e.message : "Verbindungsfehler";
        return [];
      }
    },
    [userId, subjectId, topicId],
  );

  // Warteschlange im Hintergrund KONTINUIERLICH bis zum Ziel auffüllen.
  // Läuft Bündel für Bündel weiter, solange der Vorrat unter dem Ziel ist —
  // nicht nur ein einziges Bündel.
  const ensureQueue = useCallback(async () => {
    if (fetchingRef.current || !activeRef.current) return;
    if (queueRef.current.length >= TARGET) return;
    fetchingRef.current = true;
    setLoadingBatch(true);
    try {
      while (activeRef.current && queueRef.current.length < TARGET) {
        const arr = await fetchBatch(BATCH);
        if (arr.length === 0) break; // Fehler → nicht endlos versuchen
        queueRef.current.push(...arr);
        bumpQueue();
      }
    } finally {
      fetchingRef.current = false;
      setLoadingBatch(false);
    }
  }, [fetchBatch, bumpQueue]);

  // Nächste Aufgabe holen: aus der Warteschlange (sofort) oder – wenn leer –
  // schnell EINE einzelne generieren (kürzer als ein ganzes Bündel).
  const takeNext = useCallback(async (): Promise<Gen | null> => {
    if (queueRef.current.length > 0) {
      const g = queueRef.current.shift() ?? null;
      bumpQueue();
      return g;
    }
    const arr = await fetchBatch(1);
    if (arr.length > 1) queueRef.current.push(...arr.slice(1));
    bumpQueue();
    return arr[0] ?? null;
  }, [fetchBatch, bumpQueue]);

  const showGen = useCallback(
    (g: Gen | null) => {
      if (!g) {
        setErr(lastErrorRef.current ?? "Aufgabe konnte nicht geladen werden.");
        setPhase("error");
        return;
      }
      setGen(g);
      exerciseStart.current = Date.now();
      setPhase("answer");
      void ensureQueue();
    },
    [ensureQueue],
  );

  // Aus Event-Handlern aufgerufen (Button „Nächste Aufgabe", Fehler-Retry).
  const nextExercise = useCallback(() => {
    setGrade(null);
    setAnswer("");
    setChoice(null);
    setGapValues([]);
    setErr(null);
    speech.setTranscript("");
    // Vorrat da? Sofort nehmen — KEIN Ladebildschirm.
    if (queueRef.current.length > 0) {
      const g = queueRef.current.shift() ?? null;
      bumpQueue();
      showGen(g);
      return;
    }
    // Vorrat leer → laden.
    setPhase("loading");
    void (async () => showGen(await takeNext()))();
  }, [takeNext, showGen, speech, bumpQueue]);

  useEffect(() => {
    // Bei Fach-/Themenwechsel alte Warteschlange verwerfen.
    queueRef.current = [];
    fetchingRef.current = false;
    // Meta (Fach, Ziel, bisheriger Fortschritt) inline laden.
    fetch(`/api/progress?userId=${userId}`)
      .then((r) => r.json())
      .then(
        (d: {
          subjects: {
            subjectId: number;
            name: string;
            color: string;
            goalType: "minutes" | "count";
            goalTarget: number;
            secondsDone: number;
            attempts: number;
          }[];
        }) => {
          const s = d.subjects.find((x) => x.subjectId === subjectId);
          if (s)
            setMeta({
              name: s.name,
              color: s.color,
              goalType: s.goalType,
              goalTarget: s.goalTarget,
              secondsDoneAtStart: s.secondsDone,
              attemptsAtStart: s.attempts,
            });
        },
      )
      .catch(() => {});
    // Erste Aufgabe holen — via Microtask, damit setState nicht synchron
    // im Effekt-Body passiert (showGen setzt State erst nach dem Fetch).
    const t = setTimeout(async () => showGen(await takeNext()), 0);
    return () => clearTimeout(t);
  }, [userId, subjectId, takeNext, showGen]);

  // Sicherheits-Timer: hält den Vorrat auch während langer Antwortzeiten
  // gefüllt und stoppt das Nachladen beim Verlassen der Seite.
  useEffect(() => {
    activeRef.current = true;
    const id = setInterval(() => {
      void ensureQueue();
    }, 6000);
    return () => {
      activeRef.current = false;
      clearInterval(id);
    };
  }, [ensureQueue]);

  function afterGrade(durationSec: number, coinEarned = false) {
    const newSec = committedSec + durationSec;
    const newCount = committedCount + 1;
    setCommittedSec(newSec);
    setCommittedCount(newCount);
    setPhase("graded");
    if (coinEarned) setCoinAwarded(true);
    // Ziel gerade erreicht ODER Coin verdient? Einmalig feiern.
    let goalHit = false;
    if (meta) {
      const done =
        meta.goalType === "count"
          ? meta.attemptsAtStart + newCount
          : Math.floor((meta.secondsDoneAtStart + newSec) / 60);
      goalHit = meta.goalTarget > 0 && done >= meta.goalTarget;
    }
    // Belohnung NICHT sofort zeigen — erst das Feedback zur letzten Antwort,
    // dann beim Weiterklicken die Feier.
    if (coinEarned || (goalHit && !celebrated)) {
      setCelebrated(true);
      setPendingCelebrate(true);
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
      afterGrade(durationSec, Boolean(d.reward?.awarded));
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
      afterGrade(durationSec, Boolean(d.reward?.awarded));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  // Mehrfach-Lücken werden lokal bewertet (jede Lücke gegen blanks[i]).
  async function submitGaps() {
    if (!gen || submitting) return;
    const blanks = gen.exercise.blanks ?? [];
    if (blanks.length === 0) return;
    if (gapValues.some((v, i) => i < blanks.length && !(v ?? "").trim())) return;
    setSubmitting(true);
    const durationSec = Math.round((Date.now() - exerciseStart.current) / 1000);
    const caseSensitive = gen.subjectKey === "deutsch";
    const norm = (s: string) => {
      const t = s.trim().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "");
      return caseSensitive ? t : t.toLowerCase();
    };
    const correctFlags = blanks.map((b, i) => norm(gapValues[i] ?? "") === norm(b));
    const nCorrect = correctFlags.filter(Boolean).length;
    const isCorrect = nCorrect === blanks.length;
    const gradeObj: Grade = {
      isCorrect,
      score: Math.round((nCorrect / blanks.length) * 100),
      feedback: isCorrect ? "Alle Lücken richtig!" : `${nCorrect} von ${blanks.length} Lücken richtig.`,
    };
    try {
      const r = await fetch("/api/exercise/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subjectId,
          topicId: gen.topicId,
          difficulty: gen.difficulty,
          inputMode: "gaps",
          question: gen.exercise.question,
          answer: gapValues.join(" | "),
          solution: blanks.join(" / "),
          isCorrect,
          durationSec,
        }),
      });
      const d = await r.json();
      setGrade(gradeObj);
      afterGrade(durationSec, Boolean(d.reward?.awarded));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  const c = color(meta?.color ?? "sky");
  const ex = gen?.exercise;
  const gapsMode = ex?.inputMode === "gaps" && (ex.blanks?.length ?? 0) > 0;

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
            {goalTarget > 0 ? `${doneValue}/${goalTarget}${unit}` : ""}
          </span>
        </div>
        {goalTarget > 0 && (
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goalReached ? "bg-emerald-500" : c.bg}`}
              style={{ width: `${Math.min(100, (doneValue / Math.max(1, goalTarget)) * 100)}%` }}
            />
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <QueueIndicator count={queueCount} loading={loadingBatch} />
        </div>
      </header>

      {/* Belohnungs-Screen */}
      {showCelebrate ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-pop">
          {coinAwarded ? (
            <>
              <div className="text-7xl animate-wiggle" aria-hidden>
                🪙
              </div>
              <h2 className="text-2xl font-bold">10 richtig — +1 Coin!</h2>
              <p className="text-neutral-500">Stark! Mit Coins kannst du im Spiele-Bereich spielen.</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowCelebrate(false);
                    setCoinAwarded(false);
                    nextExercise();
                  }}
                  className="rounded-xl bg-emerald-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
                >
                  Weiter üben
                </button>
                <button
                  onClick={() => router.push(`/kind/${userId}/spiele`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-5 py-2.5 font-semibold hover:opacity-90"
                >
                  <Gamepad2 size={18} /> Spielen
                </button>
              </div>
            </>
          ) : (
            <>
              <Trophy size={64} className="text-amber-500" />
              <h2 className="text-2xl font-bold">Ziel geschafft!</h2>
              <p className="text-neutral-500">
                {isCount
                  ? `Du hast heute ${doneValue} Aufgaben in ${meta?.name} geübt. Super gemacht!`
                  : `Du hast heute ${doneValue} Minuten ${meta?.name} geübt. Super gemacht!`}
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
            </>
          )}
        </div>
      ) : phase === "loading" ? (
        <LoadingView colorBg={c.bg} />
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
            ) : gapsMode ? (
              <p className="text-sm text-neutral-400">Fülle alle Lücken aus.</p>
            ) : (
              <QuestionText text={ex.question} />
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
              ) : gapsMode ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitGaps();
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-5 text-lg leading-loose">
                    {ex.question.split("___").map((seg, i, arr) => (
                      <span key={i}>
                        <span className="whitespace-pre-wrap">{seg}</span>
                        {i < arr.length - 1 && (
                          <input
                            value={gapValues[i] ?? ""}
                            onChange={(e) => {
                              const next = [...gapValues];
                              next[i] = e.target.value;
                              setGapValues(next);
                            }}
                            className="mx-1 inline-block w-28 align-baseline rounded-lg border-b-2 border-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-base focus:outline-none focus:border-sky-600"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${c.bg} text-white font-semibold py-3 disabled:opacity-40 hover:opacity-90`}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Prüfen
                  </button>
                </form>
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
              {gapsMode && (
                <GapReview
                  question={ex.question}
                  blanks={ex.blanks ?? []}
                  answers={gapValues}
                  caseSensitive={gen?.subjectKey === "deutsch"}
                />
              )}
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
                onClick={() => {
                  if (pendingCelebrate) {
                    setPendingCelebrate(false);
                    setShowCelebrate(true);
                  } else {
                    nextExercise();
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl ${pendingCelebrate ? "bg-amber-500" : c.bg} text-white font-semibold py-3 hover:opacity-90`}
              >
                {pendingCelebrate ? (
                  <>🎉 {coinAwarded ? "Belohnung!" : "Ziel geschafft!"}</>
                ) : (
                  <>
                    <Sparkles size={18} /> Nächste Aufgabe
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}

// Fragetext darstellen. Enthält der Text Flaggen-Emoji (Flaggen-Raten), werden
// diese groß und zentriert gezeigt — der restliche Text darunter.
function QuestionText({ text }: { text: string }) {
  const flags = text.match(/\p{Regional_Indicator}{2}/gu);
  if (flags && flags.length > 0) {
    const rest = text
      .replace(/\p{Regional_Indicator}{2}/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-[6rem] leading-none sm:text-[8rem]" aria-hidden>
          {flags.join(" ")}
        </div>
        {rest && (
          <p className="text-xl leading-relaxed font-semibold whitespace-pre-wrap">{rest}</p>
        )}
      </div>
    );
  }
  return <p className="text-xl leading-relaxed font-semibold whitespace-pre-wrap">{text}</p>;
}

// Lückentext nach der Bewertung: ganzer Satz mit eingesetzten Antworten.
// Richtige Lücken grün, falsche rot durchgestrichen mit Korrektur daneben.
function GapReview({
  question,
  blanks,
  answers,
  caseSensitive,
}: {
  question: string;
  blanks: string[];
  answers: string[];
  caseSensitive: boolean;
}) {
  const norm = (s: string) => {
    const t = s.trim().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "");
    return caseSensitive ? t : t.toLowerCase();
  };
  const segs = question.split("___");
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-5 text-lg leading-loose">
      {segs.map((seg, i, arr) => {
        const hasGap = i < arr.length - 1;
        const given = (answers[i] ?? "").trim();
        const solution = blanks[i] ?? "";
        const correct = hasGap && norm(given) === norm(solution);
        return (
          <span key={i}>
            <span className="whitespace-pre-wrap">{seg}</span>
            {hasGap &&
              (correct ? (
                <span className="mx-1 rounded-md bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  {given}
                </span>
              ) : (
                <span className="mx-1 inline-flex items-center gap-1">
                  <span className="rounded-md bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-600 dark:text-rose-400 line-through decoration-2">
                    {given || "—"}
                  </span>
                  <span className="text-neutral-400">→</span>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    {solution}
                  </span>
                </span>
              ))}
          </span>
        );
      })}
    </div>
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
