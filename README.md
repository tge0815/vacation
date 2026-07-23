# Ferien-Lerncoach

Eine kleine, selbstgehostete Lern-App für die Schulferien. Die Kinder üben jeden
Tag ein paar Minuten **Deutsch, Mathe und Englisch** (5. Klasse Gymnasium).
Die Aufgaben werden von Claude **generiert und bewertet** — inklusive **Vorlesen**
mit Rückmeldung.

Läuft komplett lokal im Docker-Container, genau wie das Personal-Dashboard.
Die KI nutzt die **Claude-Max-Plan-Subscription** über das Claude Agent SDK —
**kein API-Key, keine Pay-per-Token-Kosten.**

Stack: Next.js 16 · TypeScript · Tailwind CSS 4 · better-sqlite3 · Claude Agent SDK.

## Features

- **Mehrere Kinder** — Profil-Auswahl mit Avatar/Farbe, optionaler 4-stelliger PIN.
- **Fächer & Themen**
  - Deutsch: Zeiten, Lückentext, Rechtschreibung, **Vorlesen**
  - Mathe: Bruchrechnen, Maßstab, Textaufgaben
  - Englisch: Vokabeln, Grammatik
- **Zeitmodell**: Minuten pro Kind & Fach + sichtbares Tagesziel gesamt.
- **Adaptive Schwierigkeit**: passt sich an die letzten Ergebnisse an.
- **Belohnung**: Fortschrittsringe, Serien-Zähler (Streak), Konfetti beim Tagesziel.
- **Eltern-Bereich** (PIN-geschützt): Kinder verwalten, Ziele/Themen setzen,
  Fortschritt einsehen und ein **Lern-Coach-Chat**, der Fragen zum Lernstand
  aus der Übungs-Historie beantwortet.

## Schnellstart

```bash
./setup.sh
```

Das Skript prüft Docker, richtet die Claude-Auth ein (führt einmalig durch
`claude login`, falls nötig), baut das Image und startet den Container.

App danach erreichbar auf <http://localhost:3001>.

Alternativ manuell (Auth muss bereits im Volume liegen):

```bash
docker compose up -d --build
```

## Konfiguration

Env-Variablen (in `docker-compose.yml`):

| Variable                       | Default              | Beschreibung                                  |
| ------------------------------ | -------------------- | --------------------------------------------- |
| `LEARN_AGENT_DEFAULT_MODEL`    | `claude-sonnet-4-6`  | Modell für Aufgaben-Generierung & Bewertung   |
| `LEARN_AGENT_REASONING_MODEL`  | `claude-opus-4-8`    | Modell für Textaufgaben & Eltern-Coach        |
| `LEARN_DATA_DIR`               | `/data`              | Verzeichnis der SQLite-DB (im Volume)         |

## Vorlesen / Mikrofon — wichtig

Die Vorlese-Funktion nutzt die **Web Speech API** des Browsers. Die funktioniert
nur in einem **Secure Context**: über `localhost` **oder HTTPS**. Wenn die Kinder
die App über `http://<lan-ip>:3001` öffnen, blockiert der Browser das Mikrofon.

- Am zuverlässigsten in **Chrome/Chromium**.
- Für die Nutzung auf anderen Geräten im Heimnetz empfiehlt sich ein
  **HTTPS-Reverse-Proxy** (z. B. Caddy oder Traefik) vor der App.
- Ist keine Spracherkennung verfügbar, zeigt die App einen Hinweis und die
  Vorlese-Aufgabe kann übersprungen werden — alle anderen Aufgaben funktionieren
  ganz normal.

## Lokale Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
```

Für die KI-Funktionen im Dev-Modus muss Claude Code auf dem Rechner
authentifiziert sein (`claude login`). Die DB liegt lokal unter `./data`.

## Daten

Alles liegt in einer SQLite-Datei im Docker-Volume `lernferien-data`
(`/data/lernferien.db`). Fächer und Themen werden beim ersten Start automatisch
angelegt. Kinder legst du im Eltern-Bereich an.

## Erste Schritte in der App

1. Auf **Eltern** tippen → ein oder mehrere Kinder anlegen (Name, Avatar, Klasse,
   optional PIN). Bei Bedarf einen **Eltern-PIN** setzen.
2. Unter **Ziele & Themen** die täglichen Minuten pro Fach festlegen.
3. Kind wählt sein Profil → Fach antippen → **Loslegen**. Fertig.
