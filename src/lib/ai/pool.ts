import { generateBatch, type GeneratedExercise } from "./exercises";
import { listSubjects, getGoal } from "../db/repo";
import { getDb } from "../db/sqlite";
import type { Exercise } from "./schemas";

// Persistenter Aufgaben-Vorrat pro (Kind, Fach) in SQLite (Tabelle
// exercise_pool). Enthält bereits generierte, noch nicht verbrauchte Aufgaben
// – egal ob vorgewärmt oder vom Client zurückgegeben. Übersteht Neustarts, damit
// beim Wieder-Öffnen einer Kachel nichts unnötig neu generiert wird (spart Tokens).

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

const TARGET = 4; // so viele pro Fach vorwärmen
const CAP = 24; // höchstens so viele pro (Kind, Fach) vorhalten
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // nach 7 Tagen aussortieren (nicht zu alt)

function toDTO(g: GeneratedExercise): ExerciseDTO {
  return {
    exercise: g.exercise,
    subjectId: g.subject.id,
    subjectKey: g.subject.key,
    topicId: g.topic.id,
    topicKey: g.topic.key,
    topicName: g.topic.name,
    difficulty: g.difficulty,
  };
}

export function poolSize(userId: number, subjectId: number): number {
  return (
    getDb()
      .prepare("SELECT COUNT(*) c FROM exercise_pool WHERE user_id = ? AND subject_id = ?")
      .get(userId, subjectId) as { c: number }
  ).c;
}

// Bis zu n Aufgaben aus dem Vorrat nehmen (älteste zuerst, entfernt sie).
export function takeFromPool(userId: number, subjectId: number, n: number): ExerciseDTO[] {
  if (n <= 0) return [];
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, payload FROM exercise_pool WHERE user_id = ? AND subject_id = ? ORDER BY id LIMIT ?",
    )
    .all(userId, subjectId, n) as Array<{ id: number; payload: string }>;
  if (rows.length) {
    const del = db.prepare("DELETE FROM exercise_pool WHERE id = ?");
    db.transaction((ids: number[]) => ids.forEach((id) => del.run(id)))(rows.map((r) => r.id));
  }
  const out: ExerciseDTO[] = [];
  for (const r of rows) {
    try {
      out.push(JSON.parse(r.payload) as ExerciseDTO);
    } catch {
      // kaputtes JSON überspringen
    }
  }
  return out;
}

// Aufgaben in den Vorrat legen (vorgewärmt oder zurückgegeben). Räumt dabei
// zu alte und über die Obergrenze hinausgehende Einträge weg.
export function addToPool(userId: number, subjectId: number, items: ExerciseDTO[]): void {
  if (!items?.length) return;
  const db = getDb();
  const now = Date.now();
  const ins = db.prepare(
    "INSERT INTO exercise_pool (user_id, subject_id, payload, created_at) VALUES (?, ?, ?, ?)",
  );
  db.transaction(() => {
    for (const it of items) ins.run(userId, subjectId, JSON.stringify(it), now);
  })();
  // Zu alte Einträge entfernen.
  db.prepare("DELETE FROM exercise_pool WHERE user_id = ? AND subject_id = ? AND created_at < ?").run(
    userId,
    subjectId,
    now - TTL_MS,
  );
  // Obergrenze wahren (älteste zuerst löschen).
  const size = poolSize(userId, subjectId);
  if (size > CAP) {
    db.prepare(
      "DELETE FROM exercise_pool WHERE id IN (SELECT id FROM exercise_pool WHERE user_id = ? AND subject_id = ? ORDER BY id LIMIT ?)",
    ).run(userId, subjectId, size - CAP);
  }
}

// Ungenutzte Aufgaben vom Client zurücklegen (identisch zum Auffüllen).
export function returnExercises(userId: number, subjectId: number, items: ExerciseDTO[]): void {
  addToPool(userId, subjectId, items);
}

// --- Vorwärmen im Hintergrund (Scheduling ist prozess-lokal) ---

let warming = false;
const warmQueue: Array<{ userId: number; subjectId: number }> = [];

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
          addToPool(w.userId, w.subjectId, batch.map(toDTO));
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
