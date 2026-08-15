# TODO — Ferien-Lerncoach

Stand: 2026-08-15. Gepflegt im Repo, damit der Stand versioniert ist und nicht im Chat verloren geht.

> **Umsetzungsstopp.** Es wird nichts implementiert, bis alle laufenden Recherchen abgeschlossen
> und ausgewertet sind. Die Einträge unten sind erfasst und priorisiert, aber bewusst noch offen.
> Grundlage sind die Reports in [`docs/research/`](docs/research/).

## Offene Recherchen

- [ ] **Datenschutz / DSGVO** — Recherche läuft, Report folgt unter
      `docs/research/2026-08-15-datenschutz-dsgvo.md`. Ergebnis kann Punkte in diesem Dokument
      verschieben oder ergänzen, insbesondere alles rund um die Mitnutzung durch fremde Familien.

## Kritisch

- [ ] **Klassenstufe wird bei der Aufgabengenerierung ignoriert**
      `src/lib/ai/prompts.ts:3` und `:5` verdrahten die KI fest auf „5. Klasse Gymnasium".
      `users.grade` existiert pro Kind, ist in der Eltern-UI editierbar und wird angezeigt, fließt
      aber nur in `src/lib/ai/coach.ts:36` ein — nie in die Generierung.
      *Wirkung heute:* Die Zwillinge sind seit dem 12.08.2026 in Klasse 6 und bekommen weiterhin
      Klasse-5-Aufgaben. Mit weiteren Kindern in anderen Jahrgängen wird das zum Blocker.
      *Verifiziert am 2026-08-15 direkt im Code.*
      *Achtung bei der Umsetzung:* `grade` heißt in diesem Code an den meisten Stellen
      **Bewertung** (`gradeExercise`, `gradeSystemPrompt`, `grade_json`), nicht Klassenstufe.
      Die Namenskollision ist die wahrscheinliche Ursache des Fehlers — beim Fix nicht wiederholen.

## Wichtig

- [ ] **Selbstbedienung für Datenexport und -löschung**
      Kein sichtbarer Weg, die Daten einer Familie zu exportieren oder zu löschen. Solange nur die
      eigenen Kinder die App nutzen, verschmerzbar; mit fremden Familien eine Erwartung.
      Genauer Umfang hängt am DSGVO-Report — deshalb noch nicht ausformuliert.

- [ ] **Curriculum-Daten strukturiert verfügbar machen**
      Es gibt **keine** bundesweit maschinenlesbare Lehrplanquelle; Realität sind 16 Länderportale
      mit PDF/HTML in je eigenem Format. Die KMK-Bildungsstandards greifen nur an drei Checkpoints
      (Ende Klasse 4, Ende Sek I, Abitur) — für Klasse 6 gibt es gar keinen KMK-Text.
      Vorgeschlagener Weg: Länder-PDFs einmalig KI-gestützt in ein eigenes Schema überführen,
      Start mit Niedersachsen. Erst entscheiden, ob wir diesen Aufwand überhaupt wollen.

- [ ] **Neues Englisch-Kerncurriculum Niedersachsen prüfen**
      Das schulformübergreifende Kerncurriculum Englisch Sek I wird laut Report zum **1.8.2026**
      verbindlich (Quelle: SVBl 06/2026) — also im laufenden Schuljahr. Deutsch ist noch in
      Überarbeitung. Inhalte gegen das prüfen, was die App heute generiert.
      *Diese Angabe vor einer Umsetzung direkt an der Primärquelle bestätigen.*

## Nice to have

- [ ] **Streak-Reset ohne Gnadenfrist entschärfen**
      `currentStreak()` in `src/lib/db/repo.ts` setzt hart auf 0. Bei zwei Kindern im selben
      Haushalt ist ein gebrochener Streak neben einem gehaltenen ein vorhersehbarer Konflikt.
      Günstig zu verbessern, kein neues Feature nötig.

- [ ] **Vokabeltraining: Eigenbau vs. Anki abwägen**
      Für KI-generierte, frei bewertete Aufgaben gibt es keine brauchbare Open-Source-Alternative
      (Serlo, Kolibri, Moodle geprüft) — der Eigenbau ist gerechtfertigt. Ausnahme sind Vokabeln,
      wo Anki als ausgereiftes Spaced-Repetition-System die bessere Lösung wäre. Offene Frage,
      ob wir das Rad hier nachbauen wollen.

## Bewusste Entscheidungen (keine offenen Aufgaben)

- **Keine Ranglisten oder sichtbaren Leistungsvergleiche zwischen Kindern.** Weder unter
  Geschwistern noch zwischen Kindern verschiedener Familien. Die Evidenz spricht klar dagegen,
  und die Kinder-UI macht es heute schon richtig — sie zeigt nie fremde Daten. Das ist ein
  **Nicht-Ziel**, das bewusst so bleiben soll, damit es nicht später versehentlich eingebaut wird.

- **Der Eigenbau bleibt gerechtfertigt.** bettermarks ist in Niedersachsen über die
  Bildungscloud kostenlos, aber nur Mathe und nur bei Freischaltung durch die Schule. Für Deutsch
  und Englisch existiert keine vergleichbare Landeslizenz.

## Zu klären (keine Code-Aufgaben)

- [ ] **Schulinternen Arbeitsplan besorgen.** Das Kerncurriculum legt in Niedersachsen nur den
      Zielzustand am Ende der Doppeljahrgangsstufe 5/6 fest; die Reihenfolge im Schuljahr bestimmt
      die Fachkonferenz der Schule. Aus dem Kerncurriculum abzuleiten, was nächste Woche drankommt,
      wäre Spekulation. Belastbarer: schulinterner Arbeitsplan (teils online) oder der
      Stoffverteilungsplan des eingeführten Lehrwerks.

- [ ] **Regel für Lehrplanmaterial im Repo festlegen.** Der amtliche Kerncurriculum-Text ist nach
      Sachstand als amtliches Werk (§ 5 UrhG) gemeinfrei und mit Quellenangabe nutzbar. Nicht
      amtliches Zusatzmaterial (Verlags-Stoffverteilungspläne o. Ä.) ist regulär geschützt.
      Das reale Risiko ist nicht die heutige Nutzung, sondern versehentliches Einbetten solchen
      Materials in ein später öffentliches Git-Repo.

## Offene Prüfpunkte an den Recherchen

- [ ] Preis- und Anbieterangaben der Marktanalyse stammen teils aus Sekundärquellen — mehrere
      Anbieterseiten waren über den Recherche-Proxy blockiert. Vor einer Entscheidung, die an
      konkreten Preisen hängt, direkt beim Anbieter verifizieren.
