import { generateBatch, type GeneratedExercise } from "./exercises";
import { listSubjects, getGoal } from "../db/repo";

// Server-seitiger Aufgaben-Vorrat pro (Kind, Fach). Bleibt über Fach-Wechsel
// hinweg erhalten (im Speicher des Containers). Wird beim Öffnen der Kind-Seite
// für alle Fächer vorgewärmt, damit „Loslegen" ohne Wartezeit startet.

const POOL = new Map<string, GeneratedExercise[]>();
const key = (u: number, s: number) => `${u}:${s}`;

const TARGET = 4; // so viele pro Fach vorhalten
let warming = false;
const warmQueue: Array<{ userId: number; subjectId: number }> = [];

export function poolSize(userId: number, subjectId: number): number {
  return (POOL.get(key(userId, subjectId)) ?? []).length;
}

// Bis zu n Aufgaben aus dem Vorrat nehmen (entfernt sie).
export function takeFromPool(userId: number, subjectId: number, n: number): GeneratedExercise[] {
  const k = key(userId, subjectId);
  const arr = POOL.get(k) ?? [];
  const taken = arr.splice(0, n);
  POOL.set(k, arr);
  return taken;
}

function enqueue(userId: number, subjectId: number) {
  if (poolSize(userId, subjectId) >= TARGET) return;
  if (warmQueue.some((w) => w.userId === userId && w.subjectId === subjectId)) return;
  warmQueue.push({ userId, subjectId });
  void processWarm();
}

// Wärmt IMMER nur eine Generierung gleichzeitig (schont die Max-Plan-Subprozesse).
async function processWarm() {
  if (warming) return;
  warming = true;
  try {
    while (warmQueue.length > 0) {
      const w = warmQueue.shift()!;
      while (poolSize(w.userId, w.subjectId) < TARGET) {
        const need = TARGET - poolSize(w.userId, w.subjectId);
        try {
          const batch = await generateBatch({
            userId: w.userId,
            subjectId: w.subjectId,
            count: Math.min(3, need),
          });
          if (batch.length === 0) break;
          const k = key(w.userId, w.subjectId);
          POOL.set(k, [...(POOL.get(k) ?? []), ...batch]);
        } catch {
          break;
        }
      }
    }
  } finally {
    warming = false;
  }
}

export function warmSubject(userId: number, subjectId: number) {
  enqueue(userId, subjectId);
}

// Alle Fächer mit gesetztem Tagesziel vorwärmen (die, die heute dran sind).
export function warmAll(userId: number) {
  for (const s of listSubjects()) {
    if (getGoal(userId, s.id).target > 0) enqueue(userId, s.id);
  }
}
