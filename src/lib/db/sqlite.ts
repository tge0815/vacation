import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

// Default: ./data lokal (Dockerfile setzt LEARN_DATA_DIR=/data fuer Container)
const DATA_DIR = process.env.LEARN_DATA_DIR ?? "./data";
const DB_PATH = process.env.LEARN_DB_PATH ?? join(DATA_DIR, "lernferien.db");

let db: Database.Database | null = null;

const MIGRATIONS: Array<{ name: string; sql?: string; run?: (db: Database.Database) => void }> = [
  {
    name: "001_init",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'sky',
        emoji TEXT NOT NULL DEFAULT '🙂',
        pin_hash TEXT,
        grade INTEGER NOT NULL DEFAULT 5,
        sort INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        sort INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        input_hint TEXT,
        sort INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        UNIQUE(subject_id, key),
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        daily_minutes INTEGER NOT NULL DEFAULT 10,
        UNIQUE(user_id, subject_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        topic_id INTEGER,
        date TEXT NOT NULL,
        iso_week TEXT NOT NULL,
        difficulty INTEGER NOT NULL DEFAULT 2,
        input_mode TEXT NOT NULL DEFAULT 'text',
        exercise_json TEXT NOT NULL,
        answer_text TEXT,
        grade_json TEXT,
        is_correct INTEGER,
        score INTEGER,
        duration_sec INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_attempts_user_date ON attempts(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_attempts_user_subject ON attempts(user_id, subject_id);

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
  {
    name: "002_seed_subjects_topics",
    run: seedSubjectsAndTopics,
  },
  {
    // Mathe-Themen überarbeiten: Bruchrechnen (mit Rechnen) raus,
    // stattdessen ggT/Kürzen, unechte Brüche und schriftliches Rechnen.
    name: "003_mathe_topics_v2",
    run: (db: Database.Database) => {
      const mathe = db.prepare("SELECT id FROM subjects WHERE key = 'mathe'").get() as
        | { id: number }
        | undefined;
      if (!mathe) return;
      const sid = mathe.id;
      db.prepare("DELETE FROM topics WHERE subject_id = ? AND key = 'bruchrechnen'").run(sid);
      const ins = db.prepare(
        "INSERT OR IGNORE INTO topics (subject_id, key, name, description, input_hint, sort, active) VALUES (?, ?, ?, ?, NULL, ?, 1)",
      );
      ins.run(
        sid,
        "teiler_kuerzen",
        "Teiler & Kürzen",
        "Größten gemeinsamen Teiler (ggT) bestimmen, Brüche kürzen und erweitern. WICHTIG: nur ganze Zahlen und einzelne Brüche. KEIN Rechnen mit Brüchen (keine Addition, Subtraktion, Multiplikation oder Division von Brüchen).",
        0,
      );
      ins.run(
        sid,
        "unechte_brueche",
        "Unechte Brüche",
        "Unechte Brüche in gemischte Zahlen umwandeln und gemischte Zahlen in unechte Brüche. WICHTIG: KEIN Rechnen mit Brüchen.",
        1,
      );
      ins.run(
        sid,
        "schriftlich",
        "Schriftliches Rechnen",
        "Aufgaben zum schriftlichen Rechnen auf Papier: schriftliche Addition, Subtraktion und Multiplikation mehrstelliger Zahlen. Das Kind rechnet die Aufgabe auf einem Zettel und trägt nur das Ergebnis (eine Zahl) ein. Zahlen groß genug, dass sich schriftliches Rechnen lohnt.",
        2,
      );
      db.prepare("UPDATE topics SET sort = 3 WHERE subject_id = ? AND key = 'massstab'").run(sid);
      db.prepare("UPDATE topics SET sort = 4 WHERE subject_id = ? AND key = 'textaufgaben'").run(sid);
    },
  },
  {
    // Ziel-Typ: entweder Minuten pro Tag ('minutes') oder Anzahl Aufgaben
    // pro Tag ('count'). daily_minutes hält weiterhin den Zielwert (Zahl).
    name: "004_goal_type",
    sql: `ALTER TABLE goals ADD COLUMN goal_type TEXT NOT NULL DEFAULT 'minutes';`,
  },
];

type SubjectSeed = {
  key: string;
  name: string;
  color: string;
  icon: string;
  topics: Array<{ key: string; name: string; description: string; input_hint?: string }>;
};

const SUBJECT_SEEDS: SubjectSeed[] = [
  {
    key: "deutsch",
    name: "Deutsch",
    color: "rose",
    icon: "BookText",
    topics: [
      {
        key: "zeiten",
        name: "Zeiten",
        description:
          "Verben in die richtige Zeitform setzen (Präsens, Präteritum, Perfekt, Plusquamperfekt, Futur I).",
      },
      {
        key: "lueckentext",
        name: "Lückentext",
        description: "Wörter oder Wortformen sinnvoll in einen Text einsetzen.",
      },
      {
        key: "rechtschreibung",
        name: "Rechtschreibung",
        description: "das/dass, ss/ß, Groß- und Kleinschreibung, häufige Fehlerwörter.",
      },
      {
        key: "vorlesen",
        name: "Vorlesen",
        description: "Einen kurzen Text laut vorlesen – die App hört zu und gibt Rückmeldung.",
        input_hint: "reading",
      },
    ],
  },
  {
    key: "mathe",
    name: "Mathe",
    color: "blue",
    icon: "Calculator",
    topics: [
      {
        key: "teiler_kuerzen",
        name: "Teiler & Kürzen",
        description:
          "Größten gemeinsamen Teiler (ggT) bestimmen, Brüche kürzen und erweitern. WICHTIG: nur ganze Zahlen und einzelne Brüche. KEIN Rechnen mit Brüchen (keine Addition, Subtraktion, Multiplikation oder Division von Brüchen).",
      },
      {
        key: "unechte_brueche",
        name: "Unechte Brüche",
        description:
          "Unechte Brüche in gemischte Zahlen umwandeln und gemischte Zahlen in unechte Brüche. WICHTIG: KEIN Rechnen mit Brüchen.",
      },
      {
        key: "schriftlich",
        name: "Schriftliches Rechnen",
        description:
          "Aufgaben zum schriftlichen Rechnen auf Papier: schriftliche Addition, Subtraktion und Multiplikation mehrstelliger Zahlen. Das Kind rechnet die Aufgabe auf einem Zettel und trägt nur das Ergebnis (eine Zahl) ein. Zahlen groß genug, dass sich schriftliches Rechnen lohnt.",
      },
      {
        key: "massstab",
        name: "Maßstab",
        description: "Maßstab und Größenverhältnisse (Karte ↔ Wirklichkeit) berechnen.",
      },
      {
        key: "textaufgaben",
        name: "Textaufgaben",
        description: "Sachaufgaben mit mehreren Rechenschritten lösen.",
      },
    ],
  },
  {
    key: "englisch",
    name: "Englisch",
    color: "emerald",
    icon: "Languages",
    topics: [
      {
        key: "vokabeln",
        name: "Vokabeln",
        description: "Wörter zwischen Deutsch und Englisch übersetzen.",
      },
      {
        key: "grammatik",
        name: "Grammatik",
        description: "Simple Present, Simple Past, Artikel, Plural, Fragen.",
      },
    ],
  },
];

function seedSubjectsAndTopics(database: Database.Database) {
  const insSubject = database.prepare(
    "INSERT INTO subjects (key, name, color, icon, sort, active) VALUES (?, ?, ?, ?, ?, 1)",
  );
  const insTopic = database.prepare(
    "INSERT INTO topics (subject_id, key, name, description, input_hint, sort, active) VALUES (?, ?, ?, ?, ?, ?, 1)",
  );
  SUBJECT_SEEDS.forEach((s, si) => {
    const info = insSubject.run(s.key, s.name, s.color, s.icon, si);
    const subjectId = Number(info.lastInsertRowid);
    s.topics.forEach((t, ti) => {
      insTopic.run(subjectId, t.key, t.name, t.description, t.input_hint ?? null, ti);
    });
  });
  console.log(`[lern-db] ${SUBJECT_SEEDS.length} Fächer + Themen geseedet`);
}

function runMigrations(database: Database.Database) {
  database.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  );`);
  const applied = new Set(
    database
      .prepare("SELECT name FROM _migrations")
      .all()
      .map((r) => (r as { name: string }).name),
  );
  const insert = database.prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)");
  for (const m of MIGRATIONS) {
    if (applied.has(m.name)) continue;
    if (m.sql) database.exec(m.sql);
    if (m.run) m.run(database);
    insert.run(m.name, Date.now());
  }
}

export function getDb(): Database.Database {
  if (db) return db;
  try {
    if (!existsSync(dirname(DB_PATH))) mkdirSync(dirname(DB_PATH), { recursive: true });
  } catch (e) {
    console.error(
      `[lern-db] Konnte Daten-Verzeichnis nicht anlegen: ${dirname(DB_PATH)}.`,
      `Setze LEARN_DATA_DIR z.B. auf "./data" in .env.local.`,
      e,
    );
    throw e;
  }
  console.log(`[lern-db] SQLite-Datei: ${DB_PATH}`);
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}

// --- Row-Typen ---

export type UserRow = {
  id: number;
  name: string;
  color: string;
  emoji: string;
  pin_hash: string | null;
  grade: number;
  sort: number;
  created_at: number;
};

export type SubjectRow = {
  id: number;
  key: string;
  name: string;
  color: string;
  icon: string;
  sort: number;
  active: number;
};

export type TopicRow = {
  id: number;
  subject_id: number;
  key: string;
  name: string;
  description: string | null;
  input_hint: string | null;
  sort: number;
  active: number;
};

export type GoalRow = {
  id: number;
  user_id: number;
  subject_id: number;
  daily_minutes: number; // Zielwert: Minuten (goal_type='minutes') oder Aufgaben-Anzahl ('count')
  goal_type: string;
};

export type AttemptRow = {
  id: number;
  user_id: number;
  subject_id: number;
  topic_id: number | null;
  date: string;
  iso_week: string;
  difficulty: number;
  input_mode: string;
  exercise_json: string;
  answer_text: string | null;
  grade_json: string | null;
  is_correct: number | null;
  score: number | null;
  duration_sec: number;
  created_at: number;
};
