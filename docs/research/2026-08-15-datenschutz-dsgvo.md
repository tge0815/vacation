# Datenschutzlage "Ferien-Lerncoach" bei Mitnutzung durch ein Nachbarskind

Stand: 2026-08-15. Kein Rechtsrat — siehe Abschnitt "Grenzen dieser Recherche" am Ende.

## Empfehlung (Kurzfassung)

Die Haushaltsausnahme (Art. 2 Abs. 2 lit. c DSGVO) trägt diese Konstellation nach ganz überwiegender
Auslegung **nicht mehr** — nicht in erster Linie wegen des Nachbarskindes, sondern schon vorher, weil die
App über die Anthropic-API einen kommerziellen Drittanbieter in den USA einschaltet. Mit dem Nachbarskind
kommt zusätzlich hinzu, dass Kinder außerhalb des eigenen Personensorgeberechts betroffen sind. Das ist aber
kein Grund zur Panik: Der Betreiber (Sie) wird damit "Verantwortlicher" im Sinne der DSGVO, die Verarbeitung
ist aber mit überschaubarem Aufwand rechtmäßig zu gestalten — im Kern durch eine schriftliche Einwilligung
der Nachbarseltern, eine kurze kindgerechte Datenschutzinfo und etwas Datensparsamkeit gegenüber der
Anthropic-API. Das reale Risiko einer aufsichtsbehördlichen Maßnahme ist in dieser privaten, nicht-kommerziellen
Konstellation gering, aber "gering" ist nicht "null" — insbesondere weil hier fremde Kinder betroffen sind,
für die Sie keine elterliche Verantwortung tragen.

## Annahme

Ich gehe davon aus, dass die "Familie" im Sinne der App (ein `families`-Account mit E-Mail-Login) weiterhin
nur der eigene Haushalt (Herr/Frau Gerner) ist und das Nachbarskind als zusätzliches Kind-Profil **unter
diesem einen Account** angelegt wird/wurde — es gibt in der App kein Konzept eines zweiten, unabhängigen
Eltern-Zugangs für die Nachbareltern. Das ist rechtlich relevant (siehe Abschnitt 2) und wird unten so behandelt.

---

## 1. Datenbestand — was die App tatsächlich verarbeitet (Repo-Befund)

Geprüft: `src/lib/db/sqlite.ts` (Schema/Migrationen), `src/lib/db/repo.ts`, `src/lib/ai/*.ts`,
`src/app/api/**/route.ts`, `src/components/kid/useSpeech.ts`, `src/lib/auth/*`, `src/lib/serialize.ts`,
README.md, AGENTS.md, ios-companion/.

**Gespeichert in SQLite (`/data/lernferien.db`, dauerhaft, ohne Löschfristen-Logik):**

| Tabelle | Personenbezogene Felder | Bemerkung |
|---|---|---|
| `families` | Name, E-Mail, Passwort-Hash (scrypt), Eltern-PIN-Hash | Ein Account = ein Haushalt |
| `users` (Kinder) | Name (Freitext, i.d.R. Klarname/Rufname), Klasse, Avatar/Farbe, optional Benutzername + Passwort-Hash | Kein Geburtsdatum, keine Adresse |
| `attempts` | **`answer_text`** (Freitextantwort des Kindes, bei Vorlese-Aufgaben das **volle Sprach-zu-Text-Transkript**), `exercise_json`, `grade_json` (KI-Feedback), Datum, Dauer, Ergebnis | Zeitlich unbegrenzt gespeichert, kein TTL/Purge-Job im Code gefunden |
| `vocab` | Vokabelpaare + Lernstatistik pro Kind | Lerninhalt, für sich genommen kaum sensibel |
| `game_scores`, `code_progress`, `daily_plan`, `coin_*`, `reward_*` | Spiel-/Nutzungsdaten pro Kind | Verhaltens-/Nutzungsprofil über Zeit |

Löschung nur manuell über `deleteUser()` (kaskadiert per `ON DELETE CASCADE` auf `attempts`, `goals`) —
funktioniert technisch, ist aber nirgends als Prozess/Frist definiert oder für Eltern sichtbar dokumentiert.

**Was an die Anthropic-API (extern, USA) geht — drei getrennte Ströme:**

1. **Aufgaben generieren/bewerten** (`src/lib/ai/exercises.ts`, `agent.ts`): Themenname, Schwierigkeitsstufe,
   die Freitextantwort des Kindes (`answer_text`) und bei Vorlese-Aufgaben das **Transkript des Vorgelesenen**
   gehen als Prompt an Claude (Modell konfigurierbar, laut `.env.example` Standard „Haiku“, laut README-Tabelle
   „Sonnet/Opus“ — die beiden Dokumente widersprechen sich, im Container zählt die tatsächlich gesetzte
   `LEARN_AGENT_*_MODEL`-Variable). Kein Klarname des Kindes in diesem Prompt.
