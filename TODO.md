# TODO — Ferien-Lerncoach

Stand: 2026-08-15. Gepflegt im Repo, damit der Stand versioniert ist und nicht im Chat verloren geht.

> **Umsetzungsstopp.** Es wird nichts implementiert, bis alle laufenden Recherchen abgeschlossen
> und ausgewertet sind. Die Einträge unten sind erfasst und priorisiert, aber bewusst noch offen.
> Grundlage sind die Reports in [`docs/research/`](docs/research/).

## Recherchen

Alle drei abgeschlossen, Reports in [`docs/research/`](docs/research/):
Marktanalyse, Lehrplan-Datenquellen, Datenschutz/DSGVO.

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

- [ ] **Nachbarskind: eigene Family oder gemeinsame?**
      `buildContext()` in `src/lib/ai/coach.ts` schickt für den Eltern-Coach **alle Kinder einer
      `familyId`** mit Klarnamen, Klassenstufe, Streak, Trefferquoten und den Fragetexten der
      letzten Aufgaben an Anthropic. Liegt das Nachbarskind in derselben Family, landen dessen
      Klarname und Leistungsdaten im Coach-Chat der eigenen Eltern — und damit beim KI-Anbieter.
      *Verifiziert am 2026-08-15 direkt im Code.*
      Das ist eine Designentscheidung, die vor jeder Umsetzung fallen muss.

- [ ] **Spracherkennung schickt Rohaudio an einen unbeteiligten Dritten**
      `src/components/kid/useSpeech.ts` nutzt `webkitSpeechRecognition` (Web Speech API). In
      Chromium wird das Audio dafür zur Erkennung an Google übertragen — ein vierter Empfänger,
      der in der App nirgends erwähnt wird und mit dem es keine Vereinbarung gibt.
      *Verifiziert am 2026-08-15 direkt im Code.*
      Optionen: Funktion für fremde Kinder abschaltbar machen, offenlegen, oder lokale Erkennung.

## Wichtig

### Datenschutz — unverzichtbar, sobald das Nachbarskind mitnutzt

- [ ] **Schriftliche Einwilligung der Nachbarseltern.** Nach Art. 8 DSGVO ist für ein Kind unter
      16 die Einwilligung der Erziehungsberechtigten nötig, nach Art. 7 Abs. 1 nachweisbar.
      Die bestehende mündliche Absprache erfüllt die Nachweisbarkeit nicht. Ein kurzes Formular
      reicht — es geht um Nachweis, nicht um Formalität.
- [ ] **Kindgerechte Datenschutzinfo** (Art. 12 Abs. 1 verlangt für Kinder verständliche Sprache)
      plus **sichtbarer Hinweis im UI, dass eine KI mitliest und bewertet**.
- [ ] **Selbstbedienung für Datenexport und -löschung.** Bisher gibt es keinen Weg dahin.

### Datenschutz — gute Praxis

- [ ] Pseudonyme statt Klarnamen verwenden, insbesondere in allem, was an die API geht.
- [ ] Löschfristen definieren und umsetzen — `src/lib/db/sqlite.ts` speichert Klarnamen,
      Freitextantworten (`attempts.answer_text`) und bei Vorlese-Aufgaben das volle
      Sprach-Transkript dauerhaft, ohne jeden Verfallmechanismus.
- [ ] Datensparsamkeit gegenüber der API: prüfen, welche Felder wirklich mitgeschickt werden müssen.

*Ausdrücklich **kein** Handlungsbedarf für diesen Fall: EU-Datenresidenz oder ein
Zero-Data-Retention-Vertrag. Laut Report für eine Handvoll Kinder unverhältnismäßig.*

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

## Geschäftsmodell und Kosten — Faktenlage, Entscheidung offen

Recherche: [`docs/research/2026-08-15-geschaeftsmodell-kosten.md`](docs/research/2026-08-15-geschaeftsmodell-kosten.md).
Die Entscheidung über das Geschäftsmodell ist **offen und liegt beim Auftraggeber**. Was unten
steht, sind Rechercheergebnisse, keine getroffenen Festlegungen.

