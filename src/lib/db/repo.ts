import { createHash } from "node:crypto";
import {
  getDb,
  type UserRow,
  type FamilyRow,
  type SubjectRow,
  type TopicRow,
  type GoalRow,
  type AttemptRow,
  type VocabRow,
} from "./sqlite";
import { isoWeekKey, localDateStr } from "../date";
import { hashPassword, verifyPassword } from "../auth/password";

// --- PIN-Hashing (leichtgewichtig, LAN-Kontext für Kinder) ---

const PIN_SALT = "lernferien-v1";
export function hashPin(pin: string): string {
  return createHash("sha256").update(PIN_SALT + pin).digest("hex");
}
export function verifyPin(hash: string | null, pin: string): boolean {
  if (!hash) return true; // kein PIN gesetzt → offen
  return hash === hashPin(pin);
}

// --- Families (Mandanten) ---

export function createFamily(name: string, email: string, password: string): FamilyRow {
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO families (name, email, password_hash, parent_pin_hash, created_at) VALUES (?, ?, ?, NULL, ?)",
    )
    .run(name, email.toLowerCase().trim(), hashPassword(password), Date.now());
  return getFamily(Number(info.lastInsertRowid))!;
}

export function getFamily(id: number): FamilyRow | null {
  return (getDb().prepare("SELECT * FROM families WHERE id = ?").get(id) as FamilyRow) ?? null;
}

export function getFamilyByEmail(email: string): FamilyRow | null {
  return (
    (getDb()
      .prepare("SELECT * FROM families WHERE email = ?")
      .get(email.toLowerCase().trim()) as FamilyRow) ?? null
  );
}

// Login-Prüfung: gibt die Familie zurück, wenn E-Mail + Passwort stimmen.
export function verifyFamilyLogin(email: string, password: string): FamilyRow | null {
  const fam = getFamilyByEmail(email);
  if (!fam) return null;
  return verifyPassword(password, fam.password_hash) ? fam : null;
}

// --- Users (Kinder, immer einer Familie zugeordnet) ---

export function listUsers(familyId: number): UserRow[] {
  return getDb()
    .prepare("SELECT * FROM users WHERE family_id = ? ORDER BY sort ASC, id ASC")
    .all(familyId) as UserRow[];
}

export function getUser(id: number): UserRow | null {
  return (getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow) ?? null;
}

// Kind nur zurückgeben, wenn es zur angegebenen Familie gehört (Mandanten-Schutz).
export function getUserInFamily(id: number, familyId: number): UserRow | null {
  const u = getUser(id);
  return u && u.family_id === familyId ? u : null;
}

export function normalizeUsername(u: string): string {
  return u.trim().toLowerCase();
}

export function getUserByUsername(username: string): UserRow | null {
  const u = normalizeUsername(username);
  if (!u) return null;
  return (getDb().prepare("SELECT * FROM users WHERE username = ?").get(u) as UserRow) ?? null;
}

// true, wenn der Benutzername schon (bei einem ANDEREN Kind) vergeben ist.
export function usernameTaken(username: string, exceptUserId?: number): boolean {
  const existing = getUserByUsername(username);
  return Boolean(existing && existing.id !== exceptUserId);
}

// Kind-Login: gibt das Kind zurück, wenn Benutzername + Passwort stimmen.
export function verifyChildLogin(username: string, password: string): UserRow | null {
  const u = getUserByUsername(username);
  if (!u || !u.password_hash) return null;
  return verifyPassword(password, u.password_hash) ? u : null;
}

