import { createHash } from "node:crypto";
import {
  getDb,
  type UserRow,
  type SubjectRow,
  type TopicRow,
  type GoalRow,
  type AttemptRow,
} from "./sqlite";
import { isoWeekKey, localDateStr } from "../date";

// --- PIN-Hashing (leichtgewichtig, LAN-Kontext für Kinder) ---

const PIN_SALT = "lernferien-v1";
export function hashPin(pin: string): string {
  return createHash("sha256").update(PIN_SALT + pin).digest("hex");
}
export function verifyPin(hash: string | null, pin: string): boolean {
  if (!hash) return true; // kein PIN gesetzt → offen
  return hash === hashPin(pin);
}

// --- Users ---

export function listUsers(): UserRow[] {
  return getDb()
    .prepare("SELECT * FROM users ORDER BY sort ASC, id ASC")
    .all() as UserRow[];
}

export function getUser(id: number): UserRow | null {
  return (getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow) ?? null;
}

export function createUser(u: {
  name: string;
  color?: string;
  emoji?: string;
  pin?: string | null;
  grade?: number;
}): UserRow {
  const db = getDb();
  const maxSort =
    (db.prepare("SELECT MAX(sort) as m FROM users").get() as { m: number | null }).m ?? 0;
  const info = db
    .prepare(
      "INSERT INTO users (name, color, emoji, pin_hash, grade, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      u.name,
      u.color ?? "sky",
      u.emoji ?? "🙂",
      u.pin ? hashPin(u.pin) : null,
      u.grade ?? 5,
      maxSort + 1,
      Date.now(),
    );
  const user = getUser(Number(info.lastInsertRowid))!;
  seedDefaultGoals(user.id);
  return user;
}

// Standard-Tagesziele für die Kernfächer (Deutsch/Mathe/Englisch = 10 Min).
// Erdkunde & Co. bleiben bei 0 (= aus), bis die Eltern sie einstellen.
export function seedDefaultGoals(userId: number): void {
  const db = getDb();
  for (const key of ["deutsch", "mathe", "englisch"]) {
    const s = db.prepare("SELECT id FROM subjects WHERE key = ?").get(key) as
      | { id: number }
      | undefined;
    if (s) setGoal(userId, s.id, 10, "minutes");
  }
}

export function updateUser(
  id: number,
  fields: { name?: string; color?: string; emoji?: string; grade?: number; pin?: string | null },
): UserRow | null {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (fields.name !== undefined) {
    sets.push("name = ?");
    vals.push(fields.name);
  }
  if (fields.color !== undefined) {
    sets.push("color = ?");
    vals.push(fields.color);
  }
  if (fields.emoji !== undefined) {
    sets.push("emoji = ?");
    vals.push(fields.emoji);
  }
  if (fields.grade !== undefined) {
    sets.push("grade = ?");
    vals.push(fields.grade);
  }
  if (fields.pin !== undefined) {
    sets.push("pin_hash = ?");
    vals.push(fields.pin ? hashPin(fields.pin) : null);
  }
  if (sets.length === 0) return getUser(id);
  vals.push(id);
  getDb()
    .prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .run(...vals);
  return getUser(id);
}

export function deleteUser(id: number): boolean {
  return getDb().prepare("DELETE FROM users WHERE id = ?").run(id).changes > 0;
}

// --- Subjects & Topics ---

export function listSubjects(includeInactive = false): SubjectRow[] {
  const sql = includeInactive
    ? "SELECT * FROM subjects ORDER BY sort ASC"
    : "SELECT * FROM subjects WHERE active = 1 ORDER BY sort ASC";
  return getDb().prepare(sql).all() as SubjectRow[];
}

export function getSubject(id: number): SubjectRow | null {
  return (getDb().prepare("SELECT * FROM subjects WHERE id = ?").get(id) as SubjectRow) ?? null;
}