- **Kostenbasis:** Die KI-Kosten liegen im aktuellen Betrieb bei etwa **0,25–0,78 € pro Kind
  und Monat** (geschätzte, nicht gemessene Token-Zahlen), für drei Kinder zusammen unter
  **3 € im Monat**. Das ist die Ausgangsbasis für jede Kalkulation, nicht ihr Ergebnis.

- **Werbung** stößt bei Kindern auf harte rechtliche Grenzen: UWG Anhang Nr. 28 (direkte
  Kaufappelle), JMStV § 6, DSGVO Art. 8. Personalisierte Werbung gegenüber Minderjährigen
  fällt praktisch aus. Das ist eine Rahmenbedingung für jedes Erlösmodell.

- **Kommerzieller Betrieb** zieht nach sich: Gewerbeanmeldung, Impressumspflicht (§ 5 DDG),
  AGB, Widerrufsrecht (ab 19.06.2026 mit Widerrufsbutton nach § 356a BGB),
  Zahlungsdienstleister mit Geschäftskonto. Aufwand, der in die Planung gehört.

- **Tragfähigkeit als Geschäft — recherchiert, Entscheidung offen.** Reports:
  [Markt & Wettbewerb](docs/research/2026-08-15-markt-wettbewerb-business.md),
  [Businessplan & Unit Economics](docs/research/2026-08-15-businessplan-unit-economics.md).
  Kennzahlen: TAM 700–950 Mio. €/Jahr, SAM 250–450 Mio. €, realistisch erreichbares SOM
  150.000–2 Mio. € ARR in 3–5 Jahren. LTV:CAC im einfachen Dauerabo bei ~0,9:1
  (gesund wären 2,5–4:1), Payback 13–16 Monate.

- [ ] **Vor jeder Entscheidung zu klären — zwei Fakten fehlen.**
      (a) Anthropics Nutzungsbedingungen zur Nutzung durch Minderjährige im kommerziellen
      Kontext (anthropic.com war über den Proxy blockiert). Möglicher Blocker.
      (b) Die beiden direkten Wettbewerber **Wunschlern** und **Tutel** — besetzen laut Report
      genau unsere Nische (KI-Generierung zur Laufzeit), waren aber ebenfalls blockiert und
      konnten nicht geprüft werden.

- [ ] **Zwei Hebel, die in der eigenen Hand liegen** (aus den Reports, nicht entschieden):
      *Positionierung* — der saisonale Churn ist durch „Ferien"-App selbst erzeugt; eine
      ganzjährige Ausrichtung würde direkt am LTV ziehen. *Differenzierung* — der
      **Eltern-Coach-Chat** ist die einzige belegte Lücke, die der Marktreport gefunden hat,
      und existiert bereits im Produkt.

- [ ] **Prompt Caching bringt hier nichts — nicht einbauen.** Der größte Systemprompt
      (`exerciseBatchSystemPrompt()`, geschätzt ~1.350 Token) liegt unter der Mindestlänge von
      4.096 Token, ab der Haiku 4.5 überhaupt cached. Steht hier, damit es niemand später als
      vermeintlich offensichtliche Optimierung nachbaut.

- [ ] **Kostentreiber ist die Aufgabenzahl, nicht der Prompt.** Output-Tokens kosten bei Haiku
      das Fünffache der Input-Tokens. Wer sparen will, reduziert die Zahl generierter Aufgaben
      pro Lauf — nicht die Prompt-Länge.

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

- [ ] Anthropics DPA, Standardvertragsklauseln und DPF-Zertifizierung konnten nur über
      Sekundärquellen bestätigt werden — der Proxy blockierte sämtliche anthropic.com-Subdomains.
      Vor einer verbindlichen Einschätzung an der Primärquelle nachlesen.

- [ ] Die rechtliche Bewertung insgesamt ist ein recherchierter Sachstand, kein Rechtsrat.
      Für eine verbindliche Beurteilung: Datenschutz-Fachperson oder die LfD Niedersachsen.
