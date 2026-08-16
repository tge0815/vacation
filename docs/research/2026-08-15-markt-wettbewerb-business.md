# Markt- und Wettbewerbsanalyse: KI-Lern-App im deutschen K-12-Markt als Unternehmen

Stand: 2026-08-15. Auftrag: Prüfung, ob aus dem "Ferien-Lerncoach" ein Unternehmen werden kann.
Alle Zahlen sind Momentaufnahmen mit Abrufdatum; Herkunft (Hersteller/unabhängig/Nutzerbericht/
Schätzung) ist bei jeder Zahl gekennzeichnet.

## Vorbemerkung: Ist die Frage richtig gestellt?

Die im Auftrag zentral gesetzte Frage — "ist KI-generierte Aufgabengenerierung 2026 noch ein
Alleinstellungsmerkmal" — ist wichtig, aber sie ist **nicht die Frage, die über Erfolg oder Misserfolg
entscheidet**. Die Recherche zeigt einen Markt, der weniger an Technologie-Differenzierung hängt als an
**Vertrieb, Content-Trägheit und Vertrauen** — Anton ist kostenlos und marktführend mit einer
vergleichsweise simplen Aufgaben-Engine, während technisch avancierte, VC-finanzierte Anbieter
(GoStudent) trotz Einhorn-Bewertung massive Wertverluste hinnehmen mussten. Die eigentlich
unternehmerisch entscheidende Frage lautet daher eher: *über welchen Kanal und in welcher Nische kann
ein Neuling ohne Marke, ohne Content-Bibliothek und ohne Kapital in einem Markt bestehen, der sich
gerade auf wenige Anbieter konsolidiert?* Die folgende Recherche beantwortet beide Fragen, gewichtet
aber Abschnitt 4 (Vertriebswege) und 7 (Lücke) am Ende stärker als Abschnitt 6 (Technologie).

## Empfehlung

**Nicht als breiter B2C-Angriff auf Anton/simpleclub/sofatutor starten.** Der deutsche Markt für
schulbegleitendes digitales Lernen ist klein (SAM realistisch 250–450 Mio. €/Jahr, siehe Herleitung),
hart umkämpft von einem kostenlosen, gut finanzierten Platzhirsch (Anton) und zwei profitablen bis
wachstumsstarken VC-Playern (simpleclub, sofatutor), und die GenAI-Chat-Tutor-Funktion, die als unser
Kern gedacht war, ist bei allen großen Anbietern bereits nachgezogen worden (Cornelsen/Learnattack Kim,
simpleclub AI-Tutor, Khanmigo, Duolingo Max) — **als Chat-Schicht über einem kuratierten Aufgabenpool,
nicht als vollständige Laufzeit-Generierung inkl. lokaler Bewertung**. Genau dort, in der vollständigen
LLM-Generierung mit sofortiger lokaler Bewertung, liegt die einzige verifizierte technische Lücke der
großen Anbieter — aber sie ist bereits von mindestens einem kleinen deutschen Startup (Wunschlern) besetzt,
und ein zweites (Tutel) fährt einen sehr ähnlichen KI-Tutor-Ansatz. Ein realistischer Weg zum Unternehmen
führt über eine **eng geschnittene, unterversorgte Nische mit direktem Elternzugang** (Kandidaten in
Abschnitt 7) statt über einen Frontalangriff auf den breiten Markt, und über **organisches/Content-
getriebenes Wachstum statt bezahlte Akquise**, weil die CAC-Ökonomie bei einem kostenlosen
Hauptwettbewerber strukturell gegen zahlungspflichtige Neueinsteiger arbeitet. Landeslizenzen sind ein
verlockender, aber für einen Neuling in absehbarer Zeit kaum erreichbarer Kanal (siehe Abschnitt 4).

## Annahmen

- Fokus Sekundarstufe I (Klassen 5–10), da dort heute das Produkt ansetzt und dort die Nachhilfe-
  Nachfrage am größten ist; Grundschule und Oberstufe werden nur zur Einordnung der Gesamtmarktgröße
  gestreift.
- "Unternehmen" wird als eigenständiges, potenziell VC- oder bootstrap-finanziertes Geschäft verstanden,
  nicht als Lizenzverkauf des bestehenden Codes an eine bestehende Firma — dafür läge die Antwort anders.
- Region: Deutschland. DACH-weite Expansion (Österreich/Schweiz) wird nur am Rande erwähnt, wo Wettbewerber
  (GoStudent, Tutel) dort aktiv sind.

---

## 1. Marktgröße mit Herleitung

### 1.1 Eingangszahlen (jede einzeln bestreitbar)

