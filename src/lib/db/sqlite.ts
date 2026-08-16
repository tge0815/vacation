import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { hashPassword } from "../auth/password";

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
  {
    // Belohnung: Coins pro Kind (1 pro geschafftem Tagesziel). coin_log stellt
    // sicher, dass es pro Tag nur einmal einen Coin gibt.
    name: "005_coins",
    sql: `
      ALTER TABLE users ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
      CREATE TABLE IF NOT EXISTS coin_log (
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, date)
      );
    `,
  },
  {
    // Highscores: bester Wert pro Kind & Spiel.
    name: "006_game_scores",
    sql: `
      CREATE TABLE IF NOT EXISTS game_scores (
        user_id INTEGER NOT NULL,
        game TEXT NOT NULL,
        best INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, game)
      );
    `,
  },
  {
    // Neues Fach Erdkunde (Hauptstädte, Flaggen, Länder & Kontinente).
    name: "007_geografie",
    run: (db: Database.Database) => {
      let row = db.prepare("SELECT id FROM subjects WHERE key = 'geografie'").get() as
        | { id: number }
        | undefined;
      if (!row) {
        const info = db
          .prepare(
            "INSERT INTO subjects (key, name, color, icon, sort, active) VALUES ('geografie','Erdkunde','cyan','Globe',3,1)",
          )
          .run();
        row = { id: Number(info.lastInsertRowid) };
      }
      const sid = row.id;
      const ins = db.prepare(
        "INSERT OR IGNORE INTO topics (subject_id, key, name, description, input_hint, sort, active) VALUES (?, ?, ?, ?, ?, ?, 1)",
      );
      GEOGRAFIE_TOPICS.forEach((t, i) =>
        ins.run(sid, t.key, t.name, t.description, t.input_hint ?? null, i),
      );
    },
  },
  {
    // Standard-Ziele für Bestandskinder ohne jegliche Ziele nachziehen, damit
    // das Tagesziel (und damit Coins) funktioniert. Kinder, für die schon Ziele
    // gesetzt sind, bleiben unangetastet; Erdkunde bleibt bei 0 (= aus).
    // Interaktive Landkarte als Erdkunde-Thema (client-seitig, input_hint 'map').
    name: "008_landkarte",
    run: (db: Database.Database) => {
      const row = db.prepare("SELECT id FROM subjects WHERE key = 'geografie'").get() as
        | { id: number }
        | undefined;
      if (!row) return;
      db.prepare(
        "INSERT OR IGNORE INTO topics (subject_id, key, name, description, input_hint, sort, active) VALUES (?, 'landkarte', 'Landkarte', ?, 'map', 3, 1)",
      ).run(row.id, "Länder auf der Karte finden und benennen (Europa und Welt).");
    },
  },
  {
    // Standard-Ziele für Bestandskinder ohne jegliche Ziele nachziehen, damit
    // das Tagesziel (und damit Coins) funktioniert. Kinder, für die schon Ziele
    // gesetzt sind, bleiben unangetastet; Erdkunde bleibt bei 0 (= aus).
    name: "009_seed_core_goals",
    run: (db: Database.Database) => {
      const subj: Record<string, number> = {};
      for (const key of ["deutsch", "mathe", "englisch"]) {
        const s = db.prepare("SELECT id FROM subjects WHERE key = ?").get(key) as
          | { id: number }
          | undefined;
        if (s) subj[key] = s.id;
      }
      const users = db.prepare("SELECT id FROM users").all() as Array<{ id: number }>;
      const countGoals = db.prepare("SELECT COUNT(*) AS c FROM goals WHERE user_id = ?");
      const ins = db.prepare(
        "INSERT OR IGNORE INTO goals (user_id, subject_id, daily_minutes, goal_type) VALUES (?, ?, 10, 'minutes')",
      );
      for (const u of users) {
        const c = (countGoals.get(u.id) as { c: number }).c;
        if (c === 0) for (const key of Object.keys(subj)) ins.run(u.id, subj[key]);
      }
    },
  },
  {
    // Coins pro geschafftem Fach & Tag (statt 1/Tag).
    name: "010_coin_awards",
    sql: `
      CREATE TABLE IF NOT EXISTS coin_awards (
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, subject_id, date)
      );
    `,
  },
  {
    // Coins nach je 10 richtigen Aufgaben. correct_coins = bereits dafür
    // vergebene Coins. Für Bestandskinder auf floor(richtige/10) setzen, damit
    // es keinen rückwirkenden Schwall gibt.
    name: "011_correct_coins",
    sql: `ALTER TABLE users ADD COLUMN correct_coins INTEGER NOT NULL DEFAULT 0;`,
    run: (db: Database.Database) => {
      const users = db.prepare("SELECT id FROM users").all() as Array<{ id: number }>;
      const cnt = db.prepare("SELECT COUNT(*) AS c FROM attempts WHERE user_id = ? AND is_correct = 1");
      const upd = db.prepare("UPDATE users SET correct_coins = ? WHERE id = ?");
      for (const u of users) {
        const c = (cnt.get(u.id) as { c: number }).c;
        upd.run(Math.floor(c / 10), u.id);
      }
    },
  },
  {
    // Vokabelheft pro Kind: abgefragte Vokabeln + richtig/falsch + Leitner-Box
    // für die Wiederholung.
    name: "012_vocab",
    sql: `
      CREATE TABLE IF NOT EXISTS vocab (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        answer TEXT NOT NULL,
        norm TEXT NOT NULL,
        seen INTEGER NOT NULL DEFAULT 0,
        correct INTEGER NOT NULL DEFAULT 0,
        wrong INTEGER NOT NULL DEFAULT 0,
        box INTEGER NOT NULL DEFAULT 1,
        last_seen INTEGER,
        created_at INTEGER NOT NULL,
        UNIQUE(user_id, norm)
      );
      CREATE INDEX IF NOT EXISTS idx_vocab_user ON vocab(user_id);
    `,
  },
  {
    // Schwierigkeits-Stufe pro Fach: 0 = automatisch (adaptiv), 1-5 = fest.
    name: "013_goal_level",
    sql: `ALTER TABLE goals ADD COLUMN level INTEGER NOT NULL DEFAULT 0;`,
  },
  {
    // Coins pro Tag frisch zählen: awarded = wie viele 10er-Blöcke heute schon
    // vergeben wurden. So startet jeder Tag bei 0 (kein Übertrag vom Vortag).
    name: "014_coin_day",
    sql: `
      CREATE TABLE IF NOT EXISTS coin_day (
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        awarded INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, date)
      );
    `,
  },
  {
    // Vokabeln richtungsunabhängig machen: Deutsch↔Englisch ist EINE Vokabel.
    // Der norm-Schlüssel wird sortiert (a|b statt prompt|answer), damit dieselbe
    // Vokabel in beiden Richtungen als Dublette erkannt wird. Bereits vorhandene
    // Einträge werden zusammengeführt (Statistik summiert, höchste Box gewinnt).
    name: "015_vocab_dir_agnostic",
    run: (db) => {
      const rows = db.prepare("SELECT * FROM vocab").all() as Array<{
        user_id: number;
        subject_id: number;
        prompt: string;
        answer: string;
        norm: string;
        seen: number;
        correct: number;
        wrong: number;
        box: number;
        last_seen: number | null;
        created_at: number;
      }>;
      const canon = (norm: string): string => {
        const i = norm.indexOf("|");
        if (i < 0) return norm;
        const a = norm.slice(0, i);
        const b = norm.slice(i + 1);
        return a <= b ? `${a}|${b}` : `${b}|${a}`;
      };
      const groups = new Map<string, (typeof rows)[number]>();
      for (const r of rows) {
        const cn = canon(r.norm);
        const key = `${r.user_id}::${cn}`;
        const g = groups.get(key);
        if (!g) {
          groups.set(key, { ...r, norm: cn });
        } else {
          g.seen += r.seen;
          g.correct += r.correct;
          g.wrong += r.wrong;
          g.box = Math.max(g.box, r.box);
          g.last_seen = Math.max(g.last_seen ?? 0, r.last_seen ?? 0) || null;
          g.created_at = Math.min(g.created_at, r.created_at);
        }
      }
      const ins = db.prepare(
        `INSERT INTO vocab (user_id, subject_id, prompt, answer, norm, seen, correct, wrong, box, last_seen, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const tx = db.transaction(() => {
        db.exec("DELETE FROM vocab");
        for (const g of groups.values()) {
          ins.run(
            g.user_id,
            g.subject_id,
            g.prompt,
            g.answer,
            g.norm,
            g.seen,
            g.correct,
            g.wrong,
            g.box,
            g.last_seen ?? null,
            g.created_at,
          );
        }
      });
      tx();
    },
  },
  {
    // Mehr-Familien-Fähigkeit: Familien-Konten mit Login (E-Mail + Passwort).
    name: "016_families",
    sql: `
      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        parent_pin_hash TEXT,
        created_at INTEGER NOT NULL
      );
    `,
  },
  {
    // Kinder einer Familie zuordnen. Bestehende Kinder wandern in eine
    // Standard-Familie (Login aus LEARN_DEFAULT_FAMILY_* oder eltern@local/lernen),
    // damit lokale Daten weiter funktionieren.
    name: "017_users_family",
    run: (db) => {
      const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
      if (!cols.some((c) => c.name === "family_id")) {
        db.exec("ALTER TABLE users ADD COLUMN family_id INTEGER");
      }
      const orphan = db.prepare("SELECT COUNT(*) AS c FROM users WHERE family_id IS NULL").get() as {
        c: number;
      };
      if (orphan.c > 0) {
        const email = process.env.LEARN_DEFAULT_FAMILY_EMAIL ?? "eltern@local";
        let fam = db.prepare("SELECT id FROM families WHERE email = ?").get(email) as
          | { id: number }
          | undefined;
        if (!fam) {
          const pw = process.env.LEARN_DEFAULT_FAMILY_PASSWORD ?? "lernen";
          const parentPin =
            (
              db.prepare("SELECT value FROM meta WHERE key = 'parent_pin_hash'").get() as
                | { value: string }
                | undefined
            )?.value || null;
          const info = db
            .prepare(
              "INSERT INTO families (name, email, password_hash, parent_pin_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            )
            .run("Familie", email, hashPassword(pw), parentPin, Date.now());
          fam = { id: Number(info.lastInsertRowid) };
        }
        db.prepare("UPDATE users SET family_id = ? WHERE family_id IS NULL").run(fam.id);
      }
    },
  },
  {
    // Themen an/aus jetzt pro Familie (statt global). Ohne Eintrag gilt der
    // globale Standard (topics.active). Ein Override schaltet für eine Familie um.
    name: "018_family_topic_prefs",
    sql: `
      CREATE TABLE IF NOT EXISTS family_topic_prefs (
        family_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (family_id, topic_id)
      );
    `,
  },
  {
    // Vokabeln werden ein EIGENER Lernbereich (Fach), getrennt von den
    // Englisch-Aufgaben. Bestehendes vokabeln-Thema + alle vocab-Zeilen wandern
    // von Englisch ins neue Fach; jedes Kind bekommt ein Standard-Tagesziel.
    // Idempotent: Frisch-Installationen haben das Fach schon aus dem Seed (002).
    name: "019_vokabeln_subject",
    run: (db) => {
      const idByKey = (key: string): number | undefined =>
        (db.prepare("SELECT id FROM subjects WHERE key = ?").get(key) as { id: number } | undefined)
          ?.id;

      const englischId = idByKey("englisch");
      let vokId = idByKey("vokabeln");
      if (!vokId) {
        const info = db
          .prepare(
            "INSERT INTO subjects (key, name, color, icon, sort, active) VALUES ('vokabeln','Vokabeln','violet','BookA',3,1)",
          )
          .run();
        vokId = Number(info.lastInsertRowid);
        // Erdkunde hinter die Vokabeln schieben (nur Sortierung).
        db.prepare("UPDATE subjects SET sort = 4 WHERE key = 'geografie'").run();
      }

      // vokabeln-Thema von Englisch ins neue Fach umhängen (erhält topic_id +
      // Attempt-Historie). Falls das Zielfach schon eins hat: das aus Englisch
      // entfernen, um die UNIQUE(subject_id,key) nicht zu verletzen.
      if (englischId) {
        const engTopic = db
          .prepare("SELECT id FROM topics WHERE subject_id = ? AND key = 'vokabeln'")
          .get(englischId) as { id: number } | undefined;
        if (engTopic) {
          const already = db
            .prepare("SELECT id FROM topics WHERE subject_id = ? AND key = 'vokabeln'")
            .get(vokId) as { id: number } | undefined;
          if (already) {
            db.prepare("DELETE FROM topics WHERE id = ?").run(engTopic.id);
          } else {
            db.prepare(
              "UPDATE topics SET subject_id = ?, sort = 0, description = ? WHERE id = ?",
            ).run(vokId, VOCAB_TOPIC_DESC, engTopic.id);
          }
        }
        // Vokabelheft-Einträge ins neue Fach übernehmen.
        db.prepare("UPDATE vocab SET subject_id = ? WHERE subject_id = ?").run(vokId, englischId);
      }

      // Sicherstellen, dass das neue Fach ein vokabeln-Thema hat.
      const hasTopic = db
        .prepare("SELECT id FROM topics WHERE subject_id = ? AND key = 'vokabeln'")
        .get(vokId) as { id: number } | undefined;
      if (!hasTopic) {
        db.prepare(
          "INSERT INTO topics (subject_id, key, name, description, input_hint, sort, active) VALUES (?, 'vokabeln', 'Vokabeln', ?, NULL, 0, 1)",
        ).run(vokId, VOCAB_TOPIC_DESC);
      }

      // Standard-Tagesziel (10 Vokabeln/Tag) für bestehende Kinder.
      const users = db.prepare("SELECT id FROM users").all() as Array<{ id: number }>;
      const insGoal = db.prepare(
        "INSERT OR IGNORE INTO goals (user_id, subject_id, daily_minutes, goal_type, level) VALUES (?, ?, 10, 'count', 0)",
      );
      for (const u of users) insGoal.run(u.id, vokId);
    },
  },
  {
    // Eigener Kind-Login: Benutzername + Passwort (vom Elternteil vergeben).
    // Ersetzt den 4-stelligen Profil-PIN. Benutzername ist global eindeutig,
    // damit der Login ohne Familien-Kontext aufgelöst werden kann.
    name: "020_child_login",
    run: (db) => {
      const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
      if (!cols.some((c) => c.name === "username")) {
        db.exec("ALTER TABLE users ADD COLUMN username TEXT");
      }
      if (!cols.some((c) => c.name === "password_hash")) {
        db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
      }
      db.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL",
      );
    },
  },
  {
    // Coins gegen Bildschirmzeit: konfigurierbare Pakete (Minuten<->Coins) pro
    // Familie + Anfragen der Kinder (Coins werden erst bei Bestätigung abgezogen).
    name: "021_rewards",
    run: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS reward_packages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          family_id INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          coins INTEGER NOT NULL,
          sort INTEGER NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1
        );
        CREATE INDEX IF NOT EXISTS idx_reward_pkg_family ON reward_packages(family_id);
        CREATE TABLE IF NOT EXISTS reward_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          family_id INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          coins INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at INTEGER NOT NULL,
          decided_at INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_reward_req_family ON reward_requests(family_id, status);
        CREATE INDEX IF NOT EXISTS idx_reward_req_user ON reward_requests(user_id, created_at);
      `);
      // Standard-Pakete für bereits bestehende Familien.
      const fams = db.prepare("SELECT id FROM families").all() as Array<{ id: number }>;
      const ins = db.prepare(
        "INSERT INTO reward_packages (family_id, minutes, coins, sort, active) VALUES (?, ?, ?, ?, 1)",
      );
      const defaults: Array<[number, number]> = [[15, 3], [30, 5], [60, 9]];
      for (const f of fams) {
        const has = (
          db.prepare("SELECT COUNT(*) c FROM reward_packages WHERE family_id = ?").get(f.id) as {
            c: number;
          }
        ).c;
        if (has === 0) defaults.forEach(([m, c], i) => ins.run(f.id, m, c, i));
      }
    },
  },
  {
    // Persistenter Aufgaben-Vorrat pro (Kind, Fach): bereits generierte, noch
    // nicht verbrauchte Aufgaben (als JSON). Übersteht Neustarts/Deploys, damit
    // beim Wieder-Öffnen einer Kachel nichts neu generiert werden muss.
    name: "022_exercise_pool",
    run: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS exercise_pool (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject_id INTEGER NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_exercise_pool_us ON exercise_pool(user_id, subject_id, id);
      `);
    },
  },
  {
    // Für die native Companion-App (Apple Screen Time): markiert, wann eine
    // bestätigte Bildschirmzeit-Freigabe auf dem Gerät tatsächlich eingelöst
    // (aktiviert) wurde, damit sie nicht doppelt gewährt wird.
    name: "023_reward_redeemed",
    run: (db) => {
      const cols = db.prepare("PRAGMA table_info(reward_requests)").all() as Array<{ name: string }>;
      if (!cols.some((c) => c.name === "redeemed_at")) {
        db.exec("ALTER TABLE reward_requests ADD COLUMN redeemed_at INTEGER");
      }
    },
  },
  {
    // Spiele-Werkstatt: abgeschlossene Programmier-Lektionen pro Kind.
    name: "024_code_progress",
    run: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS code_progress (
          user_id INTEGER NOT NULL,
          lesson_key TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, lesson_key)
        );
      `);
    },
  },
  {
    // Adaptiver Tagesplan (Lernpfad): pro Kind & Tag einmal ausgewählt und
    // gespeichert, damit er sich im Laufe des Tages nicht umsortiert.
    name: "025_daily_plan",
    run: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS daily_plan (
          user_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, date)
        );
      `);
    },
  },
  {
    // Eigener Admin-Login (getrennt von den Familien). Wird beim Start aus
    // LEARN_ADMIN_USER / LEARN_ADMIN_PASSWORD befüllt (siehe seedAdminFromEnv).
    name: "026_admins",
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_login_at INTEGER
      );
    `,
  },
  {
    // Widerrufbare Einladungscodes statt eines einzigen .env-Codes.
    // max_uses NULL = unbegrenzt, expires_at NULL = kein Ablauf.
    name: "027_invite_codes",
    sql: `
      CREATE TABLE IF NOT EXISTS invite_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        label TEXT,
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER,
        revoked INTEGER NOT NULL DEFAULT 0,
        created_by INTEGER,
        created_at INTEGER NOT NULL
      );
    `,
  },
  {
    // Letzter Login je Familie (Eltern) und je Kind.
    name: "028_last_login",
    run: (db) => {
      const famCols = db.prepare("PRAGMA table_info(families)").all() as Array<{ name: string }>;
      if (!famCols.some((c) => c.name === "last_login_at")) {
        db.exec("ALTER TABLE families ADD COLUMN last_login_at INTEGER");
      }
      const userCols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
      if (!userCols.some((c) => c.name === "last_login_at")) {
        db.exec("ALTER TABLE users ADD COLUMN last_login_at INTEGER");
      }
    },
  },
  {
    // Einmalig den vorgenerierten Aufgaben-Vorrat leeren: ältere Batches
    // konnten grammatikalisch falsche Lückentexte enthalten (z.B. trennbare
    // Verben mit Vorsilbe in der Lücke). Wird mit dem verbesserten Prompt neu
    // generiert. Betrifft nur den Cache, keine Historie/Fortschritte.
    name: "029_flush_exercise_pool",
    run: (db) => {
      const exists = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'exercise_pool'")
        .get();
      if (exists) db.exec("DELETE FROM exercise_pool");
    },
  },
];

