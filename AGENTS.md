# Ferien-Lerncoach — Architektur-Notizen

Selbstgehostete Lern-App für die Schulferien (Klasse 5 Gymnasium). Kinder üben
täglich ein paar Minuten Deutsch, Mathe und Englisch. Aufgaben werden von Claude
generiert und bewertet.

## Stack
Next.js 16 (App Router, Server Components, `route.ts`-Handler, SSE) · TypeScript ·
Tailwind CSS 4 · better-sqlite3 · `@anthropic-ai/sdk` · zod.

## KI läuft über die Anthropic-API (API-Key)
Die KI-Aufrufe gehen über den offiziellen `@anthropic-ai/sdk` mit `ANTHROPIC_API_KEY`
(aus `.env` / docker-compose). Pay-per-Token. Zentral in `src/lib/ai/agent.ts`
(`streamAgent`) — der Rest der KI-Schicht (`run.ts`, `coach.ts`) baut darauf auf.
Modelle: Standard `LEARN_AGENT_DEFAULT_MODEL` (Haiku, Generieren/Bewerten/Vorlesen),
Reasoning `LEARN_AGENT_REASONING_MODEL` (Sonnet, Textaufgaben & Eltern-Coach).

## Next.js-Hinweis
Diese Next-Version (16.2.4) kann von Trainingsdaten abweichen. Bei Unklarheiten
vor dem Coden den passenden Guide in `node_modules/next/dist/docs/` lesen.

## Wichtig: Vorlesen / Mikrofon
Die Web Speech API (Spracherkennung) braucht einen Secure Context: `localhost`
oder HTTPS. Über `http://<lan-ip>:3001` blockieren Browser das Mikrofon — für
LAN-Nutzung einen HTTPS-Reverse-Proxy davorstellen. Am zuverlässigsten in Chromium.