| Nr. | Zahl | Wert | Quelle | Jahr | Art |
|---|---|---|---|---|---|
| A | Schüler:innen Sekundarstufe I, Deutschland | **4,4 Mio.** | [KMK/Bildungsministerkonferenz – Vorausberechnung Schüler:innen und Absolvierende 2023–2035](https://www.kmk.org/fileadmin/Dateien/pdf/Statistik/Dokumentationen/Dok_242_Vorausberechnung_Schueler_Abs_2023_2035.pdf) | 2023 | Behörde/Primärquelle (über Suchindex referenziert) |
| B | Schüler:innen gesamt (allgemeinbildend + beruflich), Deutschland | **11,5 Mio.** | [Destatis Pressemitteilung](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/03/PD26_081_211.html) | Schuljahr 2025/26 | Behörde/Primärquelle |
| C | Anteil Schüler:innen (6–16 J.) mit bezahlter oder kostenloser Nachhilfe | **14 %** | [Bertelsmann Stiftung/Infratest dimap](https://www.bertelsmann-stiftung.de/de/themen/aktuelle-meldungen/2016/januar/eltern-geben-jaehrlich-rund-900-millionen-euro-fuer-nachhilfe-aus) | Erhebung 2015, publiziert 2016 | Unabhängige Studie — **veraltet, 10 Jahre alt** |
| C' | Anteil Familien, die bereits bezahlte Nachhilfe genutzt haben | **22 %** | [Forsa-Umfrage im Auftrag Studienkreis](https://www.studienkreis.de/unternehmen/presse/pressemitteilungen/pressemitteilungen-2024/unterstuetzung-beim-lernen/) | 2023/24 | Unabhängig erhoben, aber Auftraggeber ist Marktteilnehmer (Studienkreis) — Vorsicht bei Interpretation |
| D | Jährliche Gesamtausgaben für private Nachhilfe, Deutschland | **879 Mio. €** (andere Quellen bis 1,4 Mrd. €) | [Bertelsmann Stiftung](https://www.bertelsmann-stiftung.de/de/themen/aktuelle-meldungen/2016/januar/eltern-geben-jaehrlich-rund-900-millionen-euro-fuer-nachhilfe-aus) | 2015/2016 | Unabhängige Studie — **veraltet** |
| E | Ausgaben pro Kind und Jahr für Nachhilfe | **750–1.550 €** | dieselbe Bertelsmann-Studie | 2015/2016 | Unabhängige Studie — **veraltet** |
| F | Umsatz Online-Nachhilfemarkt Deutschland | **~743 Mio. US-$ (≈ 680 Mio. €)** | [WiseGuyReports Marktstudie](https://www.wiseguyreports.com/de/reports/tutoring-online-market) | 2024, Prognose bis 2030 | Kommerzielle Marktforschung — **Schätzung, Methodik nicht einsehbar, mit Vorsicht behandeln** |
| G | Umsatz Studienkreis + Schülerhilfe (die zwei größten stationären Institute) | **150 Mio. €**, ca. 15 % Marktanteil, 2.000 Filialen | [Superprof-Blog unter Berufung auf Marktdaten](https://www.superprof.de/blog/private-nachhilfe-boomt/) | undatiert, vermutlich 2016–2020 | Sekundärquelle, Datierung unsicher |
| H | EdTech-Gesamtmarkt Deutschland (alle Bildungsstufen inkl. Hochschule/Weiterbildung) | 5,57 Mrd. US-$ (2021) → 14,75 Mrd. US-$ (Prognose 2026) | [ResearchAndMarkets](https://www.researchandmarkets.com/reports/5670473/germany-edtech-market-summary-competitive) | 2021/Prognose | Kommerzielle Marktforschung — **sehr hohe Wachstumsrate (21,5 % p.a.) wirkt optimistisch, Hochschulsegment macht 55 % aus, für K-12 nicht direkt nutzbar** |

**Wichtiger Befund vorweg:** Die einzige seriöse unabhängige Primärstudie zu privaten Nachhilfeausgaben
in Deutschland, die sich in dieser Recherche finden ließ (Bertelsmann/Infratest dimap), ist **zehn Jahre
alt**. Eine neuere, methodisch vergleichbare Wiederholungsstudie mit Euro-Beträgen wurde nicht gefunden
— die 2023/24-Forsa-Umfrage (Auftraggeber: Studienkreis) nennt nur Prozentanteile, keine Euro-Summen.
Alle folgenden Euro-Hochrechnungen sind entsprechend mit einer **groben Unsicherheitsspanne** zu lesen,
nicht als belastbare Punktschätzung.

### 1.2 TAM — Total Addressable Market

**Definition:** Alle Ausgaben deutscher Eltern für schulbegleitendes Lernen (Nachhilfe *und* digitale
Lernangebote) für Kinder in der Sekundarstufe I.

Rechnung (eigene Herleitung, Bausteine A, C, E, F):

- 4,4 Mio. Schüler:innen Sek. I (A) × 14 % Nachhilfequote (C, veraltet) ≈ **616.000 Kinder** mit
  Nachhilfe/Lernförderung
- × durchschnittlich ca. 1.000 €/Jahr (Mittelwert der Spanne 750–1.550 €, E) ≈ **~616 Mio. €** allein für
  klassische (überwiegend Offline-)Nachhilfe in Sek. I
- Plus digitale Lernangebote: Der Online-Nachhilfe/EdTech-B2C-Markt Deutschland wird mit ~680 Mio. €
  beziffert (F, alle Altersstufen). Skaliert auf den Sek.-I-Anteil an allen Schüler:innen (4,4/11,5 ≈ 38 %)
  ergibt das **~260 Mio. €** anteilig auf Sek. I entfallende digitale Ausgaben — mit deutlicher
  Überschneidung zu den 616 Mio. € oben (viele digitale Nachhilfeangebote *sind* die "Online-Nachhilfe"
  aus Zahl F).

**TAM (bereinigt um Doppelzählung, grobe Bandbreite):** **~700–950 Mio. €/Jahr** für schulbegleitendes
Lernen (Nachhilfe + digitale Lernangebote) in der Sekundarstufe I in Deutschland. Das ist eine
**eigene Schätzung** auf Basis der obigen Einzelquellen, keine Zahl, die so in einer Quelle steht — jede
der Eingangsannahmen (v. a. C und E, beide 10 Jahre alt) lässt sich einzeln anzweifeln und würde die
Summe leicht um ±30–50 % verschieben.

### 1.3 SAM — Serviceable Addressable Market

**Definition:** Der Teil des TAM, den eine digitale Lern-App realistisch adressieren kann — also nicht
1:1-Präsenznachhilfe (Studienkreis, private Nachhilfelehrer), sondern Abo-/App-basierte digitale Angebote.

- Aus TAM herausgerechnet: der stationäre Institutsanteil (G: Studienkreis+Schülerhilfe allein 150 Mio. €,
  Marktanteil Institute insgesamt laut Superprof-Quelle ~30 % des Gesamtmarkts) sowie individueller
  1:1-Privatunterricht (laut Bertelsmann-Studie der größte Einzelposten der 750–1.550 €/Kind).
- Verbleibend: der App-/Abo-/Plattform-Markt, den Anbieter wie Anton, simpleclub, sofatutor, Learnattack,
  bettermarks, Tutel, Wunschlern adressieren.

**SAM (eigene Schätzung):** **250–450 Mio. €/Jahr** für digitale, App-basierte Lernangebote Sek. I in
Deutschland. Das deckt sich größenordnungsmäßig mit Zahl F (260 Mio. € anteilig Sek. I aus dem
Online-Nachhilfemarkt), plus einem Aufschlag für den Teil des Marktes, der nicht als "Nachhilfe" markiert
wird, sondern als reine Übungs-/Gamification-App (Anton, Learnattack-Abo ohne 1:1-Tutoring).

### 1.4 SOM — Serviceable Obtainable Market

**Definition:** Was ein neuer, kapitalschwacher Anbieter in einem realistischen Zeithorizont (3–5 Jahre)
tatsächlich erobern kann, gegen einen kostenlosen Marktführer (Anton) und zwei etablierte VC-finanzierte
Player mit Millionen-Nutzerzahlen (simpleclub: 2 Mio. monatliche Nutzer, sofatutor: 26,1 Mio. € Umsatz
2021).

Bottom-up-Rechnung über Zahlkunden statt Marktanteil (robuster als ein %-Anteil vom SAM):

- Realistisches Ziel Jahr 3–5 für einen Nischenanbieter ohne Millionenmarketing: **5.000–20.000 zahlende
  Familien**
- Bei einem Preis vergleichbar zu Anton Plus/schlaukopf-Premium (**~20–60 €/Jahr pro Familie**, siehe
  bestehende Marktanalyse `2026-08-15-marktanalyse-lernapps.md`) oder einem Premium-Nischenpreis
  (**~100–150 €/Jahr**, näher an simpleclub/Learnattack-Niveau, wenn die Nische einen höheren
  Zahlungswillen hat, z. B. Förderbedarf)

**SOM (eigene Schätzung): ~150.000–2.000.000 € ARR** im realistischen Zielkorridor, abhängig stark von
Preispunkt und ob die Nische eng oder breit geschnitten wird. Das ist **deutlich unter der
Venture-Capital-Schwelle**, für die üblicherweise ein SAM im hohen zweistelligen bis dreistelligen
Millionenbereich und eine realistische Perspektive auf 20–50 Mio. € ARR erwartet wird. Für ein
bootstrapped/Lifestyle-Business oder eine kleine Seed-Finanzierung ist die Größenordnung dagegen
plausibel.

**Konsequenz für die Entscheidung:** Wer auf ein VC-finanziertes Wachstumsunternehmen zielt, muss entweder
(a) den SAM durch Internationalisierung (DACH, dann englischsprachige Märkte) vervielfachen, oder
(b) horizontal in Nachbarmärkte expandieren (Ausbildung/Berufsschule wie simpleclub, Erwachsenen-
Weiterbildung), oder (c) über B2B2C/Landeslizenzen den Kanal ändern (Abschnitt 4) — der reine B2C-Sek.-I-
Kernmarkt in Deutschland allein trägt kein Einhorn.

---

## 2. Wettbewerbslandschaft mit harten Zahlen

| Anbieter | Trägerschaft | Umsatz/Kennzahl | Finanzierung/Investoren | Nutzerzahlen | Quelle & Datierung |
|---|---|---|---|---|---|
| **Anton** | solocode GmbH (Berlin), 2 Geschäftsführer, 7 Gesellschafter, Stammkapital 25.000 € | **Nicht ermittelbar** — Northdata/Bundesanzeiger-Direktzugriff war über den Proxy blockiert, keine Umsatzzahl in Sekundärquellen gefunden | Mitfinanziert über **EFRE-Regionalförderung** (EU); keine VC-Finanzierungsrunde gefunden — wirkt eher öffentlich-gefördert/bootstrapped als klassisch VC-finanziert | Nicht mit harter Zahl belegt; in Presse als "eine der bekanntesten Lernplattformen" beschrieben, App-Store-Bewertungen sehr hoch (siehe vorherige Marktanalyse) | [Northdata-Registereintrag](https://www.northdata.com/?id=2430985013) (nur Struktur, keine Finanzzahlen zugänglich), abgerufen 15.08.2026 |
| **sofatutor** | sofatutor GmbH (Berlin) | **26,1 Mio. € Umsatz (2021)**, davor 19,4 Mio. € (2020), +34,8 % Wachstum; 149 Mitarbeiter (2021, Vorjahr 123) | VC-finanziert, u. a. **Emeram Capital**, **Gimv** (Investmentgesellschaft, ~2,0 Mrd. € verwaltetes Vermögen, 55 Portfoliounternehmen) | Keine harte Nutzerzahl gefunden | [deutsche-startups.de Zahlencheck](https://www.deutsche-startups.de/2023/07/03/sofatutor-zahlencheck-2021/), Bericht 2023 über Zahlen 2021 — **keine aktuelleren Zahlen (2022–2025) gefunden, Lücke von 3–4 Jahren** |
| **simpleclub** | simpleclub GmbH (Grünwald, vormals Köln), Gründer Alexander Giesecke & Nicolai Schork | Bilanzsumme 2022 laut Implisense **~3 Mio. €** (keine Umsatzzahl); B2B-Umsatz laut Eigenaussage 2022 "kaum vorhanden", 2023 "siebenstellig" | Gesamtfinanzierung **~16,6 Mio. US-$ über 4 Runden**, u. a. **HV Capital, 10x Founders**, Mai 2024 Runde im mittleren einstelligen Millionenbereich; auch deutsche Familienunternehmen investiert (2023) | **>2 Mio. monatliche Nutzer** (Schüler:innen + Azubis), 450+ Firmenkunden im B2B-Bereich (Deutsche Bahn, Sparkasse, IHK u. a.) | [simpleclub Presse/Erfolgsgeschichten](https://simpleclub.com/erfolgsgeschichten), [deutsche-startups.de](https://www.deutsche-startups.de/2022/10/04/simpleclub-edtech-pivot/) — Herstellerangaben, abgerufen 15.08.2026 |
| **bettermarks** | bettermarks GmbH (Berlin), GF Arndt Kwiatkowski & Marianne Voigt, Stammkapital 161.050 € | Nicht ermittelbar (Northdata blockiert) | Öffentliche Förderung von **1.127.720 €** für ein Projekt zur Integration in die Nationale Bildungsplattform (laut Northdata-Snippet) | Landeslizenzen in mind. **Niedersachsen** (1,45 Mio. € Landesinvestition, Kl. 4–11) und **Rheinland-Pfalz** (Landeslizenz seit Sept. 2020, mehrfach verlängert bis mind. Aug. 2025) | [Nds. Kultusministerium](https://www.mk.niedersachsen.de/startseite/aktuelles/presseinformationen/10-punkte-agenda-lernen-mit-digitalen-medien-neues-mathematik-programm-bettermarks-kostenfrei-in-niedersachsischer-bildungscloud-nbc-197372.html), [Ausschreibung Koblenz 2023](https://ausschreibungen-deutschland.de/1997200_Weiternutzung_der_Landeslizenz_fuer_die_Lernsoftware_Bettermarks_Referenznummer_der_2023_Koblenz) (nur Titel/Snippet zugänglich, Fetch blockiert) |
| **Duden Learnattack** | Cornelsen-Gruppe (Franz Cornelsen Bildungsholding) | Konzernumsatz Cornelsen: "moderates Wachstum 2024, geringeres Wachstum für 2025 geplant" — **keine Learnattack-Einzelzahl gefunden** | Konzerneigenmittel; Cornelsen hat 2025 das KI-Startup **ezri** übernommen (Details/Kaufpreis nicht gefunden) zur Weiterentwicklung des KI-Tutors "Kim" | Nicht ermittelbar | [Cornelsen Pressemitteilung ezri-Übernahme](https://bildungsklick.de/schule/detail/cornelsen-gruppe-uebernimmt-ki-startup-ezri-und-erweitert-ki-portfolio), abgerufen 15.08.2026 |
| **scoyo** | Futurewhiz (NL, seit 2020, davor Super RTL) | Nicht ermittelbar | Futurewhiz 2020 von Levine Leichtman Capital Partners an **NPM Capital** verkauft (Konzernebene, nicht scoyo-spezifisch beziffert) | App laut Play-Store-Metadaten weiter aktiv, aber im aktuellen Marktdiskurs kaum präsent (siehe vorherige Marktanalyse) | [PR Newswire](https://www.prnewswire.com/news-releases/levine-leichtman-capital-partners-sells-futurewhiz--parent-of-squla-wrts-and-scoyo-301198534.html), abgerufen 15.08.2026 |
| **StudySmarter / Vaia** | StudySmarter GmbH (München) | Nicht ermittelbar (Bundesanzeiger-Direktzugriff blockiert; letzter öffentlich einsehbarer Jahresabschluss laut Northdata-Snippet: 2021) | **~31–52 Mio. US-$ Gesamtfinanzierung** (Quellen uneinheitlich: Crunchbase 31 Mio. $, PitchBook 51,9 Mio. $), Investoren u. a. **Goodwater Capital, Owl Ventures, Left Lane Capital, Dieter von Holtzbrinck Ventures** | **>30 Mio. Nutzer** (Ende 2024, laut Eigenangabe/Tracxn) — primär Oberstufe/Studium, für Kl. 5/6 nicht der direkte Kernmarkt | [Tracxn](https://tracxn.com/d/companies/studysmarter/__vpu4S-8-FYi5jA9uXfxF_g25vk3ZDYxhMCFjxOxNOcA/funding-and-investors), [Munich Startup](https://www.munich-startup.de/en/61318/studysmarter-financing/) — Sekundärquellen |
| **Khan Academy / Khanmigo** | Non-Profit (US) | Kostenlos für Kernangebot; Khanmigo 4 $/Monat bzw. 44 $/Jahr | Non-Profit, keine VC-Runden im klassischen Sinn | Khanmigo-Nutzer: **68.000 (Pilot 2023/24) → >700.000 (Schuljahr 2024/25)**, aber **nur für Nutzer mit US-Rechnungsadresse ≥18 Jahre direkt zugänglich** — für Deutschland kein direktes Angebot | [Khan Academy Blog/Presse](https://www.khanmigo.ai/), abgerufen 15.08.2026 |
| **Duolingo** | Duolingo Inc. (börsennotiert, NASDAQ) | **Q3 2025: 271,7 Mio. US-$ Quartalsumsatz** (+41 % YoY), Q2 2025: 252,3 Mio. $ (+41 %, Nettogewinn 44,8 Mio. $, +84 %), Q1 2025: 231 Mio. $ (+38 %) | Börsennotiert, kein klassisches VC mehr | **>50 Mio. DAU** (erstmals Q3 2025), 10,9 Mio. zahlende Abonnenten (Q2 2025, +37 % YoY) — global, kein Deutschland-Split gefunden | [Duolingo Investor Relations](https://investors.duolingo.com/news-releases/news-release-details/duolingo-surpasses-50-million-daily-active-users-grows-dau-36), Primärquelle Quartalsbericht, abgerufen 15.08.2026 |
| **GoStudent** | GoStudent GmbH (Wien) | **52,2 Mio. € Umsatz, 220,8 Mio. € Verlust (2022)**; behauptete Profitabilität 2024 (Details/Zahlen für 2024/25 nicht veröffentlicht gefunden) | Einhorn seit 2021 (1,4 Mrd. €), 2022 Bewertung durch Prosus-Investment auf **3 Mrd. €** verdoppelt, **2023 Abwertung auf ~2,1 Mrd. €** (−30 %), danach weitere Abwertung durch Prosus auf **~903–969 Mio. €** (−~60 % vom Höchststand) → **Unicorn-Status verloren** | Nicht mit aktueller Zahl belegt; nach mehreren Entlassungswellen (von ~2.000 auf ~1.000, dann Konsolidierung) aktuell **~1.500 Vollzeitkräfte** in der Gruppe | [trendingtopics.eu](https://www.trendingtopics.eu/gostudent-grossinvestor-prosus-nimmt-deutliche-abwertung-des-nachhilfe-unicorns-vor/), [wien.ORF.at](https://wien.orf.at/stories/3244047/), [brutkasten](https://brutkasten.com/artikel/gostudent-neunstelliger-verlust-im-jahr-2023-nun-aber-angeblich-profitabel/8) — unabhängiger Wirtschaftsjournalismus, Zahlen 2022–2024 |
| **Studienkreis + Schülerhilfe** (stationäre Institute, zum Vergleich) | Studienkreis: seit Dez. 2022 im Besitz von **GoStudent** (zuvor IK Partners); Schülerhilfe: eigenständig | Gemeinsam **~150 Mio. € Umsatz**, ~2.000 Filialen, **~15 % Marktanteil** an der institutionellen Nachhilfe (Datierung der Zahl unsicher, vermutlich 2016–2020) | Kaufpreis GoStudent–Studienkreis **nicht veröffentlicht** | Marktführer stationäre Nachhilfe DACH | [Studienkreis-Pressemitteilung zur Übernahme](https://www.studienkreis.de/unternehmen/presse/pressemitteilungen/pressemitteilungen-2022/gostudent-uebernimmt-studienkreis/), 02.12.2022 |

**Neue, direkt relevante Konkurrenten (im ursprünglichen Auftrag nicht genannt, aber im gleichen
technischen Feld):**

| Anbieter | Was es macht | Relevanz für unsere Differenzierung |
|---|---|---|
| **[Tutel](https://tutel.app/)** | KI-Tutor für Kl. 5–13, 51 Fächer, "KMK-konform" positioniert, sokratische Methode (keine direkten Lösungen, sondern Rückfragen), deutlich günstiger als klassische Nachhilfe beworben | **Direkter Wettbewerber im selben Nischenclaim** ("KI-Nachhilfe für Schüler"). Fetch der Seite war blockiert; Preis/Nutzerzahlen/Investoren konnten nicht verifiziert werden. |
| **[Wunschlern](https://wunschlern.de/)** | Generiert **individuelle Übungssets samt Lösungswegen per KI**, passgenau nach Schultyp/Klassenstufe/Fach/Thema; explizit **Hosting in Deutschland/EU, kein Tracking**, kostenpflichtig (Preis auf Anfrage bei individuellem Plan) | **Das ist unser Kernmechanismus, bereits am Markt.** Ein kleiner deutscher Anbieter erstellt schon heute KI-generierte Aufgaben inkl. Lösung — die zentrale technische Idee ist **nicht unbesetzt**, auch wenn dieser Anbieter offenbar noch klein/wenig bekannt ist (kein Presseecho, keine Finanzierungsrunde gefunden). |

**Was fehlt / nicht ermittelbar war:** Für Anton, bettermarks, scoyo und Learnattack konnten trotz
gezielter Suche nach Bundesanzeiger-Daten **keine Umsatzzahlen** verifiziert werden — der direkte Zugriff
auf Northdata, Bundesanzeiger.de und Unternehmensregister.de war über den Recherche-Proxy blockiert
(EGRESS_BLOCKED), Sekundärquellen (Presse, Crunchbase, Tracxn) enthalten diese Zahlen nicht. **Das ist die
größte Lücke dieser Recherche** — siehe "Offene Punkte".

---

## 3. Konsolidierung und Friedhof

Der Markt zeigt **deutliche Konsolidierungstendenzen**, nicht viele offene Nischen:

- **scoyo**: Super RTL (RTL-Konzern) verkaufte scoyo 2020 an das niederländische **Futurewhiz**
  (Mutterkonzern von Squla, WRTS/scoyo), das selbst im selben Jahr von Levine Leichtman Capital Partners
  an **NPM Capital** weiterverkauft wurde. Zwei Eigentümerwechsel in einem Jahr — ein Indiz, dass scoyo
  für die vorherigen Eigentümer kein strategisches Kernasset war, sondern ein Portfolio-Baustein.
  ([HORIZONT](https://www.horizont.net/medien/nachrichten/digitale-lern-plattform-super-rtl-verkauft-scoyo-an-futurewhiz-185423), [PR Newswire](https://www.prnewswire.com/news-releases/levine-leichtman-capital-partners-sells-futurewhiz--parent-of-squla-wrts-and-scoyo-301198534.html))
- **GoStudent — der lehrreichste Fall:** Einhorn-Status 2021 bei 1,4 Mrd. € Bewertung, durch
  Prosus-Investment 2022 auf 3 Mrd. € verdoppelt, bei gleichzeitig **220,8 Mio. € Verlust auf nur
  52,2 Mio. € Umsatz** im selben Jahr (Verlustquote >400 % vom Umsatz). Danach zwei Abwertungswellen
  (2023: −30 % auf 2,1 Mrd. €; danach weitere Prosus-Abwertung auf 903–969 Mio. €, **Verlust des
  Unicorn-Status**), begleitet von mehreren Entlassungswellen (von ~2.000 auf ~1.000–1.500
  Mitarbeitende) und Rückzug aus sechs Ländern (USA, Kanada, Brasilien, Chile, Mexiko, Kolumbien) zugunsten
  einer Fokussierung auf DACH/Europa. **Gleichzeitig hat GoStudent 2022 den größten Offline-Wettbewerber
  im DACH-Raum, Studienkreis, übernommen** — eine Wette, dass hybrides Online+Offline-Geschäft
  überlebensfähiger ist als reines Online-Wachstum um jeden Preis. Die behauptete Profitabilität 2024
  wurde nicht mit veröffentlichten Zahlen belegt.
  ([trendingtopics.eu](https://www.trendingtopics.eu/gostudent-grossinvestor-prosus-nimmt-deutliche-abwertung-des-nachhilfe-unicorns-vor/), [wien.ORF.at](https://wien.orf.at/stories/3244047/))
- **Kleinere EdTech-Insolvenzen/Konsolidierungen in Deutschland:** quofox (Berlin, B2B-Weiterbildung,
  Insolvenz März 2023, ~3,5 Mio. € über die Jahre investiert), Sharpist (Berlin, B2B-Coaching, Insolvenz
  Frühjahr 2024, teilgerettet), Charly (Lern-/Marketingplattform für Studierende, Insolvenz März 2022).
  Für den **K-12-Consumer-Bereich** speziell wurde **keine** vergleichbar dokumentierte Insolvenz eines
  bekannten Anbieters gefunden — die gefundenen Pleiten liegen im B2B-/Weiterbildungssegment.
  ([deutsche-startups.de: über 100 Startups, die 2024 gescheitert sind](https://www.deutsche-startups.de/2025/01/28/ueber-100-startups-die-2024-leider-gescheitert-sind/))
- **Aktuelle M&A-Aktivität 2025/26 (Auswahl, nicht erschöpfend):** Cleverly (Kinder-Mentoring/Coding)
  übernimmt Complori (Berlin, Programmierkurse für Kinder); fobizz (Lehrkräfte-KI-Tools) übernimmt
  "to teach"; Cornelsen übernimmt das KI-Startup ezri zur Weiterentwicklung von Learnattacks KI-Tutor Kim;
  Amadeus Fire übernimmt Masterplan (B2B-Weiterbildung); Sdui Group übernimmt Digital Learning GmbH.
  **Muster:** Konsolidierung findet überwiegend zwischen bereits etablierten Anbietern statt (Akquisition
  von Nischenkompetenz durch größere Plattformen), nicht durch Neueinsteiger, die Marktanteile von den
  Großen erobern.
  ([Business Insider](https://www.businessinsider.de/gruenderszene/business/cleverly-uebernimmt-complori-berliner-edtech-startups-schliessen-sich-zusammen/), [StartingUp](https://www.starting-up.de/news/news-investments/edtech-start-up-fobizz-uebernimmt-edtech-start-up-to-teach.html), [bildungsklick.de](https://bildungsklick.de/schule/detail/cornelsen-gruppe-uebernimmt-ki-startup-ezri-und-erweitert-ki-portfolio))

**Einordnung für die Geschäftsentscheidung:** Der Friedhof zeigt vor allem, dass **Wachstum um jeden
Preis mit Fremdkapital in diesem Markt bestraft wird** (GoStudent), während konservativere,
umsatzgetriebene Modelle (sofatutor mit realem, wenn auch moderatem Umsatzwachstum; simpleclub mit
Aussage zur Profitabilität vor Wachstumsbeschleunigung) stabiler wirken. Für einen Neueinsteiger ist das
ein Argument **gegen** eine aggressive, kapitalintensive Wachstumsstrategie und **für** einen
bootstrapped/kapitaleffizienten Ansatz mit früher Profitabilität als Ziel.

---

## 4. Vertriebswege und ihre Ökonomie

### 4.1 B2C — direkt an Eltern

- **Entscheider:** Eltern, oft nach Empfehlung durch andere Eltern, Lehrkräfte oder Kind selbst (App
  Store-Ranking/Bewertungen wirken als Vertrauenssignal).
- **Vertriebszyklus:** Sehr kurz (Minuten bis Tage) — App-Store-Download, Freemium-Test, Abo-Umwandlung.
  Kein Beschaffungsprozess.
- **Ökonomie:** CAC-Benchmarks für EdTech-SaaS liegen laut internationalen (überwiegend US-)Quellen bei
  **150–1.600 US-$ pro zahlendem Kunden**, mit dem Ziel, den Customer Lifetime Value auf mindestens das
  Dreifache der CAC zu bringen. Diese Zahlen sind **nicht Deutschland-spezifisch und stammen aus
  allgemeinen SaaS-Benchmark-Aggregatoren**, sollten also nur als grobe Größenordnung gelten, nicht als
  belastbare Kalkulationsgrundlage. ([FinancialModelsLab](https://financialmodelslab.com/blogs/kpi-metrics/niche-market-software-development), [meetadam.io](https://meetadam.io/benchmarks/customer-acquisition-cost/) — Sekundärquellen, geringe Verlässlichkeit für DACH)
- **Strukturproblem für Neueinsteiger:** Der mit Abstand größte Wettbewerber (Anton) ist **kostenlos in
  der Basisversion**. Bezahlte CAC-Kampagnen konkurrieren damit gegen ein Gratisprodukt mit
  jahrelangem SEO-/App-Store-Vorsprung — bezahlte Nutzerakquise ist entsprechend teuer im Verhältnis zum
  erzielbaren ARPU (siehe SOM-Rechnung: 20–150 €/Jahr pro Familie).
- **Realistischer Pfad:** Organisches Wachstum über Empfehlungsmarketing/Content-SEO/Elternforen statt
  bezahlter Akquise — was Zeit statt Geld kostet und den Wachstumszyklus deutlich verlangsamt.

### 4.2 B2B2C — über Schulen

- **Entscheider:** In der Praxis mehrstufig — eine engagierte Lehrkraft ("Champion") testet das Tool,
  bringt es in die Fach- oder Gesamtkonferenz, die Schulleitung entscheidet formal, bei
  kostenpflichtigen Lizenzen oft mit Einbindung des Schulträgers (Kommune) für das Budget. Laut Bitkom
  haben **83 % der Lehrkräfte** bereits Zugang zu digitalen Lernplattformen (Moodle, iServ), das
  Grundvertrauen in digitale Tools ist also vorhanden.
  ([Bitkom Digitale Schule 2025](https://www.bitkom.org/Presse/Presseinformation/8-von-10-Lehrkraeften-Zugang-digitalen-Lernplattformen))
- **Vertriebszyklus:** Mittel bis lang (ein bis mehrere Schulhalbjahre), gebunden an Schuljahres-
  Budgetzyklen und ggf. Digitalpakt-Fördermittel.
- **Zahlungsbereitschaft:** Vorhandene Referenzpreise: Anton-Schullizenz **ab 500 €/Jahr** (Herstellerangabe,
  aus vorheriger Marktanalyse), bettermarks-Schullizenz **~10,70 €/Schüler/Schuljahr** — das ist der
  reale Preisanker, an dem sich ein neues B2B2C-Angebot messen lassen muss, deutlich unter B2C-Preisen
  pro Kopf.
- **Zusätzliche Hürde:** Für den regulären Unterrichtseinsatz ist in den meisten Bundesländern eine
  **datenschutzrechtliche Freigabe/Auftragsverarbeitungsvereinbarung** mit der Schule bzw. dem Schulträger
  nötig, oft mit Prüfung durch die/den Landesdatenschutzbeauftragte:n — ein Prozess, der Monate dauern
  kann und für den es (siehe Abschnitt 5) **kein einheitliches deutsches Gütesiegel** gibt, an dem sich
  Schulen orientieren könnten.

### 4.3 Landeslizenzen — über Kultusministerien

Das ist der Kanal mit dem größten Hebel (ein Vertragsabschluss erreicht potenziell alle Schulen eines
Bundeslands), aber auch der am schwersten zugängliche.

- **Wie Vergaben laufen:** Zwei dokumentierte Muster gefunden:
  1. **Formale öffentliche Ausschreibung mit Referenznummer**, z. B. die 2023er Ausschreibung
     "Weiternutzung der Landeslizenz für die Lernsoftware Bettermarks" in Rheinland-Pfalz (Auftraggeber
     Koblenz-Region) — das Wording "Weiternutzung" deutet auf eine **Verlängerung eines bestehenden
     Vertrags** hin, nicht auf einen offenen Wettbewerb um einen Neuvertrag. Die ursprüngliche
     Erstvergabe (seit September 2020) konnte nicht mit Verfahrensdetails belegt werden (Seite blockiert).
     ([ausschreibungen-deutschland.de](https://ausschreibungen-deutschland.de/1997200_Weiternutzung_der_Landeslizenz_fuer_die_Lernsoftware_Bettermarks_Referenznummer_der_2023_Koblenz), Titel/Snippet, Fetch nicht möglich)
  2. **Landeslizenz-Kooperation ohne erkennbare öffentliche Ausschreibung** bei fobizz: Bereits **drei
     Bundesländer** (Rheinland-Pfalz, Mecklenburg-Vorpommern, Sachsen) haben landesweite fobizz-Lizenzen
     für Lehrkräfte eingerichtet, Mecklenburg-Vorpommern als erstes Bundesland überhaupt.
     ([trendingtopics.eu](https://www.trendingtopics.eu/erstes-bundesland-fuehrt-fobizz-als-ki-assistenz-fuer-alle-schulen-ein/), [heise](https://www.heise.de/news/KI-in-Schulen-Auch-Rheinland-Pfalz-kauft-Fobizz-Lizenzen-fuer-Lehrkraefte-9574240.html))
  3. **Vergaberechtlicher Rahmen:** Öffentliche Ausschreibungspflicht (EU-weit) greift ab einem
     Schwellenwert von **~214.000–221.000 € netto** (unterschiedliche Quellen nennen leicht abweichende
     Werte, vermutlich unterschiedliche Berichtsjahre) — eine landesweite Lizenz liegt praktisch immer
     darüber und müsste damit regulär ausgeschrieben werden, **es sei denn**, es lässt sich ein
     Alleinstellungsmerkmal des Anbieters ("nur ein Anbieter am Markt") oder ein bestehender Rahmenvertrag
     geltend machen — ein Einfallstor, das etablierte Anbieter mit Erstverträgen (bettermarks, fobizz) in
     eine strukturell vorteilhafte Position bringt.
     ([system.ag Vergaberecht-Überblick](https://www.system.ag/ueber-uns/news/vergaberecht-2025-ein-ueberblick-fuer-schultraeger-und-oeffentliche-auftraggeber), [News4teachers](https://www.news4teachers.de/2026/04/digitalpakt-welche-spielraeume-das-vergaberecht-schultraegern-bei-ausschreibungen-laesst/))
- **Für einen neuen Anbieter realistisch?** **Nein, nicht kurzfristig.** Drei Gründe: (1) formale
  Ausschreibungen ab EU-Schwellenwert verlangen Referenzen/Nachweise, die ein Startup ohne Bestandskunden
  nicht liefern kann; (2) "Weiternutzungs"-Vergaben ohne echten Wettbewerb begünstigen strukturell den
  etablierten Anbieter; (3) jedes Bundesland entscheidet separat (16 potenzielle Einzelverhandlungen,
  kein Bundes-weiter One-Stop-Vertrieb) — das ist ein Vertriebszyklus von Jahren, nicht Monaten, und
  passt nicht zu einem Produkt mit heute drei Nutzern und keiner Referenz.

---

## 5. Markteintrittsbarrieren — ehrlich und konkret

| Barriere | Beschreibung | Mit Geld lösbar? | Nur mit Zeit lösbar? | Praktisch unlösbar für Neueinsteiger? |
|---|---|---|---|---|
| **Markenbekanntheit/App-Store-Ranking** | Anton, simpleclub etc. haben jahrelange Bewertungshistorie, SEO-Dominanz für "Lern-App Klasse 5" | Teilweise (ASO, PR) | Ja, überwiegend | — |
| **CAC gegen ein Gratisprodukt** | Anton kostenlos, macht bezahlte Akquise für zahlungspflichtige Alternativen teuer | Ja, aber mit schlechter Einheitsökonomie | — | — |
| **Content-/Curriculum-Aufbau (16 Bundesländer × Fächer × Klassen)** | Klassische Anbieter haben Jahre in kuratierte, lehrplangeprüfte Aufgabenbanken investiert | **Teilweise durch unseren eigenen technischen Kern entschärft** — LLM-Generierung zur Laufzeit ersetzt einen Teil der Vorab-Kuratierung | — | Vollständige, geprüfte Lehrplan-Abdeckung aller 16 Länder bleibt aufwendig |
| **Datenschutz-Zertifizierung/Schulzulassung** | **Es gibt in Deutschland aktuell kein einheitliches Gütesiegel für Lernsoftware** — Zulassung läuft wie bei klassischen Schulbüchern, faktisch sind bisher überwiegend digitalisierte Schulbücher zugelassen. Ein Zertifizierungsprojekt (DIRECTIONS, KIT) ist erst im Aufbau. | Teilweise (TÜV/DEKRA-Prüfung buchbar) | Ja | Uneinheitlichkeit selbst ist die Hürde — es gibt keinen klaren Zielzustand, den man "erreichen" kann |
| **Elternvertrauen** | Baut sich über Track Record, Empfehlungen, Testberichte auf | Kaum | Ja | — |
| **Lehrer als Multiplikatoren** | 83 % der Lehrkräfte haben Plattform-Zugang, sind aber selbst Gatekeeper/Influencer für Elternentscheidungen | Kaum direkt | Ja | Erfordert echten pädagogischen Mehrwert, nicht nur Marketing |
| **Landeslizenz-Lock-in bestehender Anbieter** | bettermarks/fobizz sitzen bereits in mehrbändigen, verlängerten Landesverträgen | Nein | Nein (Verträge laufen über Jahre) | Ja, bis ein bestehender Vertrag regulär neu ausgeschrieben wird |
| **Datenmoat der Incumbents** | Jahre an Nutzungsdaten fließen in Anpassungsalgorithmen (Anton, bettermarks, simpleclub) ein | Nein | Ja, aber nur durch eigenes Nutzungswachstum, das wiederum von den anderen Barrieren abhängt | Teilweise — Henne-Ei-Problem |

**Kurzfazit:** Die einzige Barriere, die unser technischer Ansatz strukturell **abschwächt**, ist der
Content-Aufbau (LLM statt Kuratierung). Alle anderen Barrieren — Marke, Vertrauen, Lehrer-Multiplikatoren,
Landeslizenz-Lock-in — sind Zeit- oder gar nicht lösbar und lassen sich durch mehr Kapital allein nicht
abkürzen.

---

## 6. Die Differenzierungsfrage: Ist "LLM generiert die Aufgaben" 2026 noch ein Alleinstellungsmerkmal?

**Kurzantwort in beide Richtungen, wie beauftragt:**

**Ja, GenAI ist 2026 bei den großen Anbietern angekommen — aber überwiegend als Chat-Schicht, nicht als
Ersatz für die kuratierte Aufgabenbank:**

- **Cornelsen/Duden Learnattack** hat seit März 2024 den KI-Tutor **"Kim"** — ein **24/7-Chat**, angebunden
  an ChatGPT, der "passende Tipps, Hilfestellungen und Beispiele" gibt und Zugriff auf die vorhandene
  Videobibliothek und interaktiven Übungen hat. Nach den gefundenen Beschreibungen **beantwortet Kim
  Fragen zu bestehenden Inhalten, generiert aber keine komplett neuen, adaptiven Übungsaufgaben** — Kim
  wurde inzwischen so wichtig eingeschätzt, dass Cornelsen 2025 das dahinterstehende Startup **ezri
  übernommen** hat, um die Technologie zu vertiefen.
  ([Cornelsen Presse](https://www.cornelsen.de/presse/pressemitteilungen/individuelles-lerncoaching-ki-tutor-kim-hilft-per-chat-beim-lernen), [Wie funktioniert Kim](https://learnattack.de/wie-funktioniert-der-ki-tutor-kim))
- **simpleclub** hat einen **"AI-Tutor"** (Beta, seit 2024), der Inhalte zusammenfasst, Fragen beantwortet
  und laut Werbetext auch "sich selbst abfragen lassen" kann — die genaue Tiefe (echte adaptive
  Aufgabengenerierung vs. Quiz aus bestehenden Fragen) konnte nicht abschließend verifiziert werden, wirkt
  aber nach den verfügbaren Beschreibungen eher wie ein **Such-/Erklär-Layer über der bestehenden
  Content-Bibliothek**, nicht wie eine vollständige Ersetzung der kuratierten Übungen.
  ([simpleclub Support-Artikel](https://support.simpleclub.com/hc/de/articles/23383524793234-Unser-KI-Tutor), [munich-startup.de](https://www.munich-startup.de/en/96270/simpleclub-presents-its-own-ai-tutor/))
- **Khan Academy/Khanmigo** ist explizit **kein** Aufgaben-Ersatz, sondern "personalisierte Tutorierung zu
  jeder Übung, jedem Video und jedem Artikel auf Khan Academy" — der sokratische Chat begleitet die
  **vorhandene kuratierte Aufgabenbank**, generiert selbst keine neuen Aufgaben für Lernende (nur für
  Lehrkräfte gibt es KI-Werkzeuge zur Erstellung von Quizfragen/Lektionsplänen). Für Deutschland zudem
  praktisch irrelevant: Khanmigo ist an eine **US-Rechnungsadresse und Volljährigkeit** gebunden.
  ([khanmigo.ai](https://www.khanmigo.ai/learners))
- **Duolingo Max** (GPT-4-Feature seit 2023, "Explain My Answer" seit Januar 2026 sogar kostenlos in den
  meisten Sprachen) erklärt **warum** eine Antwort falsch war und bietet Rollenspiel-Dialoge — auch das
  ist eine **Chat-Ergänzung zu einem fixen Curriculum**, keine Aufgaben-Neugenerierung.
  ([Duolingo Investor News](https://investors.duolingo.com/news-releases/news-release-details/duolingo-max-shows-future-ai-education))
- **Anton**: Für Anton wurde trotz gezielter Suche **keine** GenAI-Funktion (Chat-Tutor oder Generierung)
  gefunden — der größte deutsche K-12-Anbieter scheint 2026 noch auf einer klassisch kuratierten
  Aufgabenbank ohne LLM-Layer zu laufen. Das ist eine **Negativ-Recherche mit Unsicherheit**: Abwesenheit
  von Suchtreffern ist kein Beweis für Abwesenheit des Features, aber bei einem so oft besprochenen
  Anbieter wäre eine LLM-Einführung vermutlich Presse-Echo wert gewesen, wie bei simpleclub und Learnattack.
- **bettermarks**: Keine GenAI-Ankündigung gefunden; bleibt nach verfügbaren Quellen ein klassisches
  Intelligent-Tutoring-System mit regelbasierter/statistischer Adaption, nicht LLM-generiert.

**Nein, echte Laufzeit-Generierung mit lokaler Bewertung ist noch nicht Standard bei den Großen — aber
sie ist bereits von kleinen Playern besetzt:**

- **Wunschlern** (deutscher Kleinanbieter, siehe Abschnitt 2) generiert bereits heute **komplette
  Übungssets samt Lösungswegen per KI, passgenau nach Schultyp/Klassenstufe/Fach/Thema** — das ist
  mechanisch **fast identisch** mit unserem Kernansatz (LLM generiert die Aufgabe, Lösung kommt mit).
- **Tutel** positioniert sich explizit als KI-Tutor für Kl. 5–13 mit sokratischer Methode und
  Niedrigpreis-Anspruch gegenüber klassischer Nachhilfe — auch das ist ein direkter Claim auf denselben
  Nutzenversprechen ("KI statt teurer 1:1-Nachhilfe"), auch wenn unklar blieb, ob Tutel strukturierte,
  automatisch bewertbare Aufgaben oder primär freien Chat anbietet.

**Bewertung:** Das ursprünglich angenommene Alleinstellungsmerkmal ist **in der Zwischenzeit relativiert,
aber nicht verschwunden — es hat sich verschoben.** Die großen, finanzstarken Anbieter haben GenAI als
**Erklär-/Chat-Zusatz** über ihre bestehenden Content-Bibliotheken gelegt (geringeres Risiko für sie:
Qualität/Faktentreue bleibt durch kuratierte Basis abgesichert, LLM übernimmt nur die dialogische Schicht).
Die **vollständige Ersetzung der kuratierten Aufgabenbank durch LLM-Generierung mit automatischer lokaler
Bewertung** ist bei den etablierten Marktführern **nicht** gefunden worden — vermutlich bewusst, weil
Qualitätssicherung/Halluzinationsrisiko bei automatisch generierten und automatisch bewerteten
Schulaufgaben ohne menschliche Kuration ein reales Risiko ist, das ein etabliertes Unternehmen mit Marke
zu verlieren scheut. Genau in dieser Lücke bewegen sich aber bereits **kleine, wenig kapitalisierte
deutsche Nischenanbieter** (Wunschlern, Tutel) — das Fenster ist also nicht geschlossen, aber auch **nicht
mehr leer**. Ein Alleinstellungsmerkmal im engeren Sinn (wir sind die Einzigen) ist die Technik nicht mehr;
ein Differenzierungsmerkmal gegenüber den **großen, bekannten** Anbietern ist sie weiterhin, aber gegen
zwei bereits am selben Claim arbeitende Kleinanbieter muss man zusätzlich über Ausführung, Vertrauen oder
Nische gewinnen, nicht über die reine Technologie-Idee.

---

## 7. Wo ist die echte Lücke?

Konkrete, aus der Recherche ableitbare Nischen-Kandidaten (keine Allgemeinplätze):

1. **Lese-Rechtschreib-Schwäche (LRS) / Legasthenie / Dyskalkulie als eigenständiger Produktfokus statt
   Randnotiz.** Anton wirbt zwar mit Eignung "auch bei LRS/Dyskalkulie", positioniert das aber nicht als
   Kernprodukt. Die dedizierte Lerntherapie-Branche (IFLW, Studienkreis-LRS-Angebot) ist überwiegend
   **offline und teuer**; ein digitales, KI-adaptives Angebot speziell für diagnostizierte LRS/Dyskalkulie
   mit entsprechend fachlich abgesicherter (nicht nur allgemein-adaptiver) Aufgabenprogression wurde in
   dieser Recherche bei keinem der großen Anbieter als **Kernprodukt** gefunden — nur als Nebenclaim.
   Risiko: Fachliche Anforderungen an LRS-Förderung sind hoch, reine LLM-Generierung ohne
   sonderpädagogische Fachprüfung wäre hier riskanter als bei Standard-Übungen.
2. **Deutsch als Zweitsprache (DaZ) für neu zugewanderte/geflüchtete Kinder in Sek. I.** Keiner der
   geprüften großen B2C-Anbieter positioniert sich hier als Kernprodukt (alle setzen implizit
   Deutsch-Muttersprache oder fortgeschrittene Deutschkenntnisse voraus). Schulen mit hohem DaZ-Anteil sind
   strukturell unterversorgt, während der politische/finanzielle Rückenwind (Digitalpakt, Integrations-
   fokus) real vorhanden ist. Das ist eine **Hypothese aus der Recherche-Lücke** (kein Anbieter gefunden),
   keine mit Marktzahlen belegte Nische — vor einer Investition wäre eine gezielte Anschlussrecherche
   nötig (Zahl der DaZ-Schüler:innen Sek. I, bestehende Förderprogramme der Länder).
3. **Nicht-gymnasiale Schulformen (Haupt-/Realschule/Gemeinschaftsschule) als bewusste Zielgruppe statt
   Abfallprodukt der Gymnasium-Positionierung.** simpleclub und StudySmarter/Vaia positionieren sich
   erkennbar Richtung Abitur/Studium, Anton wirkt in Ton/Optik eher grundschul-/jüngerennah. Eine Lücke
   für ältere Sek.-I-Schüler:innen (Kl. 8–10) an Real-/Hauptschulen, die weder das "kindliche" Anton-Design
   noch die Abitur-Ausrichtung von simpleclub wollen, ist **plausibel, aber in dieser Recherche nicht mit
   Marktanteilszahlen nach Schulform belegt** — Einschätzung, keine harte Zahl.
4. **Eltern-Coach als Kernprodukt statt Kind-App mit Eltern-Dashboard.** Alle geprüften Wettbewerber bauen
   primär eine Kind-App mit einem nachgelagerten Statistik-Dashboard für Eltern. Ein **dialogischer,
   auf die tatsächliche Übungshistorie gestützter Eltern-Coach-Chat** (wie im bestehenden Repo bereits
   vorhanden, `coach.ts`) wurde bei keinem der geprüften großen Anbieter in dieser Form gefunden — das ist
   ein bestehendes, verifiziertes Alleinstellungsmerkmal des eigenen Produkts, keine reine Hypothese.
5. **Ferien-/Intensiv-Nutzung statt Ganzjahres-Abo.** Alle geprüften kommerziellen Anbieter verkaufen
   Jahres-/Monatsabos für kontinuierliche Nutzung. Ein explizit auf **Ferienzeiträume zugeschnittenes
   Produkt** (kurzer, hochfrequenter Intensiv-Zeitraum statt Dauerabo) wurde bei keinem Wettbewerber
   gefunden — unklar, ob das eine echte Nachfragelücke oder ein zu kleiner Markt ist (Ferienzeiten sind per
   Definition zeitlich begrenzt, ein Jahresabo-Geschäftsmodell passt schlecht dazu). Eher ein
   Produkt-Add-on/Einstiegsangebot als eigenständiges Geschäftsmodell.

**Am stärksten belegt:** Nische 4 (Eltern-Coach) ist bereits im eigenen Produkt vorhanden und verifiziert
unbesetzt. Nischen 1–3 sind plausible, aber nicht mit Marktgrößen-Zahlen unterlegte Hypothesen, die vor
einer Kapitalentscheidung eine eigene, engere Recherche verdienen würden.

---

## Fallstricke & Risiken (Gesamtbild)

- **Datenlücke bei den wichtigsten Konkurrenzzahlen.** Northdata, Bundesanzeiger.de und
  Unternehmensregister.de waren über den Recherche-Proxy vollständig blockiert (`EGRESS_BLOCKED`). Für
  Anton, bettermarks, scoyo und Learnattack – vier der wichtigsten Wettbewerber – konnten dadurch **keine**
  Umsatzzahlen verifiziert werden. Diese vier Firmen sind in Deutschland bundesanzeigerpflichtig; die
  Zahlen existieren, sind nur mit dieser Recherche-Umgebung nicht zugänglich gewesen.
- **Die einzige belastbare unabhängige Studie zu privaten Nachhilfeausgaben ist zehn Jahre alt**
  (Bertelsmann/Infratest dimap 2015/16). Alle TAM/SAM/SOM-Eurobeträge in Abschnitt 1 sind auf dieser
  veralteten Ausgangszahl aufgebaut und entsprechend mit Vorsicht zu verwenden — sie taugen als
  Größenordnung, nicht als belastbare Business-Case-Grundlage.
- **CAC-Benchmarks sind US-SaaS-Branchenwerte**, keine Deutschland-/EdTech-K12-spezifischen Zahlen — vor
  einer echten Finanzplanung müsste ein eigener CAC-Test (z. B. Meta/Google-Ads-Pilot) die realen Kosten
  in diesem spezifischen Markt ermitteln.
- **Tutel und Wunschlern konnten nicht tiefergehend verifiziert werden** (beide Hauptseiten über den Proxy
  blockiert) — Preise, echte Nutzerzahlen, Finanzierungsstatus und die genaue technische Tiefe (generieren
  sie wirklich strukturierte, automatisch bewertbare Aufgaben oder ist es primär freier Chat?) bleiben
  offen. Das ist eine relevante Lücke, weil genau diese beiden Anbieter die direkteste Konkurrenz zum
  eigenen technischen Kern darstellen.
- **GoStudent-Warnsignal ernst nehmen:** Ein mit >1 Mrd. € bewertetes, prominentes EdTech-Unternehmen hat
  binnen zwei Jahren >60 % seines Bewertungswerts verloren, bei Verlustquoten von über 400 % des Umsatzes
  im Höhepunktjahr. Das ist kein Einzelfall-Pech, sondern ein strukturelles Signal, dass **Wachstum vor
  Profitabilität** in diesem Markt vom Kapitalmarkt inzwischen hart abgestraft wird.
- **Landeslizenz-Kanal ist ein Fernziel, kein Einstiegskanal** — wer den Business-Case auf frühen
  Landeslizenz-Umsatz aufbaut, kalkuliert mit einem Kanal, der laut dieser Recherche mehrjährige
  Vorlaufzeit, Referenzen und in der Praxis oft "Weiternutzungs"-Vergaben ohne echten Wettbewerb erfordert.
- **Fehlendes einheitliches Datenschutz-/Qualitätsgütesiegel** in Deutschland bedeutet: Es gibt keinen
  klaren, einmalig zu erreichenden Meilenstein ("Zertifikat X erhalten"), sondern 16 potenziell
  unterschiedliche Länder-Anforderungen plus allgemeine DSGVO-Pflichten (siehe bereits vorliegende Recherche
  `2026-08-15-datenschutz-dsgvo.md`) — Planungsunsicherheit, kein einmaliger Fixkostenblock.

---

## Quellen (vollständige Liste, mit Art und Abrufdatum)

**Marktgröße:**
- [KMK/Bildungsministerkonferenz – Vorausberechnung Schüler:innen und Absolvierende 2023–2035](https://www.kmk.org/fileadmin/Dateien/pdf/Statistik/Dokumentationen/Dok_242_Vorausberechnung_Schueler_Abs_2023_2035.pdf) — Behörde, über Suchindex referenziert, abgerufen 15.08.2026
- [Destatis: 0,7 % mehr Schülerinnen und Schüler im Schuljahr 2025/2026](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/03/PD26_081_211.html) — Behörde/Primärquelle, abgerufen 15.08.2026
- [Destatis: 0,9 % mehr Schülerinnen und Schüler im Schuljahr 2024/2025](https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/03/PD25_090_211.html) — Behörde/Primärquelle
- [Statista: Anzahl der Schülerinnen an Gymnasien](https://de.statista.com/statistik/daten/studie/1075852/umfrage/anzahl-der-schuelerinnen-an-gymnasien-in-deutschland/) — Sekundärquelle (Statista-Aggregation von Destatis-Daten)
- [Bertelsmann Stiftung: Eltern geben jährlich rund 900 Millionen Euro für Nachhilfe aus](https://www.bertelsmann-stiftung.de/de/themen/aktuelle-meldungen/2016/januar/eltern-geben-jaehrlich-rund-900-millionen-euro-fuer-nachhilfe-aus) — unabhängige Studie (Infratest dimap), Erhebung 2015, **veraltet**
- [Studienkreis/Forsa: Unterstützung beim Lernen 2023/24](https://www.studienkreis.de/unternehmen/presse/pressemitteilungen/pressemitteilungen-2024/unterstuetzung-beim-lernen/) — Forsa-Umfrage im Auftrag eines Marktteilnehmers
- [WiseGuyReports: Online-Nachhilfemarkt Deutschland 2032](https://www.wiseguyreports.com/de/reports/tutoring-online-market) — kommerzielle Marktforschung, Schätzung
- [ResearchAndMarkets: Germany Edtech Market Summary 2017–2026](https://www.researchandmarkets.com/reports/5670473/germany-edtech-market-summary-competitive) — kommerzielle Marktforschung, Schätzung
- [Superprof: Der Deutsche Markt für Nachhilfe im Wachstum](https://www.superprof.de/blog/private-nachhilfe-boomt/) — Marketing-Blog eines Marktteilnehmers, Datierung der zitierten Zahlen unsicher

**Wettbewerber – Finanzzahlen:**
- [deutsche-startups.de: sofatutor wächst auf 26 Millionen Umsatz (Zahlencheck 2021)](https://www.deutsche-startups.de/2023/07/03/sofatutor-zahlencheck-2021/) — unabhängiger Fachjournalismus
- [simpleclub Presse: Erfolgsgeschichten](https://simpleclub.com/erfolgsgeschichten) — Herstellerangabe
- [deutsche-startups.de: simpleclub-Pivot Richtung B2B](https://www.deutsche-startups.de/2022/10/04/simpleclub-edtech-pivot/) — unabhängiger Fachjournalismus
- [Munich Startup: Simpleclub erhält zusätzliche 4 Millionen Euro](https://www.munich-startup.de/en/101166/simpleclub-receives-additional-4-million-euros-for-vocational-training/) — Fachpresse
- [Northdata: solocode GmbH (Anton)](https://www.northdata.com/?id=2430985013) — Register-Metadaten, Finanzzahlen nicht zugänglich (Fetch blockiert)
- [Northdata: bettermarks GmbH](https://www.northdata.com/?id=6070455) — Register-Metadaten, Finanzzahlen nicht zugänglich (Fetch blockiert)
- [Tracxn: StudySmarter Funding & Investors](https://tracxn.com/d/companies/studysmarter/__vpu4S-8-FYi5jA9uXfxF_g25vk3ZDYxhMCFjxOxNOcA/funding-and-investors) — kommerzielle Startup-Datenbank
- [Munich Startup: Millionen-Finanzierung für Studysmarter](https://www.munich-startup.de/en/61318/studysmarter-financing/) — Fachpresse
- [Bildungsklick: Cornelsen Gruppe übernimmt KI-Startup ezri](https://bildungsklick.de/schule/detail/cornelsen-gruppe-uebernimmt-ki-startup-ezri-und-erweitert-ki-portfolio) — unabhängiger Bildungsjournalismus
- [PR Newswire: Levine Leichtman Capital Partners Sells Futurewhiz](https://www.prnewswire.com/news-releases/levine-leichtman-capital-partners-sells-futurewhiz--parent-of-squla-wrts-and-scoyo-301198534.html) — Pressemitteilung, unabhängig recherchierbar
- [Duolingo Investor Relations: 50 Millionen DAU, Q3 2025](https://investors.duolingo.com/news-releases/news-release-details/duolingo-surpasses-50-million-daily-active-users-grows-dau-36) — Primärquelle, Quartalsbericht
- [Khanmigo](https://www.khanmigo.ai/learners) — Herstellerangabe

**GoStudent/Konsolidierung:**
- [trendingtopics.eu: GoStudent verliert Unicorn-Status nach Abwertung durch Lead-Investor](https://www.trendingtopics.eu/gostudent-unicorn-status/) — unabhängiger Wirtschaftsjournalismus (Österreich)
- [trendingtopics.eu: GoStudent – Großinvestor Prosus nimmt deutliche Abwertung vor](https://www.trendingtopics.eu/gostudent-grossinvestor-prosus-nimmt-deutliche-abwertung-des-nachhilfe-unicorns-vor/) — unabhängiger Wirtschaftsjournalismus
- [wien.ORF.at: 220 Mio. Euro – GoStudent schrieb Verluste](https://wien.orf.at/stories/3244047/) — öffentlich-rechtlicher Rundfunk
- [brutkasten: GoStudent – Neunstelliger Verlust im Jahr 2023](https://brutkasten.com/artikel/gostudent-neunstelliger-verlust-im-jahr-2023-nun-aber-angeblich-profitabel/8) — unabhängiger Startup-Journalismus
- [Studienkreis-Pressemitteilung: GoStudent übernimmt Studienkreis](https://www.studienkreis.de/unternehmen/presse/pressemitteilungen/pressemitteilungen-2022/gostudent-uebernimmt-studienkreis/), 02.12.2022 — Pressemitteilung der übernommenen Firma
- [deutsche-startups.de: Über 100 Startups, die 2024 gescheitert sind](https://www.deutsche-startups.de/2025/01/28/ueber-100-startups-die-2024-leider-gescheitert-sind/) — unabhängiger Fachjournalismus
- [Business Insider: Cleverly übernimmt Complori](https://www.businessinsider.de/gruenderszene/business/cleverly-uebernimmt-complori-berliner-edtech-startups-schliessen-sich-zusammen/) — unabhängiger Wirtschaftsjournalismus

**Vertriebswege/Landeslizenzen:**
- [Nds. Kultusministerium: bettermarks kostenfrei in der NBC](https://www.mk.niedersachsen.de/startseite/aktuelles/presseinformationen/10-punkte-agenda-lernen-mit-digitalen-medien-neues-mathematik-programm-bettermarks-kostenfrei-in-niedersachsischer-bildungscloud-nbc-197372.html) — Behörde, Primärquelle
- [ausschreibungen-deutschland.de: Weiternutzung Landeslizenz Bettermarks, Koblenz 2023](https://ausschreibungen-deutschland.de/1997200_Weiternutzung_der_Landeslizenz_fuer_die_Lernsoftware_Bettermarks_Referenznummer_der_2023_Koblenz) — Ausschreibungsdatenbank, nur Titel/Snippet zugänglich
- [trendingtopics.eu: Erstes Bundesland führt fobizz als KI-Assistenz für alle Schulen ein](https://www.trendingtopics.eu/erstes-bundesland-fuehrt-fobizz-als-ki-assistenz-fuer-alle-schulen-ein/) — unabhängiger Wirtschaftsjournalismus
- [heise online: KI in Schulen – Auch Rheinland-Pfalz kauft Fobizz-Lizenzen](https://www.heise.de/news/KI-in-Schulen-Auch-Rheinland-Pfalz-kauft-Fobizz-Lizenzen-fuer-Lehrkraefte-9574240.html) — Titel/Snippet über Suchindex, Fetch blockiert
- [system.ag: Vergaberecht 2025 – Überblick für Schulträger](https://www.system.ag/ueber-uns/news/vergaberecht-2025-ein-ueberblick-fuer-schultraeger-und-oeffentliche-auftraggeber) — Fachkanzlei-Ratgeber
- [News4teachers: Digitalpakt – Welche Spielräume das Vergaberecht Schulträgern lässt](https://www.news4teachers.de/2026/04/digitalpakt-welche-spielraeume-das-vergaberecht-schultraegern-bei-ausschreibungen-laesst/) — Fachpresse

**Markteintrittsbarrieren/Zertifizierung:**
- [checkpoint-elearning.de: Vorbild Österreich – Qualitätssiegel für Lernsoftware](https://checkpoint-elearning.de/schule/vorbild-oesterreich-qualitaetssiegel-fuer-lernsoftware-an-oeffentlichen-schulen) — Fachpresse, zeigt implizit die deutsche Lücke
- [datenschutz-schule.info: Entwicklung einer Datenschutzzertifizierung für Lernplattformen (DIRECTIONS/KIT)](https://news.datenschutz-schule.info/2022/01/05/entwicklung-einer-datenschutzzertifizierung-fuer-lernplattformen/) — Fachportal
- [Bitkom: 8 von 10 Lehrkräften haben Zugang zu digitalen Lernplattformen](https://www.bitkom.org/Presse/Presseinformation/8-von-10-Lehrkraeften-Zugang-digitalen-Lernplattformen) — Verbandsstudie, repräsentative Befragung 2025

**Differenzierung/GenAI bei Wettbewerbern:**
- [Cornelsen Presse: KI-Tutor Kim hilft per Chat beim Lernen](https://www.cornelsen.de/presse/pressemitteilungen/individuelles-lerncoaching-ki-tutor-kim-hilft-per-chat-beim-lernen) — Herstellerangabe
- [Learnattack: Wie funktioniert der KI-Tutor Kim](https://learnattack.de/wie-funktioniert-der-ki-tutor-kim) — Herstellerangabe, über Suchindex
- [simpleclub Support: Unser KI-Tutor](https://support.simpleclub.com/hc/de/articles/23383524793234-Unser-KI-Tutor) — Herstellerangabe
- [Munich Startup: Simpleclub präsentiert eigenen KI-Tutor](https://www.munich-startup.de/en/96270/simpleclub-presents-its-own-ai-tutor/) — Fachpresse
- [Khanmigo for learners](https://www.khanmigo.ai/learners) — Herstellerangabe
- [Duolingo Investor News: Duolingo Max Shows the Future of AI Education](https://investors.duolingo.com/news-releases/news-release-details/duolingo-max-shows-future-ai-education) — Primärquelle, Pressemitteilung

**Neue Konkurrenten/Nische:**
- [Tutel](https://tutel.app/) — Herstellerangabe (Direktzugriff blockiert, nur über Suchindex/Sekundärquellen beschrieben)
- [startupvalley.news: Tutel – KI-Nachhilfe für Schüler im Interview](https://startupvalley.news/de/tutel-ki-nachhilfe-fuer-schueler-im-interview/) — Fachpresse (Fetch blockiert, nur Snippet)
- [Wunschlern](https://wunschlern.de/) — Herstellerangabe (Direktzugriff blockiert, nur über Suchindex/Deutscher Bildungsserver beschrieben)
- [Deutscher Bildungsserver: Wunschlern – Übungssets generiert durch künstliche Intelligenz](https://www.bildungsserver.de/onlineressource.html?onlineressourcen_id=67215) — unabhängige Katalogisierung, öffentlich finanziert
- [FinancialModelsLab: EdTech CAC-Benchmarks](https://financialmodelslab.com/blogs/kpi-metrics/niche-market-software-development) — kommerzieller Ratgeber, nicht Deutschland-spezifisch

---

## Offene Punkte

- **Umsatzzahlen für Anton, bettermarks, scoyo und Learnattack** konnten nicht verifiziert werden — der
  direkte Zugriff auf Bundesanzeiger.de, Unternehmensregister.de und Northdata war über den Recherche-
  Proxy vollständig blockiert (`EGRESS_BLOCKED`). Mit normalem Browser-Zugriff wären diese Zahlen (für
  bundesanzeigerpflichtige GmbHs Pflichtveröffentlichung) in kurzer Zeit einsehbar — höchste Priorität für
  eine Anschlussrecherche, bevor eine Kapitalentscheidung fällt.
- **Tutel und Wunschlern** — beide Hauptseiten waren blockiert, damit unklar: exakte Preise,
  Nutzerzahlen, Finanzierungsstatus, echte technische Tiefe (strukturierte, automatisch bewertete
  Aufgaben vs. freier Chat). Da beide die nächstgelegenen direkten Wettbewerber zum eigenen technischen
  Ansatz sind, ist das die zweitwichtigste Lücke dieser Recherche.
  Empfehlung: Testaccounts bei beiden anlegen und das Produkt selbst durchspielen.
- **Aktuelle (2024/2025) Nachhilfeausgaben-Studie fehlt.** Die Bertelsmann/Infratest-dimap-Zahlen (2015/16)
  sind die einzige gefundene belastbare Quelle für Euro-Beträge, aber zehn Jahre alt. Eine Anfrage bei
  Bertelsmann Stiftung, ifo-Institut oder FiBS (Forschungsinstitut für Bildungs- und Sozialökonomie, im
  Suchindex als Autor einer Nachhilfe-Studie aufgetaucht) nach einer aktuelleren Erhebung wäre der nächste
  Schritt.
- **Genaue Vergabeverfahren für Landeslizenzen** (bettermarks-Erstvergabe, fobizz-Landesverträge) konnten
  nicht im Detail nachvollzogen werden, da die entsprechenden Ausschreibungsportale/Ministeriumsseiten
  über den Proxy blockiert waren. Für eine belastbare Einschätzung der Erfolgswahrscheinlichkeit eines
  eigenen Landeslizenz-Vorstoßes wäre ein direktes Gespräch mit einem Landesmedienzentrum oder einer
  Landesbildungscloud-Stelle nötig — das ist ohnehin eher ein Beziehungs- als ein Rechercheproblem.
- **Marktanteil nach Schulform** (Gymnasium vs. Real-/Hauptschule) wurde für keinen Anbieter mit Zahlen
  gefunden — Nische 3 in Abschnitt 7 bleibt eine plausible, aber unbelegte Hypothese.
- **DaZ-spezifische Marktgröße** (Anzahl neu zugewanderter/geflüchteter Sek.-I-Schüler:innen, bestehende
  Länderförderprogramme) wurde nicht recherchiert — Nische 2 in Abschnitt 7 bräuchte eine eigene,
  fokussierte Anschlussrecherche, bevor daraus eine Produktentscheidung wird.
- **Rechtliche Fragen** (Anthropic-API-Nutzungsbedingungen bei kommerzieller Weitergabe an fremde Kunden,
  Haftung für KI-generierte und KI-bewertete Lerninhalte, Gewerbeanmeldung/Rechtsform) sind nicht Teil
  dieser Recherche — dafür ausdrücklich auf eine Fachperson (Rechtsanwalt für IT-/Gesellschaftsrecht)
  verweisen, bevor ernsthafte Schritte in Richtung Unternehmensgründung folgen.