// Admin-Konto aus den Umgebungsvariablen sicherstellen. Die .env ist die
// Quelle der Wahrheit: Ist ein Konto vorhanden, wird bei jedem Start das
// Passwort auf den .env-Wert gesetzt (bequemes Zurücksetzen/Rotieren).
function seedAdminFromEnv(database: Database.Database) {
  const username = (process.env.LEARN_ADMIN_USER ?? "").trim();
  const password = process.env.LEARN_ADMIN_PASSWORD ?? "";
  if (!username || !password) return;
  const hash = hashPassword(password);
  const existing = database.prepare("SELECT id FROM admins WHERE username = ?").get(username) as
    | { id: number }
    | undefined;
  if (existing) {
    database.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, existing.id);
  } else {
    database
      .prepare("INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)")
      .run(username, hash, Date.now());
  }
}

// Themen-Beschreibung fürs Vokabel-Training (eigener Lernbereich). Fragt EIN
// Wort/eine kurze Wendung ab, Richtung wechselt (Deutsch↔Englisch).
const VOCAB_TOPIC_DESC =
  "Wörter zwischen Deutsch und Englisch übersetzen. Frage GENAU EIN einzelnes Wort oder eine kurze Wendung ab (kein ganzer Satz), mal Deutsch→Englisch, mal Englisch→Deutsch. inputMode 'text', die Lösung ist kurz und eindeutig. Alltagsnaher Grundwortschatz der 5. Klasse.";

