# Geschäftsmodell & KI-Kosten "Ferien-Lerncoach"

Stand: 2026-08-15. Kein Rechts- oder Steuerrat — siehe Grenzen am Ende. Baut auf
`docs/research/2026-08-15-datenschutz-dsgvo.md` (DSGVO-Lage) und
`docs/research/2026-08-15-marktanalyse-lernapps.md` (Wettbewerbsvergleich) auf, ohne beide zu wiederholen.

## Empfehlung (Kurzfassung)

Die Monetarisierungsfrage stellt sich bei drei Kindern **faktisch nicht** — die reinen KI-Kosten liegen
je nach Nutzungsintensität bei **rund 20 Cent bis 1 Euro pro Kind und Monat**, für alle drei Kinder
zusammen realistisch **unter 3 Euro im Monat**. Das ist zu wenig, um ein Abo, ein Werbemodell oder gar
eine Gewerbeanmeldung zu rechtfertigen — der bürokratische Aufwand (Impressum, USt-Fragen,
Widerrufsrecht, Zahlungsdienstleister) würde den Nutzen um Größenordnungen übersteigen. Werbung
scheidet zusätzlich aus rechtlichen Gründen aus (direkte Kaufappelle an Kinder sind verboten, und die
verbleibende Werbeform — rein kontextuelle, nicht-personalisierte Anzeigen — wirft bei drei Nutzerkindern
keinen messbaren Betrag ab). Die naheliegende Lösung: **die Kosten wie bisher selbst tragen, ggf. eine
symbolische, unverbindliche Kostenbeteiligung der Nachbarfamilie anbieten** (kein Vertrag, keine
Rechnung) — das bleibt sauber innerhalb der "Nachbarschaftshilfe"-Grenze und braucht keine der in Teil 3
beschriebenen Formalitäten. Wichtigster Einzelbefund aus der Codeprüfung: Die Bewertung getippter
Antworten läuft **lokal und kostenlos** (kein KI-Aufruf), nicht — wie im Auftrag angenommen — pro
Aufgabe per KI-Call. Das drückt die reale Kostenbasis deutlich unter das, was man beim Lesen der
Architektur vermuten würde.

## Annahmen

- 1 USD ≈ 0,864 EUR (EUR/USD ≈ 1,157, Stand 14.08.2026, Marktdaten über Suchindex, Direktfetch von
  tradingeconomics.com/investing.com vom Proxy blockiert — siehe Quellen).
- Token-Zahlen sind **Schätzungen** auf Basis von Zeichenzahlen der tatsächlichen Prompt-Strings im Repo
  (Faustregel Deutsch/JSON: ~3,5–4 Zeichen/Token), keine gemessenen Werte. Sie sind gut genug für eine
  Größenordnungsaussage, nicht für eine Abrechnung auf den Cent.
- "Ferienmonat" wird als 30-Tage-Monat gerechnet, auch wenn reale Ferien in Niedersachsen kürzer sind
  (das macht die Zahl eher zu hoch als zu niedrig, ist also die vorsichtige Richtung).

---

## Teil 1 — Token-Kosten pro Kind und Monat

### 1.1 Wie viele API-Aufrufe fallen tatsächlich an? (wichtigster Befund zuerst)

Ich habe `src/lib/ai/exercises.ts`, `localGrade.ts`, `pool.ts`, `coach.ts`, `vocabPhoto.ts`, `run.ts`,
`agent.ts` sowie die aufrufenden Routen unter `src/app/api/exercise/*` und `src/app/api/coach/chat`
gelesen. Ergebnis, Pfad für Pfad:

| Pfad | Löst KI-Call aus? | Modell | Häufigkeit |
|---|---|---|---|
| **Aufgaben generieren** (`generateBatch`, `/api/exercise/generate`) | **Ja** | Haiku 4.5 | 1 Aufruf pro Batch von bis zu 8 (Frontend: `BATCH = 5`) Aufgaben — nicht pro Einzelaufgabe. Vokabel-Wiederholungen (`vokabeln`-Thema, jede 2. Karte) kommen aus der lokalen Vokabel-DB, ohne KI-Call. |
| **Bewerten getippter Antworten** (`gradeExercise`, `/api/exercise/grade`) | **Faktisch nein** | — | `tryLocalGrade()` (`src/lib/ai/localGrade.ts`) prüft `answer` lokal gegen `solution`/`acceptable` für **alle** Modi außer `"reading"` und gibt **immer** ein Ergebnis zurück (korrekt oder falsch) — nie `null`. Der Fallback `?? (await gradeExercise(...))` in der Route greift dadurch nur für `inputMode === "reading"`. Reading-Antworten laufen aber über einen **eigenen** Endpunkt (`/api/exercise/reading`), der `gradeExercise` gar nicht aufruft. Damit ist `gradeExercise()` im aktuellen Code **praktisch unerreichbarer Pfad** — inklusive des teureren `REASONING_MODEL`-Zweigs für Textaufgaben/Maßstab, der dadurch de facto nie greift. |
| **Vorlesen bewerten** (`evaluateReading`, `/api/exercise/reading`) | **Ja** | Haiku 4.5 | 1 Aufruf pro vorgelesener Aufgabe (nur Themen mit `input_hint === "reading"`, forciert per `forceReading`). |
| **Vokabelfoto** (`extractVocabFromImage`, `/api/vocab/photo`) | Ja | Haiku 4.5 (+ Bild-Tokens) | Selten, nur wenn Eltern ein neues Vokabelheft-Foto hochladen — kein täglicher Vorgang. |
| **Eltern-Coach-Chat** (`streamParentCoach`, `/api/coach/chat`) | Ja | Haiku 4.5 (Standard) oder Sonnet 4.6 (`useReasoning`-Toggle, default aus) | Auf Wunsch der Eltern, nicht an eine Übungseinheit gekoppelt. |