export function listTopics(subjectId: number, includeInactive = false): TopicRow[] {
  const sql = includeInactive
    ? "SELECT * FROM topics WHERE subject_id = ? ORDER BY sort ASC"
    : "SELECT * FROM topics WHERE subject_id = ? AND active = 1 ORDER BY sort ASC";
  return getDb().prepare(sql).all(subjectId) as TopicRow[];
}

export function getTopic(id: number): TopicRow | null {
  return (getDb().prepare("SELECT * FROM topics WHERE id = ?").get(id) as TopicRow) ?? null;
}

export function setTopicActive(id: number, active: boolean): void {
  getDb().prepare("UPDATE topics SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

// --- Goals ---

export type GoalType = "minutes" | "count";
export type Goal = { target: number; type: GoalType };

export function listGoals(userId: number): GoalRow[] {
  return getDb()
    .prepare("SELECT * FROM goals WHERE user_id = ?")
    .all(userId) as GoalRow[];
}

export function getGoal(
  userId: number,
  subjectId: number,
  fallback: Goal = { target: 0, type: "minutes" },
): Goal {
  const row = getDb()
    .prepare("SELECT daily_minutes, goal_type FROM goals WHERE user_id = ? AND subject_id = ?")
    .get(userId, subjectId) as { daily_minutes: number; goal_type: string } | undefined;
  if (!row) return fallback;
  return { target: row.daily_minutes, type: row.goal_type === "count" ? "count" : "minutes" };
}

export function setGoal(userId: number, subjectId: number, target: number, type: GoalType): void {
  getDb()
    .prepare(
      `INSERT INTO goals (user_id, subject_id, daily_minutes, goal_type) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, subject_id) DO UPDATE SET
         daily_minutes = excluded.daily_minutes,
         goal_type = excluded.goal_type`,
    )
    .run(userId, subjectId, Math.max(0, Math.round(target)), type);
}

// --- Attempts ---

export function insertAttempt(a: {
  userId: number;
  subjectId: number;
  topicId: number | null;
  difficulty: number;
  inputMode: string;
  exercise: unknown;
  answerText: string | null;
  grade: unknown;
  isCorrect: boolean | null;
  score: number | null;
  durationSec: number;
}): AttemptRow {
  const db = getDb();
  const now = new Date();
  const info = db
    .prepare(
      `INSERT INTO attempts
        (user_id, subject_id, topic_id, date, iso_week, difficulty, input_mode,
         exercise_json, answer_text, grade_json, is_correct, score, duration_sec, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      a.userId,
      a.subjectId,
      a.topicId,
      localDateStr(now),
      isoWeekKey(now),
      a.difficulty,
      a.inputMode,
      JSON.stringify(a.exercise),
      a.answerText,
      a.grade != null ? JSON.stringify(a.grade) : null,
      a.isCorrect == null ? null : a.isCorrect ? 1 : 0,
      a.score,
      Math.max(0, Math.round(a.durationSec)),
      Date.now(),
    );
  return db.prepare("SELECT * FROM attempts WHERE id = ?").get(info.lastInsertRowid) as AttemptRow;
}

export function recentAttempts(opts: {
  userId?: number;
  subjectId?: number;
  limit?: number;
}): AttemptRow[] {
  const clauses: string[] = [];
  const vals: unknown[] = [];
  if (opts.userId != null) {
    clauses.push("user_id = ?");
    vals.push(opts.userId);
  }
  if (opts.subjectId != null) {
    clauses.push("subject_id = ?");
    vals.push(opts.subjectId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  vals.push(opts.limit ?? 30);
  return getDb()
    .prepare(`SELECT * FROM attempts ${where} ORDER BY id DESC LIMIT ?`)
    .all(...vals) as AttemptRow[];
}

// Fortschritt heute pro Fach: Minuten geübt, Aufgaben, Trefferquote.
export type SubjectProgress = {
  subjectId: number;
  secondsDone: number;
  attempts: number;
  correct: number;
};

export function progressToday(userId: number, date = localDateStr()): SubjectProgress[] {
  const rows = getDb()
    .prepare(
      `SELECT subject_id,
              COALESCE(SUM(duration_sec),0) AS secs,
              COUNT(*) AS n,
              COALESCE(SUM(is_correct),0) AS ok
       FROM attempts WHERE user_id = ? AND date = ?
       GROUP BY subject_id`,
    )
    .all(userId, date) as Array<{ subject_id: number; secs: number; n: number; ok: number }>;
  return rows.map((r) => ({
    subjectId: r.subject_id,
    secondsDone: r.secs,
    attempts: r.n,
    correct: r.ok,
  }));
}

// Aktuelle Streak: aufeinanderfolgende Tage (bis heute/gestern) mit ≥1 Attempt.
export function currentStreak(userId: number): number {
  const dates = getDb()
    .prepare("SELECT DISTINCT date FROM attempts WHERE user_id = ? ORDER BY date DESC")
    .all(userId) as Array<{ date: string }>;
  if (dates.length === 0) return 0;
  const set = new Set(dates.map((d) => d.date));
  let streak = 0;
  const cursor = new Date();
  // Streak zählt ab heute; wenn heute noch nichts, ab gestern.
  if (!set.has(localDateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(localDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Aggregierte Statistik pro Fach über die letzten N Tage (Eltern-Übersicht).
export type SubjectStat = {
  subjectId: number;
  minutes: number;
  attempts: number;
  correct: number;
};

export function statsSince(userId: number, sinceDate: string): SubjectStat[] {
  const rows = getDb()
    .prepare(
      `SELECT subject_id,
              COALESCE(SUM(duration_sec),0) AS secs,
              COUNT(*) AS n,
              COALESCE(SUM(is_correct),0) AS ok
       FROM attempts WHERE user_id = ? AND date >= ?
       GROUP BY subject_id`,
    )
    .all(userId, sinceDate) as Array<{ subject_id: number; secs: number; n: number; ok: number }>;
  return rows.map((r) => ({
    subjectId: r.subject_id,
    minutes: Math.round(r.secs / 60),
    attempts: r.n,
    correct: r.ok,
  }));
}

// Jüngste Performance pro Topic für adaptive Schwierigkeit.
export function recentTopicPerformance(
  userId: number,
  topicId: number,
  limit = 6,
): { attempts: number; correct: number; lastDifficulty: number } {
  const rows = getDb()
    .prepare(
      `SELECT is_correct, difficulty FROM attempts
       WHERE user_id = ? AND topic_id = ? ORDER BY id DESC LIMIT ?`,
    )
    .all(userId, topicId, limit) as Array<{ is_correct: number | null; difficulty: number }>;
  const correct = rows.reduce((s, r) => s + (r.is_correct ? 1 : 0), 0);
  return {
    attempts: rows.length,
    correct,
    lastDifficulty: rows[0]?.difficulty ?? 2,
  };
}

// --- Coins / Belohnung ---

// Ist das Tagesziel komplett geschafft (alle Fächer mit Ziel erreicht)?
export function isDayComplete(userId: number, date = localDateStr()): boolean {
  const subjects = listSubjects();
  const prog = progressToday(userId, date);
  const byId = new Map(prog.map((p) => [p.subjectId, p]));
  let withGoal = 0;
  let reached = 0;
  for (const s of subjects) {
    const g = getGoal(userId, s.id);
    if (g.target <= 0) continue;
    withGoal++;
    const p = byId.get(s.id);
    const done = g.type === "count" ? (p?.attempts ?? 0) : Math.floor((p?.secondsDone ?? 0) / 60);
    if (done >= g.target) reached++;
  }
  return withGoal > 0 && reached === withGoal;
}

// Ist das Tagesziel EINES Fachs geschafft?
export function subjectReachedToday(
  userId: number,
  subjectId: number,
  date = localDateStr(),
): boolean {
  const g = getGoal(userId, subjectId);
  if (g.target <= 0) return false;
  const p = progressToday(userId, date).find((x) => x.subjectId === subjectId);
  const done = g.type === "count" ? (p?.attempts ?? 0) : Math.floor((p?.secondsDone ?? 0) / 60);
  return done >= g.target;
}

// Vergibt (einmal pro Fach & Tag) einen Coin, sobald das Fach-Ziel steht.
export function awardSubjectCoin(
  userId: number,
  subjectId: number,
): { awarded: boolean; coins: number } {
  const db = getDb();
  const user = getUser(userId);
  if (!user) return { awarded: false, coins: 0 };
  if (!subjectReachedToday(userId, subjectId)) return { awarded: false, coins: user.coins };
  const info = db
    .prepare(
      "INSERT OR IGNORE INTO coin_awards (user_id, subject_id, date, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(userId, subjectId, localDateStr(), Date.now());
  if (info.changes > 0) {
    db.prepare("UPDATE users SET coins = coins + 1 WHERE id = ?").run(userId);
    return { awarded: true, coins: user.coins + 1 };
  }
  return { awarded: false, coins: user.coins };
}

// Vergibt Coins nach je 10 richtigen Aufgaben (fachübergreifend, laufend).
export function awardCorrectCoins(userId: number): { awarded: boolean; coins: number } {
  const db = getDb();
  const user = getUser(userId);
  if (!user) return { awarded: false, coins: 0 };
  const total = (
    db
      .prepare("SELECT COUNT(*) AS c FROM attempts WHERE user_id = ? AND is_correct = 1")
      .get(userId) as { c: number }
  ).c;
  const target = Math.floor(total / 10);
  if (target > user.correct_coins) {
    const gain = target - user.correct_coins;
    db.prepare("UPDATE users SET coins = coins + ?, correct_coins = ? WHERE id = ?").run(
      gain,
      target,
      userId,
    );
    return { awarded: true, coins: user.coins + gain };
  }
  return { awarded: false, coins: user.coins };
}

// Zieht einen Coin ab (fürs Spielen). Gibt ok=false zurück, wenn keiner da ist.
export function spendCoin(userId: number): { ok: boolean; coins: number } {
  const db = getDb();
  const user = getUser(userId);
  if (!user) return { ok: false, coins: 0 };
  if (user.coins <= 0) return { ok: false, coins: 0 };
  db.prepare("UPDATE users SET coins = coins - 1 WHERE id = ?").run(userId);
  return { ok: true, coins: user.coins - 1 };
}

// --- Highscores ---

// Bei Memory ist weniger besser (Züge), sonst mehr (Punkte).
function lowerIsBetter(game: string): boolean {
  return game === "memory";
}

export function getGameScores(userId: number): Record<string, number> {
  const rows = getDb()
    .prepare("SELECT game, best FROM game_scores WHERE user_id = ?")
    .all(userId) as Array<{ game: string; best: number }>;
  const out: Record<string, number> = {};
  for (const r of rows) out[r.game] = r.best;
  return out;
}

export function recordGameScore(
  userId: number,
  game: string,
  value: number,
): { best: number; isNewBest: boolean } {
  const db = getDb();
  const v = Math.round(value);
  const row = db
    .prepare("SELECT best FROM game_scores WHERE user_id = ? AND game = ?")
    .get(userId, game) as { best: number } | undefined;
  if (!row) {
    db.prepare(
      "INSERT INTO game_scores (user_id, game, best, updated_at) VALUES (?, ?, ?, ?)",
    ).run(userId, game, v, Date.now());
    return { best: v, isNewBest: true };
  }
  const better = lowerIsBetter(game) ? v < row.best : v > row.best;
  if (better) {
    db.prepare(
      "UPDATE game_scores SET best = ?, updated_at = ? WHERE user_id = ? AND game = ?",
    ).run(v, Date.now(), userId, game);
    return { best: v, isNewBest: true };
  }
  return { best: row.best, isNewBest: false };
}

// --- Meta (u.a. Eltern-PIN) ---

export function getMeta(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM meta WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setMeta(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

export function getParentPinHash(): string | null {
  return getMeta("parent_pin_hash");
}
export function setParentPin(pin: string | null): void {
  setMeta("parent_pin_hash", pin ? hashPin(pin) : "");
}