const GEOGRAFIE_TOPICS: Array<{
  key: string;
  name: string;
  description: string;
  input_hint?: string;
}> = [
  {
    key: "hauptstaedte",
    name: "Hauptstädte",
    description:
      "Hauptstädte europäischer Länder sowie die größten Hauptstädte der Welt. Frage nach der Hauptstadt eines Landes. Nutze bevorzugt Multiple-Choice (inputMode 'choice') mit 3-4 plausiblen Städten zur Auswahl.",
  },
  {
    key: "flaggen",
    name: "Flaggen",
    description:
      "Länder an ihrer Flagge erkennen. Stelle die Flagge als Emoji dar (z.B. 🇫🇷) und frage, zu welchem Land sie gehört. Multiple-Choice mit 3-4 Ländern. Bekannte Länder aus Europa und der Welt.",
  },
  {
    key: "laender_kontinente",
    name: "Länder & Kontinente",
    description:
      "Auf welchem Kontinent liegt ein Land, welche Länder grenzen aneinander, welches ist das größte/bekannteste Land einer Region. Bevorzugt Multiple-Choice, altersgerecht für die 5. Klasse.",
  },
  {
    key: "landkarte",
    name: "Landkarte",
    description: "Länder auf der Karte finden und benennen (Europa und Welt).",
    input_hint: "map",
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
        key: "grammatik",
        name: "Grammatik",
        description: "Simple Present, Simple Past, Artikel, Plural, Fragen.",
      },
    ],
  },
  {
    // Eigener Lernbereich Vokabeln (getrennt von den Englisch-Aufgaben).
    // Fragt die eingegebenen/importierten Wörter ab (beide Richtungen) und
    // lässt die KI passende neue Vokabeln ergänzen.
    key: "vokabeln",
    name: "Vokabeln",
    color: "violet",
    icon: "BookA",
    topics: [
      {
        key: "vokabeln",
        name: "Vokabeln",
        description: VOCAB_TOPIC_DESC,
      },
    ],
  },
  {
    key: "geografie",
    name: "Erdkunde",
    color: "cyan",
    icon: "Globe",
    topics: GEOGRAFIE_TOPICS,
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
  seedAdminFromEnv(db);
  return db;
}

// --- Row-Typen ---

export type UserRow = {
  id: number;
  family_id: number;
  name: string;
  color: string;
  emoji: string;
  pin_hash: string | null;
  username: string | null;
  password_hash: string | null;
  grade: number;
  sort: number;
  coins: number;
  correct_coins: number;
  created_at: number;
  last_login_at: number | null;
};

export type FamilyRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  parent_pin_hash: string | null;
  created_at: number;
  last_login_at: number | null;
};

export type AdminRow = {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
  last_login_at: number | null;
};

export type InviteCodeRow = {
  id: number;
  code: string;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: number | null;
  revoked: number;
  created_by: number | null;
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
  level: number; // 0 = adaptiv, 1-5 = feste Schwierigkeit
};

export type VocabRow = {
  id: number;
  user_id: number;
  subject_id: number;
  prompt: string;
  answer: string;
  norm: string;
  seen: number;
  correct: number;
  wrong: number;
  box: number;
  last_seen: number | null;
  created_at: number;
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