**Das ist die wichtigste Korrektur gegenüber der Annahme im Auftrag:** "Bewerten pro Aufgabe" kostet in
der jetzigen Implementierung **keine** KI-Tokens, weil die KI beim Generieren bereits `solution` +
`acceptable` mitliefert und die Antwort danach exakt/normalisiert lokal verglichen wird (Kommentar im
Code: *"kein langsamer KI-Aufruf"*). Das ist eine bewusste Kostenoptimierung, keine vergessene
Anbindung — aber sie bedeutet auch: Tippfehler-Toleranz und Kontext-Verständnis, wie sie
`gradeSystemPrompt()` beschreibt ("kleine Tippfehler... zählen als richtig"), werden aktuell **nicht**
angewendet, weil dieser Pfad nie läuft. Das ist ein Funktions-, kein Kostenproblem — aber erwähnenswert,
falls beim Testen mal ein eigentlich richtiges, nur leicht abweichend geschriebenes Ergebnis als falsch
gewertet wird.

### 1.2 Prompt-Größen (geschätzt aus den tatsächlichen Zeichenzahlen im Repo)

Gemessen mit `wc -c` auf die realen Prompt-Strings in `prompts.ts`/`vocabPhoto.ts`, umgerechnet mit
~4 Zeichen/Token (Schätzung, siehe Annahmen):

| System-Prompt | Zeichen | ≈ Token | Modell |
|---|---|---|---|
| `exerciseBatchSystemPrompt()` (Aufgaben-Batch) | ~5.400 | **~1.350** | Haiku |
| `gradeSystemPrompt()` | ~1.240 | ~310 | (praktisch unerreicht, s.o.) |
| `readingSystemPrompt()` | ~1.320 | ~330 | Haiku |
| `PARENT_COACH_PROMPT` (fixer Teil) | ~540 | ~135 | Haiku/Sonnet |
| Coach-Kontext (`buildContext()`, dynamisch, 3 Kinder × 14 Tage) | ~1.500–3.000 | ~400–750 | — |
| `vocabPhoto` SYSTEM + PROMPT | ~780 | ~195 | Haiku |

Output-Annahmen (nicht gemessen, plausibel geschätzt aus dem JSON-Format der Schemas): ~150–250 Token
pro generierter Aufgabe (JSON mit `instruction`/`question`/`solution`/`acceptable`/`solutionExplanation`
etc.), ~100–180 Token pro Lese-Bewertung, ~250–600 Token pro Coach-Antwort. `max_tokens` liegt bei 8192
(`agent.ts:50`) bzw. 4096 (`vocabPhoto.ts:50`) — das sind harte Obergrenzen, keine typischen Werte; die
tatsächliche Nutzung liegt weit darunter.

### 1.3 Kosten pro Aufruf (Haiku 4.5: 1,00 $ / 5,00 $ je 1M Token Input/Output)

| Aufruf | Input (≈ Token) | Output (≈ Token) | Kosten (USD) | Kosten (EUR) |
|---|---|---|---|---|
| Aufgaben-Generierung, **pro Aufgabe** (Systemprompt über Batch von 5 amortisiert) | ~330 | ~190 | **~$0,0013** | ~€0,0011 |
| Vorlese-Bewertung, **pro Versuch** | ~1.550 | ~150 | **~$0,0023** | ~€0,0020 |
| Eltern-Coach, **pro Nachricht** (Haiku, Standard) | ~1.100 | ~400 | **~$0,0031** | ~€0,0027 |
| Eltern-Coach, **pro Nachricht** (Sonnet, `useReasoning`) | ~1.100 | ~400 | ~$0,0093 (3× teurer) | ~€0,0080 |
| Vokabelfoto, **pro Foto** (inkl. ~1.600 Bild-Token, Anthropic-Formel ≈ Breite×Höhe/750 — aus Erinnerung, nicht über anthropic.com verifizierbar) | ~1.800 | ~250 | ~$0,003 | ~€0,0026 |

Spannen (je nach Annahme über Prompt-/Output-Länge): Aufgaben-Generierung $0,0008–$0,0017/Aufgabe,
Vorlese-Bewertung $0,0018–$0,003/Versuch.

### 1.4 Drei Szenarien, Euro pro Kind und Monat

Angenommene Aufgabenzahl: ~1 Aufgabe/1,3 Minuten (typisch für Klasse 6, inkl. Lesen+Tippen+Feedback).

| Szenario | Aufgaben/Tag | Vorlese-Aufgaben/Tag (Schätzung) | Aufgaben/Monat | Kosten Generierung | Kosten Vorlesen | **Summe/Kind/Monat** |
|---|---|---|---|---|---|---|
| **10 Min/Tag, 1 Fach** | ~7 | ~0,2 | 210 | $0,27 | $0,01 | **≈ $0,29 ≈ €0,25** |
| **20 Min/Tag, 2 Fächer** | ~14 | ~0,5 | 420 | $0,55 | $0,03 | **≈ $0,58 ≈ €0,50** |
| **Realistische Ferienlast** (3 Fächer × ~10 Min, Deutsch fast täglich mit Vorlesen, 1 Vokabelfoto/Monat) | ~21 | ~1,0 | 630 | $0,82 | $0,07 | **≈ $0,90 + $0,003 (Foto) ≈ $0,90 ≈ €0,78** |

