# Ferien-Lerncoach — Architektur-Notizen

Selbstgehostete Lern-App für die Schulferien (Klasse 5 Gymnasium). Kinder üben
täglich ein paar Minuten Deutsch, Mathe und Englisch. Aufgaben werden von Claude
generiert und bewertet.

## Stack
Next.js 16 (App Router, Server Components, `route.ts`-Handler, SSE) · TypeScript ·
Tailwind CSS 4 · better-sqlite3 · `@anthropic-ai/claude-agent-sdk` · zod.

## KI läuft NUR über Max-Plan
Kein `ANTHROPIC_API_KEY`. Die KI-Aufrufe gehen über das Claude Agent SDK, das die
Claude-Code-Credentials aus `~/.claude` (im Container: Volume `/home/nextjs/.claude`)
nutzt. Setup via `./setup.sh` (kopiert Host-Auth ins Volume). Muster 1:1 vom
Personal-Dashboard übernommen.

## Next.js-Hinweis
Diese Next-Version (16.2.4) kann von Trainingsdaten abweichen. Bei Unklarheiten
vor dem Coden den passenden Guide in `node_modules/next/dist/docs/` lesen.

## Wichtig: Vorlesen / Mikrofon
Die Web Speech API (Spracherkennung) braucht einen Secure Context: `localhost`
oder HTTPS. Über `http://<lan-ip>:3001` blockieren Browser das Mikrofon — für
LAN-Nutzung einen HTTPS-Reverse-Proxy davorstellen. Am zuverlässigsten in Chromium.
