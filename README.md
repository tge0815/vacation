# Ferien-Lerncoach

Eine kleine, selbstgehostete Lern-App für die Schulferien. Die Kinder üben jeden
Tag ein paar Minuten **Deutsch, Mathe und Englisch** (5. Klasse Gymnasium).
Die Aufgaben werden von Claude **generiert und bewertet** — inklusive **Vorlesen**
mit Rückmeldung.

Läuft im Docker-Container — lokal im Heimnetz oder auf einem öffentlichen Server.
Die KI nutzt die **Anthropic-API** über den offiziellen SDK mit einem
**`ANTHROPIC_API_KEY`** (Pay-per-Token, sehr günstig). Mehrere Familien möglich,
jede mit eigenem Login und eigenen Kindern.

Stack: Next.js 16 · TypeScript · Tailwind CSS 4 · better-sqlite3 · `@anthropic-ai/sdk`.

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

Das Skript prüft Docker, legt `.env` an (fragt einmalig nach dem
`ANTHROPIC_API_KEY`, erzeugt Session-Secret und Einladungscode), baut das Image
und startet den Container.

App danach erreichbar auf <http://localhost:3001>. Beim ersten Öffnen
**Familie registrieren** (Einladungscode aus der setup.sh-Ausgabe bzw. `.env`).

Alternativ manuell (`.env` mit `ANTHROPIC_API_KEY` muss vorhanden sein):

```bash
docker compose up -d --build
```

## Deployment über GitHub Actions + GHCR (Server holt fertige Container)

Statt auf dem Server selbst zu bauen, baut **GitHub Actions** das Image bei jedem
Push auf `main` (und bei Tags `v*`, oder manuell im Actions-Tab) und pusht es in
die **GitHub Container Registry**: `ghcr.io/tge0815/vacation:latest`
(Workflow: `.github/workflows/docker-build.yml`, gebaut für amd64 + arm64).

Auf dem Server dann nur noch **ziehen** — kein Build:

```bash
git pull            # holt compose + deploy.sh (Quellcode wird nicht gebaut)
./deploy.sh         # .env sicherstellen, Image ziehen, starten
```

`deploy.sh` nutzt `docker-compose.prod.yml` (referenziert das GHCR-Image) und
legt bei Bedarf `.env` an (API-Key, Session-Secret, Einladungscode).

**Einmalig: Paket-Sichtbarkeit.** Nach dem ersten erfolgreichen Actions-Lauf
erscheint das Paket unter GitHub → dein Profil → *Packages* → `vacation`.
- **Öffentlich schalten** (einfachster Weg): Package → *Package settings* →
  *Change visibility* → **Public**. Dann zieht der Server ohne Login.
- **Privat lassen**: auf dem Server einmalig einloggen (PAT mit `read:packages`):
  ```bash
  echo <PAT> | docker login ghcr.io -u <github-user> --password-stdin
  ```
  (oder `GHCR_USER`/`GHCR_TOKEN` als Umgebungsvariablen setzen — `deploy.sh`
  loggt sich dann selbst ein.)

Ein bestimmtes Tag statt `latest` fahren: `LEARN_IMAGE=ghcr.io/tge0815/vacation:sha-abc1234`
in `.env` setzen.

## Hinter Apache (Reverse-Proxy, eigene Domain)

Läuft auf dem Server schon ein Apache mit vHosts, wird der Container **nur an
localhost** gebunden und Apache stellt ihn unter der Domain per HTTPS bereit.

1. In `.env` setzen:
   ```
   LEARN_PORT=3001          # freier lokaler Port (Default 3001)
   LEARN_BIND=127.0.0.1     # nur lokal erreichbar (Default) — nur Apache kommt ran
   LEARN_COOKIE_SECURE=1    # da über HTTPS ausgeliefert
   ```
   Dann `./deploy.sh` (bzw. `docker compose -f docker-compose.prod.yml up -d`).
   Der Container hört jetzt auf `127.0.0.1:3001` und ist von außen **nicht**
   direkt erreichbar.

2. Apache-vHost einrichten — fertige Vorlage: **`deploy/apache/lernen.my-corner.de.conf`**.
   Kurz:
   ```bash
   sudo a2enmod proxy proxy_http headers ssl rewrite
   sudo cp deploy/apache/lernen.my-corner.de.conf /etc/apache2/sites-available/
   sudo a2ensite lernen.my-corner.de
   sudo certbot --apache -d lernen.my-corner.de   # HTTPS-Zertifikat
   sudo systemctl reload apache2
   ```
   Die Vorlage leitet HTTP→HTTPS um, reicht `Host` + `X-Forwarded-Proto: https`
   an die App durch und setzt `ProxyTimeout 300` (für den langlebigen
   Coach-Chat/SSE).

Danach: <https://lernen.my-corner.de> — Mikrofon (Vorlesen) funktioniert jetzt
auch, weil HTTPS ein Secure Context ist.

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

Für die KI-Funktionen im Dev-Modus eine `.env.local` mit `ANTHROPIC_API_KEY=sk-ant-…`
anlegen (siehe `.env.example`). Die DB liegt lokal unter `./data`.

## Daten

Alles liegt in einer SQLite-Datei im Docker-Volume `lernferien-data`
(`/data/lernferien.db`). Fächer und Themen werden beim ersten Start automatisch
angelegt. Kinder legst du im Eltern-Bereich an.

## Erste Schritte in der App

1. Auf **Eltern** tippen → ein oder mehrere Kinder anlegen (Name, Avatar, Klasse,
   optional PIN). Bei Bedarf einen **Eltern-PIN** setzen.
2. Unter **Ziele & Themen** die täglichen Minuten pro Fach festlegen.
3. Kind wählt sein Profil → Fach antippen → **Loslegen**. Fertig.