Eltern-Coach ist nicht an ein Kind gekoppelt (der Kontext umfasst alle Kinder der Familie in einem
Aufruf) und wird deshalb **nicht pro Kind**, sondern **pro Familie** gerechnet: bei z. B. 8 Nachrichten
im Monat (Standard-Modell) ≈ $0,025/Monat für die ganze Familie — vernachlässigbar gegenüber den
Aufgaben-Kosten.

**Für alle drei Kinder zusammen, realistische Ferienlast:** 3 × ~$0,90 + Coach ≈ **$2,74 ≈ €2,37 im
Monat** — für die gesamte Nutzung aller drei Kinder, nicht pro Kind.

Unsicherheitsspanne: Die Aufgabenzahl pro Tag hat mehr Einfluss auf das Ergebnis als die
Token-Schätzung selbst. Realistisch ist die Spanne **€0,15–€1,20 pro Kind und Monat**, je nach
tatsächlicher täglicher Nutzung — auch am oberen Ende bleibt der Betrag im Cent- bis
Ein-Euro-Bereich.

### 1.5 Prompt Caching — geprüft, Ergebnis: bringt hier nichts

Im Repo wird `cache_control` **nirgends** gesetzt (`grep -ri cache src/` findet nur einen HTTP-Header
`Cache-Control: no-cache` für den SSE-Stream im Coach-Chat, keine Anthropic-Prompt-Caching-Nutzung).
`streamAgent()` (`agent.ts:47-55`) baut den Request ohne `cache_control`-Blöcke.

Die entscheidende Prüfung, wie im Auftrag verlangt: **Ist der Systemprompt lang genug für Caching?**

- Größter Systemprompt der App: `exerciseBatchSystemPrompt()` mit ~1.350 Token — läuft auf **Haiku**
  (`DEFAULT_MODEL`). Haikus Mindestlänge für Prompt-Caching liegt bei **4.096 Token**. **1.350 < 4.096
  → Caching würde bei diesem Aufruf technisch gar nicht erst aktiviert, selbst wenn `cache_control`
  gesetzt wäre.** Das gilt erst recht für die kleineren Systemprompts (`readingSystemPrompt` ~330 Token,
  `PARENT_COACH_PROMPT` ~135 Token, `vocabPhoto` SYSTEM ~130 Token).
- Einzige Stelle, an der ein Systemprompt die 1.024-Token-Schwelle für **Sonnet** überschreitet, wäre
  wieder `exerciseBatchSystemPrompt()` (~1.350 Token) — aber die Aufgaben-Generierung läuft auf Haiku,
  nicht auf Sonnet. Ein Wechsel zu Sonnet nur um Caching zu ermöglichen wäre kontraproduktiv: die
  Basispreise von Sonnet (3 $ / 15 $ je 1M) liegen 3× bzw. 3× über Haiku, ein Cache-Read (~10 % des
  Input-Preises) müsste diesen Aufschlag erst wieder wettmachen — bei ohnehin schon Cent-Beträgen lohnt
  sich das nicht.
- Der Eltern-Coach-Systemprompt ist zusätzlich **pro Aufruf unterschiedlich** (der dynamische
  `buildContext()`-Teil ändert sich mit jedem neuen Übungsdatensatz), ist also selbst bei ausreichender
  Länge kein stabiles Cache-Präfix — nur der fixe `PARENT_COACH_PROMPT`-Teil (~135 Token) wäre
  cachebar, und der liegt weit unter beiden Schwellen.

**Ergebnis: Prompt Caching würde bei diesem Setup (Haiku für praktisch alles, Systemprompts durchweg
unter 1.500 Token) keine messbare Ersparnis bringen.** Das ist kein Implementierungsfehler, sondern
liegt daran, dass die Prompts schlicht zu kurz für die Haiku-Schwelle sind. Es wäre falsch, das jetzt
künstlich zu ändern (z. B. Prompt aufblähen, um die Schwelle zu erreichen) — der Erwartungswert der
Ersparnis liegt bei einem Bruchteil eines Cents pro Monat und steht in keinem Verhältnis zum
Implementierungsaufwand.

### 1.6 Größter Kostentreiber

Der größte Kostentreiber ist — trotz Batch-Generierung — nicht die absolute Zahl der Systemprompt-Token,
sondern die **Zahl der Aufgaben** in Kombination mit dem **5× höheren Output-Preis** (5 $ vs. 1 $ je 1M
Token bei Haiku): Pro Aufgabe kostet der amortisierte Systemprompt-Anteil (~330 Input-Token) rund
$0,00033, der JSON-Output (~190 Token) aber rund $0,00095 — die Ausgabe ist trotz weniger Token gut
2,5-mal so teuer wie die Eingabe. Am wirksamsten ließe sich das senken durch:

1. **Kürzere Aufgaben-JSON-Ausgabe** (z. B. `solutionExplanation` nur bei falscher Antwort generieren
   lassen statt immer, kürzere Formulierungen einfordern) — spart am direktesten, weil Output der
   teurere Hebel ist.
2. **Batch-Größe voll ausschöpfen** (aktuell Frontend `BATCH = 5`, Backend erlaubt bis 8) — amortisiert
   den ohnehin kleinen Systemprompt-Anteil weiter, bringt aber nur einen kleinen zusätzlichen Effekt,
   weil der Output ohnehin linear mit der Aufgabenzahl wächst.
3. **Nicht** Prompt Caching (bringt nichts, siehe 1.5) und **nicht** Modellwechsel (Haiku ist für diese
   Aufgabenklasse bereits das günstigste sinnvolle Modell).

Wichtiger Kontext: Bei absoluten Beträgen von Cent-Bruchteilen pro Aufgabe lohnt sich Engineering-Aufwand
zur weiteren Senkung bei drei Kindern **nicht** — selbst eine Halbierung der Kosten spart absolut unter
einem Euro im Monat.