2. **Vokabelfoto-Import** (`src/lib/ai/vocabPhoto.ts`, `POST /api/vocab/photo`): Ein von den Eltern
   hochgeladenes **Foto** (Base64, bis ~5 MB) der physischen Vokabelheft-Seite wird direkt im Bild-Prompt an
   Claude geschickt (Vision-API). Das Bild selbst wird **nicht** in der DB gespeichert — nur die daraus
   extrahierten Wortpaare. Das Bild verlässt den Server aber vollständig zu Anthropic; falls auf dem Foto
   zufällig Name, Schulstempel, Hintergrund etc. zu sehen sind, geht das mit.
3. **Eltern-Coach-Chat** (`src/lib/ai/coach.ts`, `buildContext()`): Hier werden für **jedes Kind der Familie**
   der **Klarname**, die Klassenstufe, die Serie ("Streak"), Trefferquoten je Fach der letzten 14 Tage sowie
   der **Wortlaut der letzten 6 Aufgaben** (Frage + richtig/falsch) in den System-Prompt geschrieben und an
   Claude (Sonnet/Opus, Reasoning-Modell) gesendet — bei **jeder** Chat-Nachricht der Eltern neu, plus die
   letzten 8 Chat-Nachrichten als Verlauf. Das ist der einzige Punkt, an dem **Klarnamen von Kindern
   zusammen mit Leistungsdaten** an Anthropic gehen.

**Sprach-/Mikrofondaten (Vorlesen):** Die Spracherkennung läuft über die **browsereigene Web Speech API**
(`useSpeech.ts`, `webkitSpeechRecognition`), nicht über die Anthropic-API. Das bedeutet: Das **Rohaudio**
der Kinderstimme geht in Chrome/Chromium typischerweise an **Googles** Cloud-Spracherkennungsdienst (das ist
Browser-internes Verhalten, im Repo nicht sichtbar/steuerbar und dem Betreiber vermutlich nicht bewusst) —
ein **dritter externer Verarbeiter neben Anthropic**, den AGENTS.md nicht erwähnt. Auf dem eigenen Server
landet nur das fertige Text-Transkript (`answer_text`), das dann zusätzlich an Anthropic zur Bewertung geht.
Rohaudio selbst wird nirgends in der SQLite-DB gespeichert.

