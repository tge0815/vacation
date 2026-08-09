import { generateBatch, type GeneratedExercise } from "./exercises";
import { listSubjects, getGoal } from "../db/repo";
import type { Exercise } from "./schemas";

// Server-seitiger Aufgaben-Vorrat pro (Kind, Fach). Bleibt über Fach-Wechsel
// hinweg erhalten (im Speicher des Containers). Wird beim Öffnen der Kind-Seite
// für alle Fächer vorgewärmt, damit „Loslegen" ohne Wartezeit startet.

const POOL = new Map<string, GeneratedExercise[]>();
const key = (u: number, s: number) => `${u}:${s}`;

// Fertig aufbereitete Aufgabe, wie sie der Client bekommt/zurückgibt.
export type ExerciseDTO = {
  exercise: Exercise;
  subjectId: number;
  subjectKey: string;
  topicId: number;
  topicKey: string;
  topicName: string;
  difficulty: number;
};

// Rückgabe-Speicher: Aufgaben, die der Client vorab geholt, aber beim Verlassen
// der Kachel NICHT verbraucht hat. Werden beim nächsten Öffnen zuerst wieder
// ausgegeben — so wird nichts umsonst generiert (spart Tokens).
const RETURNED = new Map<string, ExerciseDTO[]>();
const RETURN_CAP = 20; // pro (Kind, Fach) maximal so viele zwischenhalten

// Bis zu n zurückgegebene Aufgaben herausnehmen (entfernt sie).
export function takeReturned(userId: number, subjectId: number, n: number): ExerciseDTO[] {
  const k = key(userId, subjectId);
  const arr = RETURNED.get(k) ?? [];
  const taken = arr.splice(0, n);
  RETURNED.set(k, arr);
  return taken;
}

// Ungenutzte Aufgaben zurücklegen (vorne anstellen → zuerst wiederverwenden).
export function returnExercises(userId: number, subjectId: number, items: ExerciseDTO[]): void {
  if (!items?.length) return;
  const k = key(userId, subjectId);
  const arr = RETURNED.get(k) ?? [];
  RETURNED.set(k, [...items, ...arr].slice(0, RETURN_CAP));
}

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

// Wärmt IMMER nur eine Generierung gleichzeitig (schont API-Rate-Limits).
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
