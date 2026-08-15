# Marktanalyse Lern-Apps (DACH) und Feature-Baseline für den Ferien-Lerncoach

Stand: 2026-08-15. Abgerufene Preise/Fakten sind Momentaufnahmen (Abrufdatum siehe Quellen).

## Empfehlung

Der Ferien-Lerncoach deckt heute die technische Kernfunktion ab, die am Markt am teuersten
verkauft wird (KI-generierte, adaptive Übungen mit sofortigem, erklärendem Feedback) — kostenlos
und ohne Werbung, weil selbstgehostet mit Pay-per-Token-API. Die größte reale Lücke ist **nicht**
fehlende Gamification, sondern dass die komplette Aufgaben-Generierung fest auf "5. Klasse
Gymnasium" verdrahtet ist (`TUTOR_BASE` in `src/lib/ai/prompts.ts`), obwohl das Datenmodell
(`users.grade`) längst pro Kind eine Klassenstufe vorsieht und in der Eltern-UI editierbar ist —
das Feld wird nur für die Coach-Chat-Anzeige gelesen, nicht für die Aufgabengenerierung. Mit dem
erweiterten Nutzungsszenario (mehrere Familien, beliebige Klassenstufen 5–10) wird das vom
kosmetischen Schönheitsfehler zum zentralen Blocker: Ohne dieses Fix generiert die App für ein
Kind der 8. Klasse dieselben Aufgaben wie für ein Kind der 5. Klasse. Zweitwichtigste Lücke:
kein sichtbarer Selbstbedienungsweg zum Löschen/Export der eigenen Familiendaten — bei einer App,
die potenziell fremde Familien nutzen, ist das kein Nice-to-have mehr. Bei Gamification empfehle
ich ausdrücklich **keine** Ranglisten oder sichtbaren Vergleiche zwischen Kindern (weder Geschwister
noch fremde Kinder) einzubauen — die Evidenz dazu ist eindeutig genug, um das jetzt aktiv zu
vermeiden, bevor es sich als Feature festsetzt.

## Annahmen

- Region/Kontext: Deutschland, Niedersachsen, Gymnasium, Klasse 5–10 als realistische Spannweite
  (aktuell: Zwillinge Klasse 6), potenziell weitere, nicht verwandte Familien als Nutzer derselben
  Installation oder eigener Instanzen.
- "Konkurrenz" wird zweigleisig verstanden: kommerzielle/Landes-Angebote (Kaufalternative) UND
  Open-Source-Selbsthost-Projekte (Baualternative) — beides wurde geprüft.
- Preise sind für Privatnutzung (Eltern zahlen selbst), Schullizenzen werden nur der Vollständigkeit
  halber genannt, da sie für eine private Ferienlern-App nicht direkt bezahlbar/zugänglich sind.

## Marktüberblick: relevante Anbieter