### 1.7 Wie man es exakt messen würde

`agent.ts` erfasst die realen Token-Zahlen bereits (`final.usage.input_tokens`/`output_tokens`, Zeile
75–76, im `"done"`-Chunk), sie werden aber **nirgends geloggt oder gespeichert** — `run.ts` loggt nur
das verwendete Modell, nicht die Token-Zahlen. Der pragmatischste nächste Schritt für belastbare
eigene Zahlen: diese Werte zusätzlich in `console.log` oder eine kleine SQLite-Tabelle schreiben
(Datum, Pfad-Label, `tokensIn`, `tokensOut`, Modell) — nach einer echten Ferienwoche hätte man exakte
Ist-Zahlen statt der obigen Schätzung, ganz ohne externe Abhängigkeit.

---

## Teil 2 — Werbung: rechtlicher Rahmen bei Kindern

**Kurzfassung: Werbung ist hier praktisch kein gangbarer Weg** — weder aus rechtlichen noch aus
wirtschaftlichen Gründen.

### 2.1 UWG — direkte Kaufappelle an Kinder

Nr. 28 des Anhangs zu § 3 Abs. 3 UWG (die "Schwarze Liste" unlauterer Geschäftspraktiken, bei denen
keine Einzelfallprüfung mehr nötig ist) verbietet wörtlich: *"die in eine Werbung einbezogene
unmittelbare Aufforderung an Kinder, selbst die beworbene Ware zu erwerben oder die beworbene
Dienstleistung in Anspruch zu nehmen oder ihre Eltern oder andere Erwachsene dazu zu veranlassen"*
([omsels.info, Schwarze Liste Nr. 28](https://www.omsels.info/die-verbote-oder-was-darf-ich-nicht/schwarze-liste/6-schwarze-liste-nr-28)).
Nach BGH-Rechtsprechung (u. a. I ZR 96/13) muss sich der Kaufappell auf ein **konkretes Produkt**
richten — ein allgemeiner Werbeauftritt reicht nicht, wohl aber z. B. ein "Frag deine Eltern, ob sie dir
XY kaufen" innerhalb der App
([rechtsportal.de zu BGH I ZR 96/13](https://www.rechtsportal.de/Rechtsprechung/Rechtsprechung/2014/BGH/Richten-des-Kaufappells-auf-ein-konkretes-Produkt-oder-mehrere-konkrete-Produkte-als-Voraussetzung-fuer-eine-unmittelbare-Aufforderung-zum-Kauf-gem.-Nr.-28-Anh.-zu-3-Abs.-3-UWG-Verstoss-einer-i.R.-einer-Zeugnisaktion-an-Schulkinder-gerichteten-Werbung-eines-Elektronik-Fachmarktes-mit-einem-Preisnachlass-fuer-jede-Eins-im-Zeugnis-gegen-4-Nr.-1-2-UWG)).
Das betrifft nicht nur physische Werbung, sondern jedes Medium, das sich an Kinder richtet — eine
Kinder-Lern-App fällt direkt in den Anwendungsbereich, sobald sie überhaupt Werbeflächen zeigt, die auf
einen Kauf abzielen (auch In-App-Käufe/Abo-Upselling **an das Kind selbst** wären hier riskant, nicht
nur klassische Produktwerbung).

### 2.2 JMStV — Trennungsgebot

§ 6 JMStV verlangt, dass Werbung, die Kinder/Jugendliche in ihrer Entwicklung beeinträchtigen könnte,
**getrennt** von kindgerichteten Angeboten erfolgen muss, verbietet direkte Kaufaufrufe an Kinder
(deckungsgleich mit UWG Nr. 28) und verbietet, dass Kinder aufgefordert werden, Eltern/Dritte zum Kauf
zu bewegen ([lxgesetze.de § 6 JMStV](https://lxgesetze.de/jmstv/6),
[JMStV-Volltext, die-medienanstalten.de](https://www.die-medienanstalten.de/fileadmin/user_upload/Rechtsgrundlagen/Gesetze_Staatsvertraege/JMStV/Jugendmedienschutzstaatsvertrag_JMStV.pdf)).
Praktisch heißt das: Selbst kontextuelle, nicht-personalisierte Werbung müsste in einer kindgerichteten
App **klar erkennbar von den Lerninhalten abgesetzt** sein (kein Werbebanner mitten im Aufgabenfluss).

### 2.3 Targeting mit Kinderdaten — DSA Art. 28 und DSGVO

Art. 28 Abs. 2 DSA verbietet Anbietern von Online-Plattformen, Nutzern **personalisierte Werbung auf
Basis von Profiling mit personenbezogenen Daten** zu zeigen, wenn hinreichende Gewissheit besteht, dass
der Nutzer minderjährig ist
([gesetz-digitale-dienste.de Art. 28 DSA](https://gesetz-digitale-dienste.de/dsa/artikel-28/)).
**Wichtige Einschränkung für unseren Fall:** Art. 28 steht im Abschnitt "Zusätzliche Bestimmungen für
Anbieter von Online-Plattformen", der nach Art. 29 DSA für **Kleinst- und Kleinunternehmen** (< 50
Beschäftigte, < 10 Mio. € Jahresumsatz) **nicht gilt**, solange keine sehr große Plattform (VLOP)
vorliegt ([lexmea.de Art. 29 DSA](https://lexmea.de/de/gesetz/dsa/art-29)). Ein selbstgehosteter
Familien-Lerncoach dürfte ohnehin schon keine "Online-Plattform" im Sinne des DSA sein (kein
öffentliches, kommerzielles Vermittlungsdienst-Angebot) — Art. 28 DSA bindet diese App also mit hoher
Wahrscheinlichkeit **gar nicht direkt**. Das ändert aber nichts an der DSGVO-Lage: Profiling zu
Werbezwecken bräuchte nach Art. 8 DSGVO ohnehin die **elterliche Einwilligung** (siehe DSGVO-Report),
und personalisierte Werbung gegenüber einem erkennbar kindgerichteten Angebot gilt branchenweit als
Praxis, die man vermeidet, nicht weil ein einzelnes Gesetz sie für jede App verbietet, sondern weil
UWG + JMStV + DSGVO in der Summe kaum einen rechtssicheren Weg dorthin lassen.

**Praktische Konsequenz:** Was übrig bleibt, ist **rein kontextuelle Werbung ohne Profiling** (wie z. B.
klassische Zeitschriftenwerbung — Anzeige passend zum Umfeld, nicht zur Person). Bei drei Nutzerkindern
mit zusammen vielleicht 50–70 Bildschirm-Interaktionen am Tag ist das Werbevolumen so klein, dass selbst
bei großzügigen TKP-Annahmen (kontextuelle Werbenetzwerke zahlen üblicherweise 1–3 € pro 1.000
Impressionen) ein **Bruchteil eines Cents pro Monat** zusammenkäme — nicht der Rede wert, aber auch
nicht seriös in ein Ad-Netzwerk integrierbar, weil die meisten Anbieter Mindestreichweiten oder eigene
Kinderschutz-Policies haben, die ein Drei-Kinder-Projekt gar nicht erst zulassen.

### 2.4 Wer im Markt Werbung schaltet — und wer bewusst nicht

- **Anton**: laut übereinstimmenden Quellen **kostenlos und werbefrei**, finanziert über die
  solocode GmbH plus EFRE-Regionalförderung, mit optionalem Bezahl-Upgrade "Anton Plus" (siehe
  Marktanalyse-Report für Preise) — **kein** Werbemodell
  ([technik-fuer-kids.de](https://technik-fuer-kids.de/produkte/anton-lern-app-grundschule-deutsch-mathe-lernen/),
  [lernmarktplatz.de](https://lernmarktplatz.de/products/anton-die-kostenlose-schul-app)).
- **Khan Academy Kids**: 501(c)(3)-Non-Profit, **komplett werbefrei**, finanziert über Spenden/Stiftungen
  (Bezos-, Gates-Umfeld), explizit "no ads, no paywalls"
  ([khanacademy.org/kids](https://www.khanacademy.org/kids)).
- **Duolingo**: zeigt in der **kostenlosen Version Werbung** (Erwachsenen-/Teenager-Zielgruppe, nicht
  primär Kinder), werbefrei nur im bezahlten "Super"-Abo — hier ist die Zielgruppenabgrenzung wichtig:
  Duolingo positioniert sich nicht als reine Kinder-App.
- **schlaukopf.de**: einer der wenigen **werbefinanzierten** Anbieter im deutschen Schul-Kontext, mit
  kostenpflichtigem werbefreien Upgrade (3,99 €/Monat) — zeigt, dass es geht, aber auch, dass es die
  Ausnahme ist, nicht der Standard bei ernstzunehmenden Bildungsanbietern (siehe Marktanalyse-Report).
- **sofatutor, simpleclub, Learnattack, bettermarks**: alle reine **Abo-/Lizenzmodelle ohne Werbung**.

**Einordnung:** Die etablierten, auf Vertrauen bei Eltern angewiesenen Anbieter meiden Werbung fast
durchgängig — entweder über Non-Profit-/Förder-Finanzierung (Anton, Khan Academy) oder über Abos. Das
ist ein starkes Marktsignal, das zur rechtlichen Einschätzung passt: Werbung in einer Kinder-Lern-App
ist rechtlich eng und wirtschaftlich bei dieser Nutzerzahl witzlos.

---

## Teil 3 — Abo: Markt und Deckungsbeitrag

### 3.1 Preispunkte (aufbauend auf `2026-08-15-marktanalyse-lernapps.md`, dort mit Quellen)

| Anbieter | Preis (privat) | Familienoption |
|---|---|---|
| Anton Plus | 9,99 €/Jahr Einzel | 19,99 €/Jahr Familie |
| sofatutor | 11,99–39,99 €/Monat je nach Laufzeit | ~29,99 €/Monat für 2 Kinder |
| simpleclub | 16,49 €/Monat bzw. 89,99 €/Jahr (~7,50 €/Monat) | keine bestätigte Familienoption |
| bettermarks | ~10,70 €/Schüler/Schuljahr | nur Schullizenz, **keine** Einzellizenz für Eltern |
| schlaukopf Premium | 3,99 €/Monat bzw. 23,99 €/Jahr | keine |
| Duolingo Super | 7,49 €/Monat Einzel | 10,25 €/Monat Familie (bis 6 Accounts) |

Diese Zahlen stammen größtenteils aus Sekundärquellen (die Primärseiten waren über den Proxy blockiert)
— siehe die ausführliche Quellenkritik im Marktanalyse-Report, insbesondere zu Learnattack (widersprüchliche
Angaben) und Anton (App-Store-Metadaten statt Herstellerseite direkt, da `anton.app` auch in dieser
Recherche erneut blockiert war).

**Bandbreite am Markt:** von ~1 €/Monat (Anton Plus Familie, umgerechnet) bis ~40 €/Monat
(sofatutor Premium monatlich kündbar) — die Spanne ist riesig und sagt für sich wenig, weil sie stark
vom Funktionsumfang (Video-Kurse vs. reine Übungs-App) abhängt.

### 3.2 Deckungsbeitrag — trägt ein Abo die KI-Kosten?

Selbst am **untersten** Ende des Marktes (Anton Plus Familie, 19,99 €/Jahr ≈ 1,67 €/Monat **für die
ganze Familie**, nicht pro Kind) steht dem aus Teil 1 ermittelten realistischen KI-Kostenrahmen von
**€2,37/Monat für alle drei Kinder zusammen** eine Deckungslücke von **unter einem Euro** gegenüber —
und das nur, wenn man den günstigsten Marktpreis ansetzt. Bei jedem anderen der geprüften Anbieter
(ab ~4 €/Monat) wäre die KI-Kostendeckung um ein Vielfaches gegeben. **Die eigentliche Kostenfrage ist
also nicht, ob ein Abo die Token-Kosten trägt — das würde praktisch jeder realistische Preispunkt
locker tun.** Die Frage ist, ob sich der bürokratische Aufwand lohnt, um überhaupt Geld zu nehmen (siehe
3.3) — und ob man das bei einem geschlossenen Kreis von drei bekannten Kindern überhaupt will.

### 3.3 Was am Geldnehmen hängt

- **Gewerbeanmeldung**: Pflicht bei einer **selbstständigen, auf Dauer angelegten Tätigkeit mit
  Gewinnerzielungsabsicht**, die am allgemeinen wirtschaftlichen Verkehr teilnimmt. Reine
  **Nachbarschaftshilfe mit Auslagenerstattung** (kein Gewinn, keine Marktöffnung für Fremde) ist nach
  einhelliger Quellenlage **kein anzeigepflichtiges Gewerbe**
  ([gesetz-ratgeber.de](https://gesetz-ratgeber.de/rechtsgebiete/verwaltungsrecht/gewerbeanmeldung-pflichten),
  [Pflegenetz Sachsen, Infoblatt Steuer/Gewerbe](https://www.pflegenetz.sachsen.de/download/BF-Infoblatt_Steuer_Gewerbe_Versicherung_NBH_15.12.2025.pdf)).
  Sobald aber eine feste monatliche/jährliche Zahlung mit Gegenleistungscharakter (Abo) vereinbart wird
  und/oder das Angebot über den bekannten Kreis hinaus geöffnet wird, kippt die Einordnung — dann ist
  eine Gewerbeanmeldung wahrscheinlich, unabhängig von der Höhe des Betrags.
- **Kleinunternehmerregelung (§ 19 UStG)**: Befreiung von der Umsatzsteuer, solange der Vorjahresumsatz
  ≤ 25.000 € und der laufende Jahresumsatz voraussichtlich ≤ 100.000 € bleibt (Schwellen seit der
  Reform 2025 angehoben) — bei diesem Projekt um Größenordnungen unproblematisch, falls es je zu einer
  Gewerbeanmeldung käme
  ([taxtify.de](https://taxtify.de/steuer-lexikon/kleinunternehmerregelung/),
  [Handelskammer Hamburg](https://www.handelskammer-hamburg.de/recht-steuern/steuerrecht/umsatzsteuer-mehrwertsteuer/umsatzsteuer-mehrwertsteuer-national/kleinunternehmerregelung-6680502)).
- **Impressumspflicht**: gilt für **jede geschäftsmäßig** genutzte Website/App unabhängig von der
  Kleinunternehmerregelung, seit der TMG-Ablösung nach **§ 5 DDG** (Digitale-Dienste-Gesetz) — bei
  einem rein privaten, unentgeltlichen Familienprojekt entfällt sie, bei einem Abo-Modell nicht
  ([selbststaendigkeit.de](https://selbststaendigkeit.de/buchhaltung-fuer-gruender/impressum-kleinunternehmer/)).
- **Widerrufsrecht bei digitalen Inhalten**: Verbrauchern steht grundsätzlich ein 14-tägiges
  Widerrufsrecht zu; es kann bei digitalen Inhalten/Leistungen vorzeitig erlöschen, wenn der Kunde
  ausdrücklich zustimmt, dass mit der Ausführung vor Fristablauf begonnen wird, und dabei sein
  Widerrufsrecht verliert (§ 356 Abs. 5 BGB) — das ist bei einem laufenden Abo-Dienst Standardpraxis.
  **Neu und relevant für den Zeitpunkt**: Ab **19. Juni 2026** verlangt der neue § 356a BGB für
  B2C-Fernabsatzverträge über Websites/Apps eine **elektronische Widerrufs-Schaltfläche**, kein reiner
  Text mehr genügt
  ([datenschutz-generator.de Widerrufsbutton 2026](https://datenschutz-generator.de/widerrufsbutton/),
  [e-recht24.de Widerrufsrecht digitale Inhalte](https://www.e-recht24.de/ecommerce/13530-widerrufsrecht-fuer-digitale-inhalte.html)).
- **Zahlungsdienstleister**: Stripe/PayPal sind auch für Kleinunternehmer nutzbar, verlangen aber bei
  Geschäftskonten üblicherweise **Firmenname/Rechtsform gemäß Gewerbeanmeldung** und eine
  Geschäftsadresse (Geldwäsche-/PSD2-Vorgaben) — ein privates PayPal-Konto reicht für regelmäßige,
  vertraglich zugesicherte Abo-Zahlungen typischerweise nicht sauber aus
  ([sbs-legal.de](https://www.sbs-legal.de/lexikon/paypal-konto-eroeffnet-fuer-unternehmerinnen),
  [accountable.de Stripe als Kleinunternehmer](https://www.accountable.de/blog/stripe-als-kleinunternehmer-nutzen/)).
- **AGB**: bei einem entgeltlichen, wiederkehrenden Vertrag mit Verbrauchern (auch wenn "nur" die
  Nachbarfamilie) inzwischen faktisch erwartet, um Leistungsumfang, Laufzeit, Kündigung zu regeln —
  kein gesetzliches Muss in jedem Fall, aber ohne AGB im Streitfall unklar, was vereinbart war.

**Kernaussage:** Sobald aus "die Nachbarn geben ab und zu was dazu" ein **vertraglich zugesichertes,
wiederkehrendes Abo mit Kündigungsrecht/Widerruf** wird, zieht das die komplette Kette (Gewerbe →
Impressum → Widerrufsbutton → Zahlungsdienstleister-Geschäftskonto) nach sich — unabhängig davon, dass
der Betrag (wenige Euro/Monat) trivial wäre. Der Verwaltungsaufwand ist bei drei Kindern nicht durch den
Betrag zu rechtfertigen.

---

## Teil 4 — Alternativen, ehrlich abgewogen

| Option | Bewertung |
|---|---|
| **Vater trägt die Kosten weiter selbst** | Bei ~€2,37/Monat für alle drei Kinder zusammen (realistische Ferienlast) ist das schlicht die einfachste, günstigste und rechtlich unkomplizierteste Option. Kein Formalismus nötig. |
| **Informelle Kostenbeteiligung der Nachbarfamilie** (z. B. gelegentlich, ohne feste Zusage/Vertrag) | Bleibt innerhalb der Nachbarschaftshilfe-Grenze (siehe 3.3), solange es **keine regelmäßige, vertraglich zugesicherte Zahlung mit Gegenleistungscharakter** wird — z. B. ein einmaliges "Dankeschön" statt eines Fixbetrags pro Monat. Praktikabel, keine Formalitäten. |
| **"Bring your own API key" pro Familie** | Technisch die sauberste Lösung, falls die App tatsächlich an weitere, nicht eng verbundene Familien gehen soll (siehe Marktanalyse-Report zum Skalierungsrisiko) — für **drei bekannte** Kinder unnötiger Mehraufwand (jede Familie bräuchte einen eigenen Anthropic-Account, eigene Zahlungsdaten dort). |
| **Spenden** | Passt eher zu einem offenen, fremden Nutzerkreis (wie bei Khan Academy) — bei drei bekannten Kindern im eigenen/befreundeten Haushalt unpassend förmlich. |
| **Werbung** | Siehe Teil 2 — rechtlich eng, wirtschaftlich bei dieser Nutzerzahl bedeutungslos. **Nicht empfohlen.** |
| **Abo/kommerzielles Modell** | Siehe Teil 3 — Deckungsbeitrag wäre kein Problem, aber der Verwaltungsaufwand steht in keinem Verhältnis zu drei Kindern. **Nicht empfohlen für den aktuellen Umfang.** |

**Klare Einordnung statt Businessplan:** Bei drei Kindern und Kosten im Bereich von Centbeträgen bis
knapp über einem Euro pro Kind und Monat gibt es **keinen wirtschaftlichen oder rechtlichen Grund**, das
Projekt zu monetarisieren. Die einzige Situation, in der sich das ändern würde, ist eine **deutliche
Ausweitung des Nutzerkreises** über den engen, bekannten Familienkreis hinaus (siehe dazu auch die
Skalierungswarnung im Marktanalyse-Report) — das ist aber ein anderes Projekt mit anderer
Kostenstruktur, kein Grund, jetzt vorsorglich eine Gewerbeanmeldung anzugehen.

---

## Fallstricke & Risiken

- **Token-Schätzung ist eine Schätzung, keine Messung.** Die tatsächlichen Werte (`tokensIn`/`tokensOut`
  in `agent.ts`) werden im Code bereits erfasst, aber nicht geloggt — leicht nachrüstbar (siehe 1.7).
- **`gradeExercise()` ist im Produktivpfad unerreichbar** (siehe 1.1) — das ist ein Kosten-Plus (spart
  Geld), aber auch ein Funktions-Minus (keine KI-Toleranz für Tippfehler bei Freitextantworten trotz
  entsprechendem Prompt). Falls das gewünschte Verhalten ist, wäre die Fallback-Logik in
  `localGrade.ts`/`grade/route.ts` anzupassen — das ist eine Produktentscheidung, keine
  Kostenentscheidung, und liegt außerhalb dieser Recherche (kein Code wurde geändert).
- **Anton Plus/andere Herstellerseiten waren erneut über den Proxy blockiert** — alle Preisangaben in
  Teil 3 stammen wie im Marktanalyse-Report aus Sekundärquellen/App-Store-Metadaten, nicht aus direktem
  Seitenaufruf.
- **Sobald aus Kostenteilung ein Vertrag wird**, kippt die rechtliche Einordnung schlagartig (siehe
  3.3) — das ist der Punkt, an dem man am ehesten "aus Versehen" ein Gewerbe betreibt, ohne es zu merken.
- **DSA Art. 28** dürfte diese App zwar nicht direkt binden (siehe 2.3), das ist aber keine
  höchstrichterlich geklärte Einzelfallfrage für "selbstgehostete Familien-App" — bei einer echten
  Öffnung für fremde Nutzer sollte das neu geprüft werden.

## Quellen

- [omsels.info – Schwarze Liste Nr. 28 UWG](https://www.omsels.info/die-verbote-oder-was-darf-ich-nicht/schwarze-liste/6-schwarze-liste-nr-28) — Fachkommentar
- [BGH I ZR 96/13 – Kaufappell an Kinder](https://www.rechtsportal.de/Rechtsprechung/Rechtsprechung/2014/BGH/Richten-des-Kaufappells-auf-ein-konkretes-Produkt-oder-mehrere-konkrete-Produkte-als-Voraussetzung-fuer-eine-unmittelbare-Aufforderung-zum-Kauf-gem.-Nr.-28-Anh.-zu-3-Abs.-3-UWG-Verstoss-einer-i.R.-einer-Zeugnisaktion-an-Schulkinder-gerichteten-Werbung-eines-Elektronik-Fachmarktes-mit-einem-Preisnachlass-fuer-jede-Eins-im-Zeugnis-gegen-4-Nr.-1-2-UWG) — Rechtsprechung
- [lxgesetze.de – § 6 JMStV](https://lxgesetze.de/jmstv/6) — Gesetzestext
- [JMStV-Volltext, die-medienanstalten.de](https://www.die-medienanstalten.de/fileadmin/user_upload/Rechtsgrundlagen/Gesetze_Staatsvertraege/JMStV/Jugendmedienschutzstaatsvertrag_JMStV.pdf) — Primärquelle
- [gesetz-digitale-dienste.de – Art. 28 DSA](https://gesetz-digitale-dienste.de/dsa/artikel-28/) — Gesetzestext
- [lexmea.de – Art. 29 DSA (Kleinunternehmen-Ausnahme)](https://lexmea.de/de/gesetz/dsa/art-29) — Gesetzestext
- [Khan Academy Kids](https://www.khanacademy.org/kids) — Hersteller/Non-Profit
- [technik-fuer-kids.de – Anton App](https://technik-fuer-kids.de/produkte/anton-lern-app-grundschule-deutsch-mathe-lernen/) — Sekundärquelle
- [lernmarktplatz.de – Anton App](https://lernmarktplatz.de/products/anton-die-kostenlose-schul-app) — Testportal
- [gesetz-ratgeber.de – Gewerbeanmeldung 2026](https://gesetz-ratgeber.de/rechtsgebiete/verwaltungsrecht/gewerbeanmeldung-pflichten) — Ratgeber
- [Pflegenetz Sachsen – Steuer/Gewerbe Nachbarschaftshilfe](https://www.pflegenetz.sachsen.de/download/BF-Infoblatt_Steuer_Gewerbe_Versicherung_NBH_15.12.2025.pdf) — Fachinfoblatt
- [taxtify.de – Kleinunternehmerregelung 2026](https://taxtify.de/steuer-lexikon/kleinunternehmerregelung/) — Steuerportal
- [Handelskammer Hamburg – Kleinunternehmerregelung](https://www.handelskammer-hamburg.de/recht-steuern/steuerrecht/umsatzsteuer-mehrwertsteuer/umsatzsteuer-mehrwertsteuer-national/kleinunternehmerregelung-6680502) — Behörde/Kammer
- [selbststaendigkeit.de – Impressum Kleinunternehmer](https://selbststaendigkeit.de/buchhaltung-fuer-gruender/impressum-kleinunternehmer/) — Ratgeber
- [e-recht24.de – Widerrufsrecht digitale Inhalte](https://www.e-recht24.de/ecommerce/13530-widerrufsrecht-fuer-digitale-inhalte.html) — Fachportal
- [datenschutz-generator.de – Widerrufsbutton 2026](https://datenschutz-generator.de/widerrufsbutton/) — Fachportal
- [sbs-legal.de – PayPal-Geschäftskonto](https://www.sbs-legal.de/lexikon/paypal-konto-eroeffnet-fuer-unternehmerinnen) — Kanzlei
- [accountable.de – Stripe als Kleinunternehmer](https://www.accountable.de/blog/stripe-als-kleinunternehmer-nutzen/) — Fachportal
- `docs/research/2026-08-15-marktanalyse-lernapps.md` — eigene Vorrecherche (Preistabelle Teil 3)
- `docs/research/2026-08-15-datenschutz-dsgvo.md` — eigene Vorrecherche (DSGVO-Grundlage)
- EUR/USD-Kurs Stand 14.08.2026 (~1,157, via Suchindex, Direktfetch von tradingeconomics.com/investing.com
  vom Proxy blockiert)

## Offene Punkte

- **Exakte Token-Zahlen nicht gemessen**, nur aus Zeichenzahlen geschätzt — siehe 1.7 für den
  pragmatischen Messweg (Logging der bereits vorhandenen `tokensIn`/`tokensOut`-Werte).
- **Tatsächliche tägliche Aufgabenzahl der drei Kinder nicht erhoben** — die Szenarien in 1.4 sind
  plausible Annahmen, keine Messwerte aus der laufenden App-Nutzung (ließe sich aus der `attempts`-Tabelle
  auslesen, wenn erwünscht).
- **Anton-Plus-Preise und weitere Anbieterseiten weiterhin nicht direkt verifizierbar** (Proxy-Block),
  siehe auch die entsprechenden offenen Punkte im Marktanalyse-Report.
- **Ob `gradeExercise()`/das teurere `REASONING_MODEL` für Textaufgaben absichtlich unerreichbar ist**
  oder ein Implementierungsversehen, konnte ich aus dem Code allein nicht sicher beurteilen — das ist
  eine Rückfrage an den/die Entwickler:in der App, keine Rechercheaufgabe.
- **Rechtliche Bewertung zu UWG/JMStV/DSA ist Sachstand, kein verbindlicher Rechtsrat** — vor einer
  tatsächlichen Monetarisierung (auch in kleinem Rahmen) sollte das mit einer auf Wettbewerbs-/
  Medienrecht spezialisierten Fachperson abgeglichen werden, insbesondere falls doch eine Werbeform
  erwogen wird.