**Auth/Zugang:** Kinder bekommen einen eigenen Benutzernamen + Passwort (`updateUser`), das Passwort wird
gehasht (scrypt) gespeichert; im Eltern-UI wird das Passwort beim Eintippen im Klartext angezeigt ("damit
du es dem Kind sagen kannst") — kein Datenschutzproblem für sich, aber erwähnenswert für Bildschirm-/
Zugriffsschutz beim Anlegen.

**Was fehlt (positiv für Datensparsamkeit):** keine Geburtsdaten, keine Adressen, keine Fotos von Kindern
selbst, keine Standortdaten, kein Tracking Dritter, keine Werbung/Analytics, kein Klarname im
Aufgaben-Generierungs-Prompt.

**Was fehlt (negativ):** keine Datenschutzerklärung/Impressum-Seite in der App (`grep` auf
"Datenschutz|Impressum|Einwilligung|privacy" im `src`-Baum ergibt keinen Treffer), kein Consent-Mechanismus,
keine Löschfrist-/Aufbewahrungslogik, keine getrennte Kennzeichnung "dies ist ein fremdes Kind" im
Datenmodell (das Nachbarskind ist im Schema von den eigenen Kindern nicht unterscheidbar).

---

## 2. Rechtsfragen

### 2.1 Greift die Haushaltsausnahme noch?

**Nein — mit hoher Wahrscheinlichkeit, und zwar aus zwei unabhängigen Gründen.**

Art. 2 Abs. 2 lit. c DSGVO nimmt Verarbeitungen "ausschließlich persönlicher oder familiärer Tätigkeiten"
vollständig vom Anwendungsbereich der DSGVO aus. Der EuGH hat in *Ryneš* (C‑212/13, zur Vorgänger-Richtlinie,
aber weiterhin die Leitentscheidung) klargestellt, dass die Ausnahme **eng auszulegen** ist und nur greift,
soweit die Verarbeitung sich rein im privaten/familiären Lebensbereich abspielt — sobald sie über diese
Sphäre hinausreicht (im Fall: eine Kamera, die auch den öffentlichen Gehweg erfasste), entfällt sie
([gdprhub.eu zu C-212/13](https://gdprhub.eu/index.php?title=CJEU_-_C-212/13_-_Franti%C5%A1ek_Ryne%C5%A1),
[EU Law Analysis Blog](http://eulawanalysis.blogspot.com/2014/12/bringing-data-protection-home-cjeu.html)).

Zwei Gründe, warum das hier zutrifft:

1. **Der externe KI-Anbieter.** Deutsche Datenschutz-Fachautoren sind sich einig, dass die Haushaltsausnahme
   nicht mehr greift, sobald personenbezogene Daten an einen kommerziellen Cloud-/Plattform-Dienstleister
   weitergegeben werden, der die Daten zu eigenen Zwecken nutzt oder über AGB weitreichende Nutzungsrechte
   erhält — als Beispiele werden ausdrücklich vernetzte Geräte/IoT und Cloud-Verarbeitung bei "großen
   Server-Anbietern in den USA" genannt
   ([dr-datenschutz.de](https://www.dr-datenschutz.de/die-haushaltsausnahme-der-dsgvo/),
   [heise/ct-Vorschau](https://www.heise.de/select/ct/vorschau/2203909482405874662)). Die Anthropic-API ist
   funktional genau das: ein kommerzieller US-Cloud-Dienst, an den die App die Eingaben der Kinder aktiv
   weiterreicht. Diese Einschätzung ist in der Literatur **nicht abschließend höchstrichterlich geklärt**,
   aber die herrschende Linie der Aufsichtsbehörden und Fachautoren geht klar in diese Richtung — eine
   restlose Rechtssicherheit ("die Ausnahme greift definitiv nicht") gibt es mangels einschlägiger
   Leitentscheidung speziell zu KI-APIs nicht, die Tendenz ist aber eindeutig.
2. **Das Nachbarskind.** Selbst wenn man den KI-Punkt anders bewerten wollte: Die Ausnahme deckt nach den
   Fachbeiträgen den "engen privaten oder familiären Bereich" ab — Familie und "enge Bekannte" fallen noch
   darunter (Beispiel Geburtstagsliste), sobald aber Daten von Personen verarbeitet werden, die **weder
   Familie noch enge persönliche Bekannte** sind, ist die Grenze überschritten
   ([dr-datenschutz.de](https://www.dr-datenschutz.de/die-haushaltsausnahme-der-dsgvo/)). Ein einzelnes
   Nachbarskind, dessen Nutzung mit den eigenen Eltern abgesprochen ist, dürfte in den allermeisten
   Lesarten noch als "enger persönlicher Kreis" durchgehen — hier ist die Rechtslage tatsächlich **unklar
   und nicht sauber justiziell entschieden**, es gibt keine einschlägige Entscheidung genau zu diesem
   Fall (ein Kind, kein kommerzieller Kontext, mündliche Elternabsprache). Es ist also nicht das
   Nachbarskind allein, das die Ausnahme kippt — es ist vor allem der KI-Anbieter.

**Fazit zu 2.1:** Rechnen Sie ab jetzt so, als gelte die DSGVO vollumfänglich — das ist die vorsichtige und
nach der Literaturlage auch die wahrscheinlich zutreffende Annahme. Eine abschließende Klärung "gilt die
Ausnahme noch ja/nein" kann nur eine Aufsichtsbehörde oder ein Gericht im Einzelfall treffen; es gibt dazu
keine Entscheidung, die exakt auf "private Lern-App + Nachbarskind + KI-API" passt.

### 2.2 Verantwortlicher und Rechtsgrundlage

Wenn die Ausnahme entfällt, ist **die Person, die den Server betreibt und die Zwecke/Mittel der
Verarbeitung bestimmt** (also Sie, über den `families`-Account), **Verantwortlicher** i.S.d. Art. 4 Nr. 7
DSGVO — und zwar für **alle** Kinder-Profile unter diesem Account, einschließlich des Nachbarskindes.
Anthropic ist dabei technisch Auftragsverarbeiter für die Verarbeitung, die Sie veranlassen (dazu mehr in 2.4).

Für die Kinder-Nutzerdaten kommt als Rechtsgrundlage praktisch nur die **Einwilligung** nach Art. 6 Abs. 1
lit. a i.V.m. **Art. 8 DSGVO** in Betracht (ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f trägt bei
Kinderdaten und einem KI-Drittlandtransfer erfahrungsgemäß nicht, weil die Interessenabwägung bei
Minderjährigen strenger ausfällt).

- **Wer muss einwilligen?** Art. 8 Abs. 1 DSGVO: Bei "Diensten der Informationsgesellschaft", die einem
  Kind direkt angeboten werden, ist die Verarbeitung erst ab **16 Jahren eigener Einwilligungsfähigkeit**
  des Kindes rechtmäßig; darunter ist die Einwilligung **des Trägers der elterlichen Verantwortung**
  erforderlich. Deutschland hat von der Öffnungsklausel (Absenkung auf minimal 13 Jahre) **keinen Gebrauch
  gemacht** — es bleibt bei 16 Jahren
  ([dr-datenschutz.de zu Kindereinwilligung](https://www.dr-datenschutz.de/anforderungen-an-die-einwilligung-von-kindern-nach-der-dsgvo/),
  [proliance.ai](https://www.proliance.ai/blog/dsgvo-und-kinder-fragen-und-antworten-zum-thema-datenschutz-minderjahrige)).
  Bei 11–12-jährigen Kindern (weit unter 16) ist damit in jedem Fall die Einwilligung der **Eltern** nötig —
  für die eigenen Zwillinge Ihre eigene, für das Nachbarskind die der **leiblichen/sorgeberechtigten Eltern
  der Nachbarin**, nicht Ihre eigene. Das ist der entscheidende Punkt: Sie können als Betreiber nicht
  "stellvertretend" für ein fremdes Kind einwilligen, nur weil es bei Ihnen mitläuft.
- **Reicht die mündliche Absprache?** Formal: Art. 8 DSGVO verlangt keine bestimmte Form der Einwilligung
  selbst, wohl aber macht Art. 7 Abs. 1 DSGVO den Verantwortlichen **nachweispflichtig** ("muss
  nachweisen können, dass … eingewilligt wurde"). Eine rein mündliche Absprache erfüllt diese Nachweispflicht
  nicht — nicht weil sie ungültig wäre, sondern weil Sie im Streit- oder Auskunftsfall nichts vorlegen
  können. Praktisch heißt das: **schriftlich (auch reicht: WhatsApp/E-Mail mit klarem Ja) einholen und
  aufbewahren**, nicht neu verhandeln, ob überhaupt eingewilligt wurde.
- Zusätzlich zu beachten: Art. 8 Abs. 1 DSGVO ist tatbestandlich auf "Dienste der Informationsgesellschaft,
  die einem Kind **direkt** angeboten werden" zugeschnitten — ob eine selbstgehostete, nicht-kommerzielle
  Familien-App darunterfällt, ist nicht durch Rechtsprechung geklärt, wird in der Praxis aber überwiegend
  bejaht, wenn Kinder die Anwendung selbst bedienen (wovon hier auszugehen ist, PIN/Login je Kind). Auch
  hier gilt: im Zweifel die strengere Auslegung ansetzen.

### 2.3 Informationspflichten (Art. 13, Art. 12 Abs. 1)

Art. 13 DSGVO verlangt eine Information der betroffenen Person (bzw. ihrer Eltern) u. a. über: Identität des
Verantwortlichen, Zwecke und Rechtsgrundlage, **Empfänger** (hier: ausdrücklich "Anthropic, USA" nennen),
Drittlandübermittlung und Garantie, Speicherdauer, Betroffenenrechte, Widerrufsrecht der Einwilligung.
Art. 12 Abs. 1 verlangt zusätzlich, dass diese Information "in präziser, transparenter, verständlicher und
leicht zugänglicher Form" erfolgt — Erwägungsgrund 58 konkretisiert das für **Kinder ausdrücklich**: Werden
Informationen an ein Kind gerichtet, muss die Sprache "so klar und einfach" sein, "dass das Kind sie leicht
verstehen kann". Das ist in der Praxis oft übersehenes Klein-Klein — hier aber direkt einschlägig, weil die
App von Kindern selbst bedient wird (eigener Login).

Praktisch bedeutet das **zwei Ebenen**: eine vollständige, "erwachsenengerechte" Information für die Eltern
(auch der Nachbarin) und eine kurze, bildhafte Zusammenfassung für die Kinder selbst ("Deine Antworten
schickt die App an einen Computer in Amerika, der dir beim Lernen hilft").

### 2.4 Der Anthropic-Teil

Das ist der heikelste Punkt, weil hier die Primärquellen (Anthropics eigene Privacy Policy, Commercial
Terms, Trust Center) über den in dieser Umgebung verfügbaren Netzwerkzugang **nicht direkt abrufbar waren**
(Egress-Proxy blockiert anthropic.com, privacy.anthropic.com, support.anthropic.com, support.claude.com,
trust.anthropic.com vollständig). Die folgenden Aussagen stammen daher aus **Sekundärquellen** (spezialisierte
Compliance-/Kanzlei-Aggregatoren, die die Primärdokumente zitieren) — als solche gekennzeichnet, mit der
ausdrücklichen Empfehlung, sie vor einer endgültigen Entscheidung gegen die aktuellen Originaldokumente auf
anthropic.com zu prüfen (siehe "Offene Punkte").

- **DPA/AVV für Nicht-Firmenkunden:** Nach übereinstimmender Sekundärquellenlage ist Anthropics
  Data Processing Addendum (DPA) **automatisch Bestandteil der "Commercial Terms of Service"**, die für die
  **API-Nutzung** (im Gegensatz zur Konsumenten-Oberfläche claude.ai) gelten — ohne separaten
  Unterschriftsprozess, allein durch Nutzung der API. Es wird nicht danach unterschieden, ob der
  API-Kunde ein Unternehmen oder eine Privatperson ist; entscheidend ist der Nutzungsweg (API vs. claude.ai)
  ([stork.ai](https://www.stork.ai/en/anthropic-data-processing-addendum),
  [compound.law DPA-Guide](https://compound.law/en-DE/tools/anthropic-dpa/),
  [privateclaude.ai](https://privateclaude.ai/business/anthropic-dpa-explained)). Ein **verbindlicher
  eigener Nachweis**, dass eine Privatperson mit eigenem Zahlungsmittel diesen DPA tatsächlich vollwertig
  in Anspruch nehmen kann (z. B. Auskunftsrechte, Audit-Rechte), konnte ich mit den verfügbaren Mitteln
  **nicht abschließend verifizieren** — das ist ein offener Punkt.
- **Mindestalter der Nutzer:** Anthropics **Consumer Terms** verlangen für claude.ai ein Mindestalter von
  18 Jahren; **irrelevant** ist das hier direkt, weil die Kinder nie ein eigenes Anthropic-Konto haben,
  sondern nur über Ihren API-Key mittelbar bedient werden. Anthropic erlaubt genau dieses Modell explizit:
  Laut "Responsible Use of Anthropic's Models: Guidelines for Organizations Serving Minors" dürfen
  Entwickler/Organisationen die API in einem Produkt einsetzen, das sich an Minderjährige richtet, wenn sie
  bestimmte Sicherheits-/Offenlegungspflichten einhalten — insbesondere die **Pflicht, gegenüber den
  Nutzern offenzulegen, dass sie mit einem KI-System interagieren**, sowie kindgerechte Inhalts-/
  Sicherheitsvorkehrungen
  ([support.claude.com – Guidelines for Organizations Serving Minors](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors),
  [support.claude.com – Child safety guidance for developers](https://support.claude.com/en/articles/15591275-child-safety-guidance-for-developers),
  über Google-Cache/Suchindex eingesehen, da Direktzugriff blockiert war). Diese Anforderung deckt sich
  übrigens mit der EU-KI-Verordnung: Art. 50 AI Act verlangt ab 2. August 2026 ausdrücklich, dass
  Chatbot-/KI-Interaktionen als solche erkennbar gemacht werden, mit **strengerem Maßstab gerade dann, wenn
  Kinder zur Zielgruppe gehören** ([artificialintelligenceact.eu Art. 50](https://artificialintelligenceact.eu/article/50/)).
  Die AI-Act-Ausnahme für "ausschließlich persönliche, nicht-berufliche Tätigkeit" (Art. 2 Abs. 10 AI Act,
  analog zur DSGVO-Haushaltsausnahme) befreit Sie zwar von den *Deployer*-Pflichten des AI Act selbst
  ([ai-act-law.eu Art. 2](https://ai-act-law.eu/de/artikel/2/)) — unabhängig davon bleibt die
  Kennzeichnungspflicht aber schon als **Anthropic-Nutzungsbedingung** bestehen, nicht erst als
  gesetzliche AI-Act-Pflicht. Praktisch: Der App fehlt aktuell ein sichtbarer Hinweis "Diese Aufgabe/dieses
  Feedback kommt von einer KI" — das sollte ergänzt werden.
- **Drittlandtransfer (Art. 44 ff.):** Nach Sekundärquellen basiert der Transfer auf **Standardvertragsklauseln
  (SCC, Modul 2/3 nach Durchführungsbeschluss (EU) 2021/914)**, die Bestandteil des DPA sind; zusätzlich ist
  Anthropic seit 2023 unter dem **EU-US Data Privacy Framework (DPF)** zertifiziert
  ([compound.law SCC-Guide](https://compound.law/en-DE/tools/anthropic-scc/)). **Zum aktuellen Status des DPF
  (Stand August 2026):** Das Rahmenwerk gilt weiterhin, steht aber rechtlich nicht mehr ganz sicher da — die
  Klage des französischen Abgeordneten Philippe Latombe gegen den Angemessenheitsbeschluss wurde vom EuG am
  3. September 2025 abgewiesen, ist aber seit 31. Oktober 2025 beim EuGH in der Rechtsmittelinstanz anhängig
  (Rs. C‑703/25 P) und laut Fachbeobachtern "auf merklich wackligerem Grund" als bei Einführung 2023
  ([europeanmartech.eu](https://europeanmartech.eu/blog/eu-us-data-privacy-framework-2026-status),
  [batesonlaw.com](https://batesonlaw.com/eu-us-data-privacy-framework-current-legal-status/)). Für die
  Praxis heißt das: DPF-Zertifizierung + SCC als Fallback ist aktuell **rechtlich tragfähig**, aber keine
  dauerhaft in Stein gemeißelte Grundlage — eine Neubewertung in 12–24 Monaten ist sinnvoll.
- **EU-Datenverarbeitung als Option:** Nach übereinstimmender Quellenlage bietet die **direkte Anthropic-API**
  aktuell **keine EU-Datenresidenz** an (nur "US" oder "Global"); eine EU-Verarbeitung ist nur über Umwege
  wie AWS Bedrock (Frankfurt/Irland/Paris/Stockholm) oder Google Vertex AI verfügbar
  ([compound.law EU-Hosting-Guide](https://compound.law/en-DE/tools/claude-eu-hosting/),
  [amitkoth.com](https://amitkoth.com/claude-regulated-finance-eu-residency/)) — für einen
  Privathaushalt mit einfachem `ANTHROPIC_API_KEY` (wie hier via `@anthropic-ai/sdk` konfiguriert, siehe
  `src/lib/ai/agent.ts`) praktisch nicht mit vertretbarem Aufwand nutzbar. Das ist also technisch **kein
  kurzfristig realistischer Minimalschritt**, sondern Overkill für diesen Kontext.
- **Training mit API-Eingaben:** Nach Sekundärquellen (mit Bezug auf Anthropics Support-/Privacy-Center)
  werden **API-Eingaben/-Ausgaben grundsätzlich nicht zum Modelltraining verwendet** — das gilt ausdrücklich
  auch für die reine API-Nutzung (nicht nur Enterprise). Eine im Sommer 2025 angekündigte neue Trainings-Policy
  für Consumer-Produkte (claude.ai-Chats) betrifft laut denselben Quellen explizit **nicht** API, Claude for
  Education oder Claude Gov ([WebSearch-Zusammenfassung zu privacy.anthropic.com/support.anthropic.com]).
  Ausnahme: Daten können zur Durchsetzung der Nutzungsrichtlinien (Trust & Safety, z. B. Missbrauchserkennung)
  ausgewertet und dafür länger aufbewahrt werden.
- **Aufbewahrungsfristen bei Anthropic:** API-Ein-/Ausgaben werden laut Sekundärquellen standardmäßig
  **innerhalb von 30 Tagen** automatisiert gelöscht, außer bei Zero-Data-Retention-Vereinbarung, gesetzlicher
  Aufbewahrungspflicht oder laufender Richtlinien-Durchsetzung
  ([support.anthropic.com – Zero Data Retention](https://support.anthropic.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to)).
  Zero-Data-Retention-Vereinbarungen sind nach den gefundenen Quellen typischerweise an **Enterprise-Verträge**
  gebunden, nicht am Self-Service-API-Zugang mit Kreditkarte — für diesen Haushalt also derzeit nicht
  erreichbar; die 30-Tage-Standardfrist ist aber ohnehin schon deutlich kürzer als die faktisch unbegrenzte
  Aufbewahrung in der eigenen SQLite-DB, die insofern der größere Handlungspunkt ist.

**Zwischenfazit 2.4:** Die vertragliche Grundlage (DPA/SCC/DPF) existiert und ist für die API-Nutzung
grundsätzlich einschlägig — das größere praktische Risiko liegt nicht im Fehlen einer Rechtsgrundlage
gegenüber Anthropic, sondern darin, dass (a) niemand außer den Aufsichtsbehörden je geprüft hat, ob ein
Privathaushalt sich wirklich wirksam auf ebendiese für Geschäftskunden gedachten Klauseln berufen kann, und
(b) der Coach-Chat gerade Klarnamen + Leistungsdaten überträgt, wo das mit etwas Aufwand vermeidbar wäre
(siehe Abschnitt 3).

### 2.5 Besondere Datenkategorien (Art. 9)

Kein Alarmismus hier: **Die Sprachaufnahmen sind nach den gefundenen Quellen mit hoher Wahrscheinlichkeit
keine biometrischen Daten im Sinne von Art. 9 DSGVO.** Entscheidend ist laut Art. 4 Nr. 14 DSGVO nicht,
dass überhaupt eine Stimme aufgenommen wird, sondern ob aus **speziellen technischen Verfahren** ein
eindeutiges Identifikationsmerkmal ("Voiceprint") zur **Identifizierung** der Person erzeugt wird
([bayerwaldmedia.de](https://bayerwaldmedia.de/news/die-stimme-als-biometrisches-datum-rechtliche-huerden-der-spracherkennung/)).
Hier passiert technisch nur eine **Transkription** (Sprache → Text) zur Bewertung des Vorlesens, keine
Stimmerkennung/-identifikation. Die Stimme bleibt personenbezogenes Datum (Art. 6 DSGVO reicht), fällt aber
nicht automatisch unter die verschärften Anforderungen des Art. 9. Auch bei den Freitextantworten der Kinder
ist keine strukturelle Nähe zu Art.-9-Kategorien (Gesundheit, ethnische Herkunft, Religion etc.) zu erwarten —
außer ein Kind schreibt zufällig etwas Entsprechendes in eine freie Textantwort hinein (theoretisch möglich,
aber kein systematisches Risiko der App-Architektur, sondern ein allgemeines Freitext-Risiko).

### 2.6 Betroffenenrechte und Löschkonzept

Die App muss praktisch in der Lage sein,
- **Auskunft** zu erteilen (Art. 15): alle zu einem Kind gespeicherten Datensätze (`users`, `attempts`,
  `vocab`, `game_scores` etc.) exportierbar/einsehbar zu machen — aktuell nur über direkten DB-Zugriff
  möglich, keine UI-Funktion dafür vorhanden;
- **Löschung** durchzuführen (Art. 17): `deleteUser()` existiert und kaskadiert korrekt, ist aber ein
  admin-seitiger Akt, kein selbstständiger "Lösch mich"-Weg für die Nachbareltern;
- **Datenübertragbarkeit/Export** zu ermöglichen (Art. 20), falls gewünscht — aktuell nicht vorhanden;
- eine **Löschfrist** zu definieren und einzuhalten (kein technischer TTL-Mechanismus im Code).

Für ein Nachbarskind ist das besonders wichtig, weil die eigentlichen Eltern (die Anspruchsberechtigten)
keinen eigenen Zugang zur App haben und daher auf Ihre Auskunft angewiesen sind — es lohnt sich, das aktiv
zuzusichern statt es bei einer bloß theoretischen Möglichkeit zu belassen.

---

## 3. Praktische Empfehlung — priorisierte Handlungsliste

**Unverzichtbar (jetzt umsetzen, sonst ist die Verarbeitung des Nachbarskindes nicht rechtmäßig):**

1. **Schriftliche Einwilligung der Nachbarseltern einholen.** Reicht als kurzes Formular oder auch eine
   WhatsApp-/E-Mail-Bestätigung mit konkretem Text (nicht nur "ist ok, dass sie mitmacht", sondern explizit:
   welche Daten, dass sie an Anthropic/USA gehen, wie lange gespeichert, Widerrufsrecht). Aufbewahren
   (Screenshot/PDF reicht), das erfüllt die Nachweispflicht aus Art. 7 Abs. 1.
2. **Kurze, kindgerechte Datenschutzinfo** (eine Seite, altersgerechte Sprache) an die Nachbareltern **und**
   in kindgerechter Kurzform an das Kind selbst — deckt Art. 13/Art. 12 Abs. 1 ab.
3. **Sichtbar machen, dass eine KI beteiligt ist** ("Deine Aufgabe wurde von einer KI erstellt/bewertet") —
   erfüllt sowohl Anthropics eigene Nutzungsbedingungen für Minderjährigen-Szenarien als auch den Geist von
   Art. 50 AI Act, ist mit einem Satz im UI erledigt.

**Gute Praxis (verhältnismäßig, spürbar risikomindernd, kein großer Aufwand):**

4. **Pseudonym statt Klarname für das Nachbarskind** im `users.name`-Feld (z. B. Rufname/Spitzname reicht
   oft, den die Eltern absegnen) — reduziert das, was ohnehin in der DB liegt und potenziell in Backups landet.
5. **Coach-Chat entschärfen:** `buildContext()` in `src/lib/ai/coach.ts` so anpassen, dass entweder (a) das
   Nachbarskind aus dem an Anthropic gesendeten Kontext ausgeschlossen wird (z. B. eigenes Flag am
   `users`-Datensatz), oder (b) grundsätzlich mit einem neutralen Kürzel statt Klarnamen gearbeitet wird. Das
   ist der Punkt mit dem größten Verhältnis von Aufwand zu Risikoreduktion, weil hier aktuell die einzige
   Stelle ist, an der Klarname + Leistungsprofil an einen Drittanbieter geht.
6. **Definierte Löschfrist festlegen und einmal jährlich manuell durchführen** (z. B. `attempts` älter als
   12 Monate löschen) — reicht als pragmatisches Löschkonzept für einen Ein-Personen-Betrieb; eine
   automatisierte Job-Lösung wäre nice-to-have, kein Muss.
7. **Sprachfunktion für das Nachbarskind grundsätzlich möglich lassen, aber Eltern informieren**, dass dabei
   Audio an einen weiteren, in der App bislang unerwähnten Drittanbieter geht (Browser-Spracherkennung,
   praktisch meist Google) — das gehört in dieselbe Datenschutzinfo wie Punkt 2, ist aber kein Grund, die
   Funktion für ein einzelnes Kind technisch zu deaktivieren.
8. **Auskunfts-/Löschzusage aktiv anbieten**: den Nachbareltern sagen, dass sie jederzeit Einsicht/Löschung
   verlangen können — ersetzt eine aufwendige Selbstbedienungs-UI durch einen einfachen, aber wirksamen
   organisatorischen Weg.

**Overkill für diesen Fall (nicht empfohlen, unverhältnismäßig zum Kontext):**

9. Vollständige EU-Datenresidenz über AWS Bedrock/Vertex AI aufsetzen — technischer/finanzieller Aufwand
   steht in keinem Verhältnis zum Ein-Nachbarskind-Szenario.
10. Formales Verzeichnis von Verarbeitungstätigkeiten (Art. 30), Datenschutz-Folgenabschätzung (Art. 35),
    eigener Datenschutzbeauftragter — das sind Instrumente für Unternehmen/größere Verarbeitungen, hier
    unverhältnismäßig; die o. g. Schritte 1–8 decken den Kern bereits ab.
11. Zero-Data-Retention-Enterprise-Vertrag mit Anthropic abschließen — für einen Privathaushalt weder
    zugänglich noch nötig, die Standard-30-Tage-Frist plus eigene Löschfrist (Punkt 6) reichen aus.

---

## 4. Risikoeinordnung

Realistisch betrachtet ist das Risiko einer aufsichtsbehördlichen Beanstandung in dieser Konstellation
**gering**: kein kommerzieller Kontext, keine große Zahl Betroffener (drei Kinder), keine Datenpanne
erkennbar, keine sensible Datenkategorie im Kern der Verarbeitung. Deutsche Aufsichtsbehörden verhängen zwar
grundsätzlich auch gegen Privatpersonen Bußgelder, das geschieht aber nach der Literaturlage vor allem bei
öffentlichkeitswirksamen Verstößen (offene Veröffentlichung, Videoüberwachung öffentlichen Raums) — nicht bei
einer stillen, gutgemeinten Lern-App im Nachbarschaftskreis. Das eigentliche Risiko ist eher praktisch als
aufsichtsrechtlich: Wenn die Nachbareltern später unzufrieden sind (Streit, Umzug, Vertrauensverlust), fehlt
Ihnen ohne schriftliche Einwilligung und Datenschutzinfo die Grundlage, sich sauber zu rechtfertigen — genau
das schließen die "unverzichtbar"-Schritte oben. Verharmlosen sollte man es andererseits auch nicht: Es
handelt sich um Daten fremder minderjähriger Kinder, für die Sie keine elterliche Verantwortung tragen, und
diese Daten gehen an einen US-Anbieter — das ist ein anderes Risikoprofil als bei den eigenen Kindern, auch
wenn die Wahrscheinlichkeit eines Problems niedrig bleibt.

---

## Grenzen dieser Recherche

Dies ist eine Sachstands-Recherche mit Quellenangaben, **kein verbindlicher Rechtsrat**. Für eine
abschließende rechtliche Bewertung — insbesondere zur Frage, ob die Haushaltsausnahme im Einzelfall doch
greift, und zur Wirksamkeit der Anthropic-Verträge für Privatpersonen — sollten Sie eine auf Datenschutzrecht
spezialisierte Fachperson oder die zuständige Landesdatenschutzbehörde (für Niedersachsen: die LfD
Niedersachsen) konsultieren, insbesondere bevor Sie die Konstellation dauerhaft fortführen.

## Offene Punkte

- **Anthropics Primärquellen konnten in dieser Recherche-Umgebung nicht direkt abgerufen werden** (der
  Netzwerk-Proxy blockierte anthropic.com, privacy.anthropic.com, support.anthropic.com, support.claude.com,
  trust.anthropic.com vollständig). Alle Aussagen zu DPA, SCC, DPF-Status, Trainingsnutzung und
  Aufbewahrungsfristen stammen aus Sekundärquellen (spezialisierte Compliance-Aggregatoren), die diese
  Primärdokumente zitieren. **Vor einer endgültigen Entscheidung**: die aktuelle Commercial Terms of Service,
  Privacy Policy und das Trust Center direkt auf anthropic.com/privacy.anthropic.com prüfen (Stand kann sich
  seit den zitierten Sekundärquellen geändert haben).
- Nicht abschließend geklärt: ob der Anthropic-DPA für einen **Privathaushalt ohne Gewerbeanmeldung** in der
  Praxis genauso durchsetzbar/wirksam ist wie für einen Geschäftskunden (z. B. bei Ausübung von
  Auskunfts-/Weisungsrechten gegenüber Anthropic als Auftragsverarbeiter).
  - Klärungsweg: direkte Anfrage bei Anthropic Support/Sales zur konkreten API-Account-Konfiguration.
- Keine belastbare Quelle gefunden zu der Frage, ob genau "ein einzelnes, mit den Eltern abgesprochenes
  Nachbarskind" noch unter den "engen persönlichen Kreis" der Haushaltsausnahme fällt oder nicht — hier gibt
  es keine einschlägige Rechtsprechung, nur die allgemeine restriktive Auslegungslinie.
  - Klärungsweg: Anfrage bei der LfD Niedersachsen (formlose Bürgeranfrage möglich) oder anwaltliche Beratung.
- Nicht geprüft: die genaue Konfiguration von `LEARN_AGENT_DEFAULT_MODEL`/`LEARN_AGENT_REASONING_MODEL` in
  der tatsächlich laufenden `.env` (README und `.env.example` widersprechen sich beim Default-Modell) — für
  die Datenschutzbewertung nicht entscheidend, aber für Kostenschätzung/Modellwahl relevant.