| Anbieter | Zielgruppe/Fächer | Geschäftsmodell & Preis (privat, Stand Aug. 2026) | Träger/Finanzierung | Schulzulassung/Landeslizenz |
|---|---|---|---|---|
| **[Anton](https://anton.app/de/)** | Kl. 1–10, alle Fächer, sehr breit; App-Optik eher jünger positioniert | Freemium. Kostenlos nutzbar (mit Werbung für Eltern-Ansicht/Zusatzfeatures gesperrt); **Anton Plus Einzel 9,99 €/Jahr, Familie 19,99 €/Jahr, Lehrer 39,99 €/Jahr** (App-Store-Angabe) | solocode GmbH (kommerziell), mitfinanziert über EFRE-Regionalförderung | Schullizenzen ab 500 €/Jahr; in mehreren Bundesländern im Schuleinsatz, aber keine bestätigte Landeslizenz Niedersachsen |
| **[sofatutor](https://www.sofatutor.com/)** | Kl. 1–13, Videokurse + Übungen + Hausaufgaben-Chat | Abo. Je nach Laufzeit **ca. 11,99–39,99 €/Monat**, Familienoption ca. 29,99 €/Monat für 2 Kinder | sofatutor GmbH (VC-finanziert) | Keine bekannte Landeslizenz |
| **[simpleclub](https://simpleclub.com/)** | Kl. 5–13 + Ausbildung; Ton/Design bewusst jugendlich (Gen-Z-Ansprache, Umgangssprache) | Abo. Regulär **16,49 €/Monat bzw. 89,99 €/Jahr**, häufig stark rabattiert (Erfahrungsberichte nennen Aktionspreise ab ~4–6 €/Monat) | simpleclub GmbH (VC-finanziert) | Keine bekannte Landeslizenz |
| **[bettermarks](https://de.bettermarks.com/)** | Kl. 4–11, **nur Mathematik**, adaptiv | Reine Schul-/Klassenlizenz, **~10,70 €/Schüler/Schuljahr**; **keine Einzellizenz für Eltern/Zuhause** | bettermarks GmbH | **Ja: Niedersachsen hat eine Landeslizenz über die Niedersächsische Bildungscloud (NBC)** — siehe eigener Abschnitt unten |
| **scoyo** | Kl. 1–7, Deutsch/Mathe/Englisch/Sachkunde | Abo (Bestandskunden), nach Übernahme durch Squla/Futurewhiz (NL) 2020 unklare Weiterentwicklung, Google-Play-Bewertung 3,6/5 (30.556 Bewertungen, Stand 09.06.2026) — wirkt gegenüber Anton/simpleclub deutlich weniger präsent im aktuellen Diskurs | Squla/Futurewhiz (NL) | Keine bekannte Landeslizenz |
| **[Duden Learnattack](https://www.learnattack.de/)** | Kl. 5–13, alle Fächer, Videos + KI-Tutor + Duden-Wörterbuch-Integration | Abo, drei Stufen zwischen **ca. 6–24 €/Monat** je nach Laufzeit/Funktionsumfang (Preisangaben in Quellen uneinheitlich, siehe Quellenkonflikt unten) | Cornelsen-Gruppe (Franz-Cornelsen-Stiftung) | Keine bekannte Landeslizenz |
| **[schlaukopf.de](https://www.schlaukopf.de/)** | Kl. 1–10, Quizfragen zu Schulbuchthemen | Werbefinanziert, kostenlos; Premium (werbefrei) **3,99 €/Monat bzw. 23,99 €/Jahr** | Privatprojekt, gemeinnützig positioniert | Keine |
| **Klett / Cornelsen / Westermann (Verlags-Apps)** | Kl. 1–13, an Schulbuchreihen gekoppelt | "Klett Lernen"/"Cornelsen Lernen"-Apps sind primär **digitale Begleiter zum gekauften Schulbuch** (eBook-Zugriff), kein eigenständiges Übungssystem; Westermann **OnlineDiagnose** (Kl. 5–11, Deutsch/Mathe/Englisch) ist ein reines **Diagnose-/Testtool für Lehrkräfte**, kein Kinder-Frontend | jeweiliger Verlag | Schulseitig, an Buchkauf gekoppelt |
| **Khan Academy (+ Khanmigo)** | International, sehr stark Mathe/Naturwissenschaft, Inhalte primär englischsprachig, deutsche Inhalte lückenhaft | Kernangebot kostenlos; Khanmigo (KI-Tutor) **~4 $/Monat bzw. 44 $/Jahr** für Familien, für Lehrkräfte kostenlos | Non-Profit (Khan Academy) | Keine in Deutschland |
| **Duolingo** | Sprachen, für Englisch als Zweitfach nutzbar | Kostenlos mit Werbung; **Super Duolingo ab 7,49 €/Monat (Einzel) bzw. ab 10,25 €/Monat (Familie, bis 6 Accounts)**. DSGVO: unter 16 Jahren ist Einwilligung der Eltern vorgesehen | Duolingo Inc. (börsennotiert) | Keine |
| **StudySmarter/Vaia, Studyly** | Eher Oberstufe/Studium (StudySmarter/Vaia) bzw. Österreich-Fokus mit Schulbuchbindung (Studyly, Klett-Kooperation) | Für Kl. 5/6 am deutschen Gymnasium kaum relevant, daher nicht vertieft | — | — |

**Wichtiger Quellenkonflikt:** Zu Duden Learnattack widersprechen sich die gefundenen Preisangaben
deutlich (13,74 €/Monat vs. 6–24 €/Monat je nach Stufe) — vermutlich Verwechslung von
Rabatt-/Regulärpreisen in den Sekundärquellen. Ich vertraue hier keiner der beiden Angaben ohne
Weiteres; die offizielle Preisseite (`learnattack.de/preise`) war über den Recherche-Proxy nicht
erreichbar. **Vor einer Kaufentscheidung dort direkt nachsehen.**

**scoyo:** Ich habe keine Quelle gefunden, die scoyo als "eingestellt" bestätigt — die App existiert
laut Play-Store-Daten weiter, wirkt aber im aktuellen Marktdiskurs 2025/26 deutlich weniger präsent
als Anton, simpleclub oder Learnattack. Behandle es als Nischenanbieter, nicht als Konkurrenz auf
Augenhöhe.

## Niedersachsen: Landeslizenzen / kostenfreie Schulangebote (Kontext-Update)

Relevant für die Frage "brauchen wir das überhaupt, wenn die Schule schon was stellt":

- **bettermarks ist in Niedersachsen als Landeslizenz kostenlos über die Niedersächsische
  Bildungscloud (NBC)** verfügbar — das Land hat dafür laut Kultusministerium **1,45 Mio. €**
  investiert, nutzbar für Jahrgang 4–11, Fach **nur Mathematik**.
  ([Nds. Kultusministerium](https://www.mk.niedersachsen.de/startseite/aktuelles/presseinformationen/10-punkte-agenda-lernen-mit-digitalen-medien-neues-mathematik-programm-bettermarks-kostenfrei-in-niedersachsischer-bildungscloud-nbc-197372.html),
  [DigitaleSchule.Niedersachsen](https://digitaleschule.niedersachsen.de/) — Fetch dieser Seite war
  blockiert, Inhalt nur über Suchindex bekannt)
- **Wichtige Einschränkung:** Zugriff läuft über die NBC, die **von der Schule aktiviert und
  Schülerkonten zugeteilt werden muss** — es ist kein Angebot, das Eltern direkt für ihr Kind
  freischalten können. Ob die konkrete Schule der Kinder das eingerichtet hat, ist offen (siehe
  "Offene Punkte").
- Eine Quelle nennt eine Befristung "bis Ende Schuljahr 2025/2026" für die bettermarks-Lizenz — ob
  sie für 2026/27 verlängert wurde, konnte ich nicht bestätigen.
- Für **Deutsch und Englisch** habe ich **keine** kostenfreie Niedersachsen-Landeslizenz einer
  vergleichbaren KI-/Übungsplattform gefunden. NiBiS (Niedersächsischer Bildungsserver) listet
  allgemeine kostenlose Dienste für Schulen, aber kein Pendant zu bettermarks für diese Fächer.
- **Einordnung:** Für Mathe existiert real eine kostenlose schulische Alternative — *wenn* die
  Schule sie eingerichtet hat. Für Deutsch/Englisch/allgemeine adaptive KI-Übungen mit
  Fehlererklärung gibt es in Niedersachsen kein kostenloses Landesangebot, das unser Produkt
  ersetzen würde.

## Open-Source-/Selbsthost-Alternativen (neu in den Scope aufgenommen)

Geprüft mit der Frage: löst das schon, was wir bauen — oder bauen wir ein gelöstes Problem neu?

| Projekt | Was es ist | Warum (nicht) Ersatz für unseren Ansatz |
|---|---|---|
| **[Serlo](https://de.serlo.org/)** | Gemeinnützige, werbefreie **OER-Lernplattform** (Kl. 5–13), 23.000+ Erklärungen, Übungsaufgaben mit Musterlösung, freie Lizenz | Kein Selbsthosting-Zweck (ist ein öffentlicher Dienst), **statischer, nicht personalisierter** Aufgabenpool, keine KI-Bewertung freier Antworten, keine Elternsicht/Zeitmodell. Eher **Ergänzung** (gute Erklärtexte verlinken) als Ersatz. |
| **[Kolibri](https://learningequality.org/kolibri/)** (Learning Equality) | Offline-first, selbsthostbare **Open-Source-Lernplattform** für Low-Resource-Kontexte, aggregiert Lerninhalte | Deutschsprachige, lehrplannahe Inhalte sind dünn; kein KI-Aufgaben-Generator, kein adaptives Feedback zu freien Antworten. Für den Zweck hier technisch möglich, inhaltlich unpassend. |
| **Moodle** | Klassisches Open-Source-LMS, selbstgehostet | Lehrkraft-/Kurs-zentriert, Inhalte müssen selbst erstellt/importiert werden, kein KI-generierter Aufgabenpool, hoher Administrationsaufwand für ein einzelnes Kind/eine Familie — massiver Overkill. |
| **Anki / AnkiDroid** (+ selbstgehosteter Sync-Server) | Freies, sehr ausgereiftes **Spaced-Repetition-System** für Karteikarten | Für **Vokabeltraining** tatsächlich eine ernstzunehmende, gut erprobte Alternative zur eigenen Vokabel-Box-Logik im Repo — aber nur für Vokabeln, kein Ersatz für generierte Grammatik-/Textaufgaben, keine kindgerechte Oberfläche/Belohnungslogik out of the box. |

**Fazit Eigenbau vs. OSS:** Kein geprüftes Projekt deckt die Kernkombination ab, die unser Repo
bereits hat — **KI-generierte, schwierigkeitsadaptive Aufgaben über mehrere Fächer mit freier
Texteingabe, sofortiger Bewertung *und* Erklärung bei Fehlern, in kindgerechter Oberfläche**. Der
Eigenbau ist inhaltlich gerechtfertigt. Die Vokabel-Spaced-Repetition ist der einzige Teilbereich,
in dem eine reife OSS-Alternative (Anki) existiert — dort lohnt sich der Eigenbau nur, weil er nahtlos
ins gleiche Zeit-/Belohnungsmodell integriert ist, nicht weil die Algorithmik selbst überlegen wäre.

## Feature-Baseline

### Must-have (fehlt bei keinem ernstzunehmenden Anbieter)
- **Sofortiges Feedback** (richtig/falsch direkt nach der Antwort, nicht erst am Tagesende)
- **Sichtbarer Fortschritt** (Balken/Ring/Prozent pro Fach oder Thema)
- **Themenauswahl nach Fach/Klassenstufe** — irgendeine Form von Einstufung nach Klasse/Schulform,
  sei es durch Elternauswahl (Anton, simpleclub, Learnattack) oder Diagnosetool (Westermann
  OnlineDiagnose, teils bettermarks). **Freie Wahl der Klassenstufe pro Kind ist Marktstandard**,
  keine Ausnahme.
- **Eltern-/Lehrer-Ansicht getrennt vom Kind-Zugang** (eigener Login/eigener Bereich)
- **Kostenlose Basisnutzung oder zumindest kostenloser Test** — reine Vollpreis-Paywall ohne
  Gratis-Einstieg konnte ich bei keinem der geprüften Anbieter finden

### Verbreiteter Standard (Mehrheit, nicht alle)
- **Adaptive Schwierigkeit** (Anton, bettermarks, simpleclub, Learnattack — ja; schlaukopf, reine
  Verlags-Apps — eher nein, dort ist es freie Auswahl statt Algorithmus)
- **Elternberichte/Statistik-Dashboard** (Anton Plus, sofatutor, simpleclub — ja, oft hinter Paywall)
- **Gamification light** (Punkte/Coins/Fortschrittsbalken) — praktisch überall vorhanden, in
  unterschiedlicher Intensität
- **Erklärung bei Fehlern statt nur "falsch"** — bei den geprüften Premium-Anbietern (Anton Plus,
  bettermarks, Learnattack, simpleclub) Standard; bei kostenlosen Quiz-Tools wie schlaukopf oft nur
  die richtige Lösung ohne Begründung
- **Datenschutzhinweise/Einwilligungsdialog beim Onboarding** — bei allen kommerziellen Anbietern
  vorhanden (Pflicht durch DSGVO bei Diensten, die planbar von Minderjährigen genutzt werden),
  aber die Tiefe schwankt stark; ein granularer **Selbstbedienungs-Datenexport/Konto-Löschen-Button**
  ist selbst bei den großen Anbietern nicht durchgängig sichtbar dokumentiert — eher
  "auf Anfrage per Support" als Self-Service-Feature.

### Differenzierung (hebt einzelne Anbieter ab)
- **KI-Tutor-Chat für Rückfragen** (Learnattack, simpleclub, Khanmigo) — noch nicht bei allen
- **Diagnose-/Einstufungstest vor Lernstart** (Westermann OnlineDiagnose als eigenständiges Produkt;
  bei den meisten Übungs-Apps *kein* separater Einstiegstest, sondern Einstufung per Klassenwahl +
  laufende Adaption)
- **Vorlesen/Spracherkennung als Übungsform** (bei uns vorhanden; bei den großen Playern selten
  explizit als Kernfeature beworben — eher Nischenfunktion)
- **Bildschirmzeit-Kopplung als Belohnung** (bei keinem der geprüften kommerziellen Anbieter
  gefunden — das ist im Markt eine echte Besonderheit unseres Repos, siehe iOS-Companion)
- **Landeslizenz/kostenlose Schulbereitstellung** (bettermarks in Niedersachsen — echter USP
  gegenüber allen Wettbewerbern, aber eben nur für Mathe und nur wenn die Schule mitspielt)

### Overrated (viel beworben, didaktisch schwach belegt)
- **Streaks als Haupt-Motivator**: Die Evidenzlage ist gespalten. Kurzfristig erhöhen Streaks
  Login-Häufigkeit nachweisbar (Duolingo-eigene Zahlen), aber mehrere unabhängige Quellen
  beschreiben Streaks explizit als **Verlustaversions-Mechanik**, die bei Kindern **Stress statt
  Motivation** erzeugt, sobald ein Tag verpasst wird — und die Lernwirkung selbst nicht steigert,
  sondern nur die App-Nutzung bindet. Das ist der Klassiker "Bindung ≠ Lernerfolg", vor dem der
  Auftrag explizit gewarnt hat.
  ([Screenwise: Duolingo Streaks and Anxiety](https://screenwiseapp.com/guides/duolingo-streaks-and-anxiety-in-kids) —
  Blog/Elternratgeber, keine Primärstudie, aber konsistent mit dem didaktischen Undermining-Effekt,
  den auch deutschsprachige Quellen zu Belohnungssystemen beschreiben)
- **Sichtbare Ranglisten/Klassenvergleiche** (bei Anton dokumentiert: Wettbewerb unter Mitschülern
  um Coins) — siehe eigenen Abschnitt unten, hier ist die Evidenz gegen den Nutzen deutlicher als
  bei Streaks.
- **Große Avatar-/Kosmetik-Ökonomien** (virtuelle Münzen für Skins etc.) — binden an die App, ohne
  dass ein Lerntransfer belegt ist; von Medienpädagog:innen wiederholt kritisiert (siehe Anton-Kritik
  unten), auch von den Anbietern selbst nur mit Verweis auf allgemeine Motivationsforschung
  verteidigt, nicht mit fachspezifischen Wirksamkeitsstudien.
- **Reine Trefferquoten-Prozentzahlen ohne Kontext** — suggerieren Präzision, sagen aber ohne
  Bezug zur Aufgabenschwierigkeit wenig aus; mehrere Anbieter zeigen sie prominent, ohne Einordnung.

## Sonderthema: Wettbewerb/Vergleich zwischen Kindern — klare Empfehlung

Das wurde im Auftragsverlauf zweimal verschärft: erst Zwillinge (gleicher Jahrgang, gleicher Stoff),
dann potenziell **fremde Familien auf derselben Installation**. Beides macht die Frage relevanter,
nicht weniger.

**Was die Recherche hergibt:**
- Entwicklungspsychologische Quellen zu Geschwistervergleichen sind eindeutig: Ein **sozialer
  Aufwärtsvergleich** (schlechter als das andere Kind abschneiden) senkt das
  Fähigkeitsselbstkonzept messbar, ein Abwärtsvergleich hebt es künstlich — in beiden Richtungen
  verzerrt es die Selbsteinschätzung weg vom tatsächlichen Lernstand.
  ([Zeitschrift für Entwicklungspsychologie](https://econtent.hogrefe.com/doi/10.1026/0049-8637.36.1.1) —
  Fachzeitschrift, höhere Verlässlichkeit)
- Bei **eineiigen Zwillingen** gibt es laut Hector-Institut-Forschung sogar einen gegenteiligen
  "Spiegeleffekt" (die Leistung des Zwillings wirkt angleichend statt kontrastierend) — das macht
  die Vorhersage bei echten Zwillingen zusätzlich unsicher, nicht sicherer.
- Zu **fremden Kindern auf derselben Plattform** (Klassenvergleich) liegt mit Anton eine
  dokumentierte Negativ-Erfahrung vor: Medienpädagog:innen und Eltern berichten öffentlich über
  Coin-Wettbewerb unter Mitschülern als Problem; Anton selbst hat **kein** globales Leaderboard
  eingebaut — ein Indiz, dass der Anbieter das bewusst vermeidet, obwohl die Coin-Ökonomie sonst
  recht sichtbar ist.
- Duolingo geht den entgegengesetzten Weg (Freundes-Streaks, Ligen) und wird dafür in
  Eltern-/Medienratgebern wiederholt kritisiert; die eigene Empfehlung dort lautet inzwischen,
  Kindern zu erlauben, ihr Profil auf "privat" zu stellen, um aus Ligen auszusteigen.

**Empfehlung:** Kein sichtbares Ranking, kein direkter Vergleich der Leistungswerte zwischen
Kindern — weder zwischen den Zwillingen noch (falls die Installation von mehreren Familien genutzt
wird) zwischen fremden Kindern. Konkret für unser Repo:
- **Beibehalten, was schon so ist:** Der Kind-Bereich zeigt heute ausschließlich die eigenen Daten
  (`KidToday.tsx`, `KidPath.tsx` etc. — keine Fremd-/Geschwisterdaten im Kid-UI gefunden). Das ist
  bereits die richtige Grundhaltung, **aktiv so belassen**, nicht "verbessern".
- **Streak-Mechanik entschärfen statt ausbauen:** `currentStreak()` in `src/lib/db/repo.ts` ist
  aktuell hart — ein ausgelassener Tag setzt auf 0 zurück, keine Gnadenfrist. Bei zwei Kindern im
  selben Haushalt ist ein asymmetrisch gebrochener Streak (eins krank, das andere nicht) ein
  vorhersehbarer Reibungspunkt. Eine "Streak-Freeze" o. Ä. (ein Fehltag pro Woche ohne Reset) würde
  laut der oben zitierten Kritik eher schützen als die Motivation schwächen.
  Kein Muss, aber eine günstige Verbesserung, kein neues Rankingfeature.
- **Elternsicht bleibt ok wie sie ist:** Dass Eltern im `ParentProgress.tsx` zwischen Kindern
  umschalten können (Dropdown), ist unproblematisch, weil es **nicht** kindsichtbar ist. Wichtig ist
  nur, es bei einer Ansicht zu belassen, die man bewusst wechselt — **keine** Seite-an-Seite-
  Vergleichstabelle beider Kinder einbauen, auch nicht für Eltern, weil sie zum unbeabsichtigten
  Aussprechen von Vergleichen ("dein Bruder ist schon weiter") einlädt, was laut Forschung Rivalität
  eher verschärft als informiert.

## Lückenanalyse gegen das Repo

| Feature (Baseline-Einstufung) | Status im Repo heute | Bewertung für unseren Fall |
|---|---|---|
| Sofortiges Feedback (Must-have) | Vorhanden, lokal ohne KI-Latenz für getippte Antworten (`localGrade.ts`) | Erfüllt, sogar besser als viele Wettbewerber (kein Warten) |
| Adaptive Schwierigkeit (Standard) | Vorhanden, pro Kind & Thema, performanzbasiert (`nextDifficulty()` in `exercises.ts`) | Erfüllt |
| Erklärung bei Fehlern statt nur "falsch" (Standard) | Vorhanden (`solutionExplanation`/`correction` in Prompts) | Erfüllt |
| Elternbereich getrennt vom Kind (Must-have) | Vorhanden, PIN-geschützt | Erfüllt |
| **Freie Klassenstufen-Wahl wirkt sich auf Inhalt aus (Must-have, verschärft durch neuen Scope)** | **Nicht erfüllt.** `users.grade` existiert und ist in der Eltern-UI editierbar, wird aber **nirgends** in die Aufgaben-Generierungs-Prompts (`TUTOR_BASE`) übernommen — dort steht hart codiert "5. Klasse Gymnasium". Nur der Eltern-Coach-Chat liest `grade` zur Anzeige. | **Höchste Priorität.** Ohne Fix ist "beliebige Klassenstufe pro Kind" nur eine UI-Attrappe. Muss vor Nutzung durch andere Familien/Klassenstufen behoben werden. |
| Mehrere Familien / Mandantentrennung (jetzt Must-have durch Scope-Erweiterung) | **Grundlage vorhanden**: eigene `families`-Tabelle, `users.family_id`, Login getrennt, `family_topic_prefs` für Themen-Ein/Aus pro Familie. Zugang läuft über ein **einzelnes geteiltes** `LEARN_INVITE_CODE` ohne Ablauf/Widerruf pro Einladung. | Für einen kleinen, bekannten Kreis (Familie + Freunde) ausreichend. Für "beliebige fremde Familien" fehlt: Einladungscode pro Familie mit Ablaufdatum, Admin-Übersicht über registrierte Familien, Möglichkeit, eine Familie zu sperren/löschen. Mittlere Priorität — erst relevant, wenn tatsächlich fremde Familien angebunden werden sollen. |
| Selbstbedienungs-Datenlöschung/-export (neu: Standard bei kommerziellen Anbietern, Erwartung bei fremden Nutzern) | **Nicht vorhanden.** Keine Route/UI zum Löschen der eigenen Familie oder Export der eigenen Daten gefunden. | Solange nur die eigene Familie die App nutzt: irrelevant (Zugriff auf die SQLite-Datei genügt). Sobald fremde Familien Daten einspeisen: **wird zur Erwartung**, bevor man die App weitergibt. |
| Diagnose-/Einstufungstest vor Lernstart (Differenzierung, nicht Must-have) | Nicht vorhanden; Start bei Schwierigkeit 2/5, dann laufende Adaption | Für den Ferien-Kontext (wenige Minuten/Tag, kurze Zeiträume) ist ein separater Einstufungstest eher **Overhead** als Nutzen — die laufende Adaption konvergiert schnell genug. Niedrige Priorität, **nicht** nachbauen, nur weil Wettbewerber es haben. |
| Bildschirmzeit-Kopplung als Belohnung (Differenzierung) | Vorhanden (iOS-Companion + `/api/rewards/screentime`) — am Markt eine echte Seltenheit | Bereits Alleinstellungsmerkmal, kein Handlungsbedarf |
| Sichtbare Ranglisten/Klassenvergleich (Overrated bis riskant) | **Nicht vorhanden** — bewusst so lassen | Kein Gap, sondern ein Punkt, den man aktiv **nicht** baut (siehe Sonderthema oben) |
| Streak-"Gnadenfrist" (kleiner Standard-Baustein, den strengere Anbieter zunehmend einbauen) | Nicht vorhanden, harter Reset auf 0 | Niedrige, aber günstige Priorität — siehe Sonderthema |
| Barrierefreiheit: Vorlesen der *Aufgaben* (Text-to-Speech) | Nicht vorhanden — die App hat nur Spracherkennung (Kind liest vor, KI bewertet), keine Sprachausgabe der Aufgabenstellung | Für den aktuellen Nutzerkreis (keine bekannte Leseschwäche) niedrige Priorität; würde aber die Zugänglichkeit für ein drittes, potenziell lese-schwächeres Kind (fremde Familie) deutlich erhöhen — Kosten-Nutzen günstig, da Web Speech API bereits im Einsatz ist (nur Synthese statt Erkennung zusätzlich) |

## Fallstricke & Risiken

- **Hardcodierte Klassenstufe im Prompt ist der größte Einzelrisiko-Punkt für den erweiterten
  Scope.** Wird die App an andere Familien/Klassenstufen weitergegeben, ohne dass dieser Fix
  passiert, bekommen ältere/jüngere Kinder systematisch falsch kalibrierte Aufgaben — das fällt
  nicht sofort auf, weil die App trotzdem "funktioniert", nur didaktisch daneben liegt.
- **Geteilter Einladungscode ohne Ablauf/Widerruf** ist für "ein paar bekannte Familien" ok, aber
  ein einzelnes Leck (Code wird weitergegeben) lässt sich aktuell nur durch Ändern der Env-Variable
  für **alle** beheben, nicht selektiv für eine Familie.
- **Anthropic-API-Kosten skalieren mit Nutzerzahl.** Bei "beliebig vielen Familien" ist Pay-per-
  Token kein Fixkostenmodell mehr — für den eigenen Gebrauch vernachlässigbar, für einen größeren
  Nutzerkreis ein Budget-Thema, das vorher beziffert werden sollte (nicht Teil dieser Recherche,
  aber als Warnschild wichtig).
- **bettermarks-Landeslizenz Niedersachsen**: Befristung/Verlängerung für 2026/27 nicht bestätigt,
  und Nutzung hängt von Aktivierung durch die Schule ab — als Argument "die Schule deckt das schon
  ab" nicht ungeprüft übernehmen.
- **Streak-Design**: aktueller Hard-Reset auf 0 steht im Widerspruch zur eigenen Absicht "wenige
  Minuten täglich, entspannt" — genau die Nutzergruppe, bei der ein verpasster Ferientag (Ausflug,
  Krankheit) normal ist, wird von der Mechanik am härtesten bestraft.
- **Quellenzugriff eingeschränkt**: Mehrere Primärquellen (anton.app, sofatutor.com, trusted.de,
  de.bettermarks.com, learnattack.de, lernmarktplatz.de) waren über den Recherche-Proxy blockiert;
  alle Preisangaben zu diesen Anbietern stammen aus Sekundärquellen (App-Store-Metadaten, Presse,
  Testportale) und sollten vor einer echten Kaufentscheidung auf der Originalseite verifiziert
  werden.

## Quellen

- [Anton App – App Store Preisangaben (in-app purchases)](https://apps.apple.com/de/app/anton-schule-lernen/id1180554775) — Hersteller/App-Store, abgerufen 15.08.2026
- [Anton (Lernsoftware) – Wikipedia](https://de.wikipedia.org/wiki/Anton_(Lernsoftware)) — Hintergrund, abgerufen 15.08.2026
- [NZZ: Gamifizierung in der Schule – Lern-App Anton sorgt für Ärger](https://www.nzz.ch/schweiz/dopaminkicks-im-unterricht-die-lern-app-anton-bringt-kinder-zum-rechnen-und-lesen-und-verleitet-sie-gleichzeitig-zum-gamen-ld.1921244) — unabhängiger Journalismus, Negativ-Recherche
- [Check-App: Anton App Kritik – Macht sie Kinder süchtig?](https://www.check-app.de/2026/03/03/anton-app-kritik-macht-sie-kinder-suechtig/) — Kritik-Zusammenfassung
- [datenschutz-notizen.de: Sicherheitslücke bei Anton](https://www.datenschutz-notizen.de/massive-sicherheitsluecke-bei-lern-app-anton-3829341/) — Negativ-Recherche Datenschutz
- [sofatutor Kosten – letsbecrazy.de](https://letsbecrazy.de/sofatutor-kosten/) — Testportal (Inhalt nur über Suchindex, Direktzugriff blockiert)
- [simpleclub Preise – offizielle Kaufseite](https://simpleclub.com/purchase/product-select-unlimited-and-unlimited-plus) — Hersteller
- [simpleclub – Wikipedia (Zielgruppe/Positionierung)](https://de.wikipedia.org/wiki/Simpleclub)
- [bettermarks Preise](https://de.bettermarks.com/preise/) — Hersteller (Inhalt nur über Suchindex)
- [Nds. Kultusministerium: bettermarks kostenfrei in der NBC](https://www.mk.niedersachsen.de/startseite/aktuelles/presseinformationen/10-punkte-agenda-lernen-mit-digitalen-medien-neues-mathematik-programm-bettermarks-kostenfrei-in-niedersachsischer-bildungscloud-nbc-197372.html) — Primärquelle, Behörde
- [DigitaleSchule.Niedersachsen: bettermarks in der Bildungscloud](https://digitaleschule.niedersachsen.de/startseite/zusatzvereinbarungen/digitaler_content/bettermarks-in-der-bildungscloud-197351.html) — Primärquelle Land Niedersachsen (nur Suchindex)
- [de.bettermarks.com/nbc](https://de.bettermarks.com/nbc/) — Hersteller zur NBC-Kooperation
- [NiBiS – Niedersächsischer Bildungsserver](https://www.nibis.de/) — Landesangebot
- [Duden Learnattack – Preise](https://learnattack.de/preise) — Hersteller (Inhalt nur über Suchindex, widersprüchliche Sekundärangaben)
- [Cornelsen Gruppe – Learnattack Trägerschaft](https://www.cornelsen.de/karriere/cornelsen-gruppe) — Hersteller/Konzern
- [Schlaukopf.de – Das Projekt](https://www.schlaukopf.de/seiten/projekt.php) — Hersteller, Geschäftsmodell
- [Scoyo – Wikipedia](https://de.wikipedia.org/wiki/Scoyo) — Hintergrund/Trägerschaft
- [Westermann OnlineDiagnose](https://onlinediagnose.westermann.de/) — Hersteller, Diagnostik-Tool
- [Klett Lernen App](https://www.klett.de/inhalt/klett-lernen/158307) — Hersteller
- [Cornelsen Lernen App](https://www.cornelsen.de/apps) — Hersteller
- [Khan Academy / Khanmigo Preise 2026](https://blog.khanacademy.org/?p=21198) — Hersteller-Blog
- [Duolingo Kosten 2026 – Sprachen-Mentor](https://sprachen-mentor.de/resourcen/sprachlern-apps/duolingo-kosten-2026-gratis-vs-super-vs-max) — Testportal
- [Duolingo Streaks and the 'Loss Aversion' Trap: A Parent's Guide – Screenwise](https://screenwiseapp.com/guides/duolingo-streaks-and-anxiety-in-kids) — Eltern-/Medienratgeber, Negativ-Recherche Gamification
- [Serlo – Über uns](https://de.serlo.org/serlo) — Hersteller/gemeinnütziger Träger
- [Kolibri – Learning Equality](https://learningequality.org/kolibri/about-kolibri/) — Hersteller/Open-Source-Projekt
- [Zeitschrift für Entwicklungspsychologie und Pädagogische Psychologie: Vergleichsprozesse und Fähigkeitsselbstkonzept](https://econtent.hogrefe.com/doi/10.1026/0049-8637.36.1.1) — Fachzeitschrift, zu sozialen Vergleichseffekten bei Kindern
- [bildungsklick.de: Studie zum schulischen Selbstkonzept bei (Zwillings-)Vergleichen](https://bildungsklick.de/schule/detail/studie-bringt-neue-erkenntnisse-zum-schulischen-selbstkonzept-von-jugendlichen) — Fachbericht, Hector-Institut
- [Psychology Today: Sibling Rivalry Shouldn't Hurt](https://www.psychologytoday.com/us/blog/the-science-of-siblings/202507/sibling-rivalry-shouldnt-hurt) — Fachjournalismus, Psychologie

## Offene Punkte

- **Learnattack-Preise**: uneinheitliche Sekundärangaben, nicht abschließend geklärt — offizielle
  Preisseite direkt prüfen (Proxy blockierte den Zugriff).
- **bettermarks-Lizenz Niedersachsen für Schuljahr 2026/27**: Verlängerung nicht bestätigt, und ob
  die konkrete Schule der Kinder die NBC/bettermarks überhaupt aktiviert hat, ist nicht Teil dieser
  Recherche — direkt bei der Schule/den Lehrkräften erfragen, das entscheidet, ob "Mathe ist über
  die Schule eh kostenlos abgedeckt" tatsächlich zutrifft.
- **Anton Plus Elternpaket/Landeslizenz** für Niedersachsen: nicht gezielt geprüft, da Anton für den
  eigenen Anwendungsfall (Deutsch/Mathe/Englisch mit KI-Erklärung) ohnehin kein 1:1-Ersatz ist —
  bei Bedarf gesondert klären.
- **Tatsächliche Nutzungserlaubnis/Lizenzfragen**, falls die App wirklich an fremde Familien
  weitergegeben wird (z. B. Anthropic-API-Nutzungsbedingungen bei Weitergabe an Dritte, Haftung für
  KI-generierte Lerninhalte) — das ist eine rechtliche Frage, für die auf eine Fachperson verwiesen
  werden sollte, nicht Teil dieser Recherche.
- Mehrere Primärquellen waren über den Recherche-Proxy nicht direkt abrufbar (anton.app,
  sofatutor.com, trusted.de, de.bettermarks.com, learnattack.de, lernmarktplatz.de,
  bildungsportal-niedersachsen.de) — alle daraus abgeleiteten Zahlen sind über Suchindex-Snippets
  entstanden, nicht durch direktes Lesen der Seite. Mit normalem Browser-Zugriff ließen sich diese
  in wenigen Minuten verifizieren.