export function createUser(u: {
  familyId: number;
  name: string;
  color?: string;
  emoji?: string;
  grade?: number;
  username?: string | null;
  password?: string | null;
}): UserRow {
  const db = getDb();
  const maxSort =
    (
      db.prepare("SELECT MAX(sort) as m FROM users WHERE family_id = ?").get(u.familyId) as {
        m: number | null;
      }
    ).m ?? 0;
  const info = db
    .prepare(
      "INSERT INTO users (family_id, name, color, emoji, pin_hash, username, password_hash, grade, sort, created_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)",
    )
    .run(
      u.familyId,
      u.name,
      u.color ?? "sky",
      u.emoji ?? "🙂",
      u.username ? normalizeUsername(u.username) : null,
      u.password ? hashPassword(u.password) : null,
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
  // Vokabeln als eigener Lernbereich: 10 Vokabeln pro Tag (Aufgaben-Ziel).
  const vok = db.prepare("SELECT id FROM subjects WHERE key = 'vokabeln'").get() as
    | { id: number }
    | undefined;
  if (vok) setGoal(userId, vok.id, 10, "count");
}

export function updateUser(
  id: number,
  fields: {
    name?: string;
    color?: string;
    emoji?: string;
    grade?: number;
    username?: string | null;
    password?: string | null;
  },
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
  if (fields.username !== undefined) {
    sets.push("username = ?");
    vals.push(fields.username ? normalizeUsername(fields.username) : null);
  }
  // Passwort nur ändern, wenn ein nicht-leerer Wert kommt (null = entfernen).
  if (fields.password !== undefined) {
    sets.push("password_hash = ?");
    vals.push(fields.password ? hashPassword(fields.password) : null);
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

// --- Themen an/aus pro Familie (Override über den globalen Standard) ---

export function setFamilyTopicActive(familyId: number, topicId: number, active: boolean): void {
  getDb()
    .prepare(
      `INSERT INTO family_topic_prefs (family_id, topic_id, active) VALUES (?, ?, ?)
       ON CONFLICT(family_id, topic_id) DO UPDATE SET active = excluded.active`,
    )
    .run(familyId, topicId, active ? 1 : 0);
}

function familyTopicOverrides(familyId: number): Map<number, boolean> {
  const rows = getDb()
    .prepare("SELECT topic_id, active FROM family_topic_prefs WHERE family_id = ?")
    .all(familyId) as Array<{ topic_id: number; active: number }>;
  return new Map(rows.map((r) => [r.topic_id, r.active === 1]));
}

// Themen eines Fachs mit familien-spezifischem active-Status. Ohne Override gilt
// der globale Standard (topics.active). includeInactive=false filtert auf aktive.
export function listTopicsForFamily(
  subjectId: number,
  familyId: number,
  includeInactive = false,
): TopicRow[] {
  const ov = familyTopicOverrides(familyId);
  const resolved = listTopics(subjectId, true).map((t) => ({
    ...t,
    active: ov.has(t.id) ? (ov.get(t.id) ? 1 : 0) : t.active,
  }));
  return includeInactive ? resolved : resolved.filter((t) => t.active === 1);
}

// --- Goals ---

export type GoalType = "minutes" | "count";
export type Goal = { target: number; type: GoalType; level: number };

export function listGoals(userId: number): GoalRow[] {
  return getDb()
    .prepare("SELECT * FROM goals WHERE user_id = ?")
    .all(userId) as GoalRow[];
}

export function getGoal(
  userId: number,
  subjectId: number,
  fallback: Goal = { target: 0, type: "minutes", level: 0 },
): Goal {
  const row = getDb()
    .prepare("SELECT daily_minutes, goal_type, level FROM goals WHERE user_id = ? AND subject_id = ?")
    .get(userId, subjectId) as
    | { daily_minutes: number; goal_type: string; level: number }
    | undefined;
  if (!row) return fallback;
  return {
    target: row.daily_minutes,
    type: row.goal_type === "count" ? "count" : "minutes",
    level: row.level ?? 0,
  };
}

export function setGoal(
  userId: number,
  subjectId: number,
  target: number,
  type: GoalType,
  level = 0,
): void {
  getDb()
    .prepare(
      `INSERT INTO goals (user_id, subject_id, daily_minutes, goal_type, level) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, subject_id) DO UPDATE SET
         daily_minutes = excluded.daily_minutes,
         goal_type = excluded.goal_type,
         level = excluded.level`,
    )
    .run(userId, subjectId, Math.max(0, Math.round(target)), type, Math.max(0, Math.min(5, Math.round(level))));
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

// Vergibt Coins nach je 10 richtigen Aufgaben PRO TAG (fachübergreifend).
// Jeder Tag startet frisch bei 0 — kein Übertrag vom Vortag.
export function awardCorrectCoins(userId: number): { awarded: boolean; coins: number } {
  const db = getDb();
  const user = getUser(userId);
  if (!user) return { awarded: false, coins: 0 };
  const date = localDateStr();
  const correctToday = (
    db
      .prepare("SELECT COUNT(*) AS c FROM attempts WHERE user_id = ? AND is_correct = 1 AND date = ?")
      .get(userId, date) as { c: number }
  ).c;
  const target = Math.floor(correctToday / 10);
  const row = db
    .prepare("SELECT awarded FROM coin_day WHERE user_id = ? AND date = ?")
    .get(userId, date) as { awarded: number } | undefined;
  const awarded = row?.awarded ?? 0;
  if (target > awarded) {
    const gain = target - awarded;
    db.prepare(
      `INSERT INTO coin_day (user_id, date, awarded) VALUES (?, ?, ?)
       ON CONFLICT(user_id, date) DO UPDATE SET awarded = excluded.awarded`,
    ).run(userId, date, target);
    db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?").run(gain, userId);
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

// --- Belohnungen: Coins gegen Bildschirmzeit ---

export type RewardPackageRow = {
  id: number;
  family_id: number;
  minutes: number;
  coins: number;
  sort: number;
  active: number;
};

export type RewardRequestRow = {
  id: number;
  user_id: number;
  family_id: number;
  minutes: number;
  coins: number;
  status: "pending" | "approved" | "declined";
  created_at: number;
  decided_at: number | null;
};

export type RewardRequestWithChild = RewardRequestRow & {
  user_name: string;
  emoji: string;
  color: string;
};

const DEFAULT_REWARD_PACKAGES: Array<[number, number]> = [[15, 3], [30, 5], [60, 9]];

// Legt für eine Familie die Standard-Pakete an, falls noch keine existieren.
export function seedRewardPackages(familyId: number): void {
  const db = getDb();
  const has = (
    db.prepare("SELECT COUNT(*) c FROM reward_packages WHERE family_id = ?").get(familyId) as {
      c: number;
    }
  ).c;
  if (has > 0) return;
  const ins = db.prepare(
    "INSERT INTO reward_packages (family_id, minutes, coins, sort, active) VALUES (?, ?, ?, ?, 1)",
  );
  DEFAULT_REWARD_PACKAGES.forEach(([m, c], i) => ins.run(familyId, m, c, i));
}

export function listRewardPackages(familyId: number, activeOnly = false): RewardPackageRow[] {
  const db = getDb();
  seedRewardPackages(familyId);
  const where = activeOnly ? "AND active = 1" : "";
  return db
    .prepare(`SELECT * FROM reward_packages WHERE family_id = ? ${where} ORDER BY sort, minutes`)
    .all(familyId) as RewardPackageRow[];
}

export function getRewardPackage(id: number, familyId: number): RewardPackageRow | null {
  return (
    (getDb()
      .prepare("SELECT * FROM reward_packages WHERE id = ? AND family_id = ?")
      .get(id, familyId) as RewardPackageRow) ?? null
  );
}

export function createRewardPackage(
  familyId: number,
  minutes: number,
  coins: number,
): RewardPackageRow {
  const db = getDb();
  const maxSort =
    (db.prepare("SELECT MAX(sort) m FROM reward_packages WHERE family_id = ?").get(familyId) as {
      m: number | null;
    }).m ?? 0;
  const info = db
    .prepare(
      "INSERT INTO reward_packages (family_id, minutes, coins, sort, active) VALUES (?, ?, ?, ?, 1)",
    )
    .run(familyId, minutes, coins, maxSort + 1);
  return getRewardPackage(Number(info.lastInsertRowid), familyId)!;
}

export function updateRewardPackage(
  id: number,
  familyId: number,
  fields: { minutes?: number; coins?: number; active?: boolean },
): RewardPackageRow | null {
  const db = getDb();
  if (!getRewardPackage(id, familyId)) return null;
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (fields.minutes !== undefined) {
    sets.push("minutes = ?");
    vals.push(fields.minutes);
  }
  if (fields.coins !== undefined) {
    sets.push("coins = ?");
    vals.push(fields.coins);
  }
  if (fields.active !== undefined) {
    sets.push("active = ?");
    vals.push(fields.active ? 1 : 0);
  }
  if (sets.length) {
    vals.push(id);
    db.prepare(`UPDATE reward_packages SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  }
  return getRewardPackage(id, familyId);
}

export function deleteRewardPackage(id: number, familyId: number): boolean {
  return (
    getDb().prepare("DELETE FROM reward_packages WHERE id = ? AND family_id = ?").run(id, familyId)
      .changes > 0
  );
}

export function getRewardRequest(id: number): RewardRequestRow | null {
  return (
    (getDb().prepare("SELECT * FROM reward_requests WHERE id = ?").get(id) as RewardRequestRow) ??
    null
  );
}

// Kind stellt eine Anfrage. Coins werden NOCH NICHT abgezogen (erst bei
// Bestätigung durch die Eltern).
export function createRewardRequest(
  userId: number,
  familyId: number,
  packageId: number,
): { ok: boolean; error?: string; request?: RewardRequestRow } {
  const db = getDb();
  const pkg = getRewardPackage(packageId, familyId);
  if (!pkg || !pkg.active) return { ok: false, error: "Paket nicht verfügbar" };
  const user = getUser(userId);
  if (!user) return { ok: false, error: "Kind nicht gefunden" };
  if (user.coins < pkg.coins) return { ok: false, error: "Nicht genug Coins" };
  const info = db
    .prepare(
      "INSERT INTO reward_requests (user_id, family_id, minutes, coins, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
    )
    .run(userId, familyId, pkg.minutes, pkg.coins, Date.now());
  return { ok: true, request: getRewardRequest(Number(info.lastInsertRowid))! };
}

export function listRewardRequestsForFamily(
  familyId: number,
  status?: RewardRequestRow["status"],
): RewardRequestWithChild[] {
  const db = getDb();
  const where = status ? "AND r.status = ?" : "";
  const args = status ? [familyId, status] : [familyId];
  return db
    .prepare(
      `SELECT r.*, u.name AS user_name, u.emoji, u.color
       FROM reward_requests r JOIN users u ON u.id = r.user_id
       WHERE r.family_id = ? ${where}
       ORDER BY r.created_at DESC`,
    )
    .all(...args) as RewardRequestWithChild[];
}

export function listRewardRequestsForUser(userId: number, limit = 20): RewardRequestRow[] {
  return getDb()
    .prepare("SELECT * FROM reward_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(userId, limit) as RewardRequestRow[];
}

export function countPendingRewardRequests(familyId: number): number {
  return (
    getDb()
      .prepare("SELECT COUNT(*) c FROM reward_requests WHERE family_id = ? AND status = 'pending'")
      .get(familyId) as { c: number }
  ).c;
}

// Eltern-Entscheidung. Bei Bestätigung werden die Coins jetzt abgezogen
// (mit erneuter Deckungsprüfung, da das Kind zwischenzeitlich Coins ausgegeben
// haben könnte).
export function decideRewardRequest(
  id: number,
  familyId: number,
  approve: boolean,
): { ok: boolean; error?: string; coins?: number } {
  const db = getDb();
  const req = getRewardRequest(id);
  if (!req || req.family_id !== familyId) return { ok: false, error: "Nicht gefunden" };
  if (req.status !== "pending") return { ok: false, error: "Schon entschieden" };
  if (!approve) {
    db.prepare("UPDATE reward_requests SET status = 'declined', decided_at = ? WHERE id = ?").run(
      Date.now(),
      id,
    );
    return { ok: true };
  }
  const user = getUser(req.user_id);
  if (!user) return { ok: false, error: "Kind nicht gefunden" };
  if (user.coins < req.coins) return { ok: false, error: "Kind hat nicht genug Coins" };
  db.transaction(() => {
    db.prepare("UPDATE users SET coins = coins - ? WHERE id = ?").run(req.coins, req.user_id);
    db.prepare("UPDATE reward_requests SET status = 'approved', decided_at = ? WHERE id = ?").run(
      Date.now(),
      id,
    );
  })();
  return { ok: true, coins: user.coins - req.coins };
}

// --- Vokabelheft ---

function vocabKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?,;:"']/g, "");
}

// Richtungsunabhängiger Schlüssel für ein Wortpaar: Deutsch↔Englisch ergibt
// denselben norm-Wert, egal welche Seite Frage/Antwort ist. So wird dieselbe
// Vokabel nie doppelt angelegt.
function pairNorm(a: string, b: string): string {
  const ka = vocabKey(a);
  const kb = vocabKey(b);
  return ka <= kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

// Erfasst eine abgefragte Vokabel (Upsert) und aktualisiert die Leitner-Box:
// richtig → Box hoch (max 5), falsch → zurück auf Box 1 (kommt bald wieder).
export function recordVocab(
  userId: number,
  subjectId: number,
  prompt: string,
  answer: string,
  isCorrect: boolean,
): void {
  const db = getDb();
  const norm = pairNorm(prompt, answer);
  const now = Date.now();
  const row = db
    .prepare("SELECT id, box FROM vocab WHERE user_id = ? AND norm = ?")
    .get(userId, norm) as { id: number; box: number } | undefined;
  if (!row) {
    db.prepare(
      `INSERT INTO vocab (user_id, subject_id, prompt, answer, norm, seen, correct, wrong, box, last_seen, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
    ).run(userId, subjectId, prompt, answer, norm, isCorrect ? 1 : 0, isCorrect ? 0 : 1, isCorrect ? 2 : 1, now, now);
  } else {
    const box = isCorrect ? Math.min(row.box + 1, 5) : 1;
    db.prepare(
      `UPDATE vocab SET seen = seen + 1, correct = correct + ?, wrong = wrong + ?, box = ?, last_seen = ?, prompt = ?, answer = ? WHERE id = ?`,
    ).run(isCorrect ? 1 : 0, isCorrect ? 0 : 1, box, now, prompt, answer, row.id);
  }
}

// Fällige Vokabeln zum Wiederholen: niedrige Box (oft falsch) und lange nicht
// gesehen zuerst.
export function dueVocab(userId: number, subjectId: number, limit: number): VocabRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM vocab WHERE user_id = ? AND subject_id = ? AND box < 5
       ORDER BY box ASC, COALESCE(last_seen, 0) ASC LIMIT ?`,
    )
    .all(userId, subjectId, limit) as VocabRow[];
}

export function listVocab(userId: number): VocabRow[] {
  return getDb()
    .prepare("SELECT * FROM vocab WHERE user_id = ? ORDER BY wrong DESC, last_seen DESC")
    .all(userId) as VocabRow[];
}

// Statische Vokabelliste ins Vokabelheft eines Kindes importieren (Upsert).
// Vorhandene (gleiches prompt|answer) werden übersprungen. Neue starten in
// Box 1, damit sie bald im Training als Wiederholung drankommen.
export function importVocab(
  userId: number,
  subjectId: number,
  pairs: { prompt: string; answer: string }[],
): { added: number; skipped: number } {
  const db = getDb();
  const now = Date.now();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO vocab
       (user_id, subject_id, prompt, answer, norm, seen, correct, wrong, box, last_seen, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, 1, NULL, ?)`,
  );
  let added = 0;
  const run = db.transaction((rows: { prompt: string; answer: string }[]) => {
    for (const p of rows) {
      const norm = pairNorm(p.prompt, p.answer);
      const res = insert.run(userId, subjectId, p.prompt, p.answer, norm, now);
      if (res.changes > 0) added++;
    }
  });
  run(pairs);
  return { added, skipped: pairs.length - added };
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

// Eltern-PIN ist jetzt pro Familie (Spalte families.parent_pin_hash).
export function getParentPinHash(familyId: number): string | null {
  const row = getDb()
    .prepare("SELECT parent_pin_hash FROM families WHERE id = ?")
    .get(familyId) as { parent_pin_hash: string | null } | undefined;
  return row?.parent_pin_hash ?? null;
}
export function setParentPin(familyId: number, pin: string | null): void {
  getDb()
    .prepare("UPDATE families SET parent_pin_hash = ? WHERE id = ?")
    .run(pin ? hashPin(pin) : null, familyId);
}
