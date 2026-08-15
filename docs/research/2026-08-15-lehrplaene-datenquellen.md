# Lehrpläne in Deutschland als Datenquelle für den Ferien-Lerncoach

Auftrag: Prüfen, ob und wie sich Lehrplaninhalte strukturiert für die Aufgabengenerierung nutzen lassen — nicht nur für den eigenen Haushalt (Zwillinge, Klasse 6, Gymnasium, Niedersachsen), sondern grundsätzlich für Kinder anderer Familien, Bundesländer und Jahrgänge. Recherchestand: 15.08.2026.

## Annahmen

- Der konkrete Fall „Zwillinge, Jahrgang 6, Gymnasium, Niedersachsen, Schuljahr 2026/27" dient als **Beispiel und Illustration**, nicht als Zielbild — die App soll grundsätzlich Bundesland × Schulform × Jahrgang × Fach beliebig abdecken können.
- Rechts- und datenschutzrechtliche Aussagen sind **Sachstand, keine verbindliche Beratung**. Vor einem Launch, der Kinder anderer Familien einschließt, ist zwingend Fachpersonal (Urheberrecht, Datenschutz) hinzuzuziehen.
- Technischer Hinweis zur Recherche: In meiner Umgebung waren die Domains der Landesministerien/-portale (u. a. `mk.niedersachsen.de`, `cuvo.nibis.de`, `nglv.de`, `schulentwicklung.nrw.de`, `bass.schule.nrw`, sogar `kmk.org`) für direkten Seitenabruf gesperrt (Egress-Proxy). Alle Aussagen zu Dokumentinhalten stützen sich daher auf Suchmaschinen-Snippets und Sekundärquellen (Schulhomepages, Verlage, Verbände), **nicht auf eigene Volltextprüfung der PDFs**. Das ist unten in „Offene Punkte" markiert und sollte vor Produktiveinsatz nachgeholt werden.

## 1. Empfehlung

**Es gibt keine bundesweite strukturierte oder maschinenlesbare Datenquelle für Lehrplaninhalte.** Die Realität sind 16 Länderportale mit PDF-/HTML-Dokumenten in je eigenem Format, Gliederungsschema und Aktualisierungsrhythmus — bestätigt durch die Initiative WirLernenOnline, die genau an diesem Problem arbeitet und offen sagt: „Almost no federal state has published its curricula in machine-readable format." Für eine App, die beliebige Bundesland/Schulform/Jahrgang/Fach-Kombinationen bedienen soll, bedeutet das: entweder (a) sich auf die bundesweiten KMK-Bildungsstandards als kleinsten gemeinsamen Nenner stützen — das funktioniert aber nur an drei Checkpoints (Ende Klasse 4, Ende Sek I/ESA-MSA, Abitur), **nicht** für Zwischenjahrgänge wie Klasse 6 —, oder (b) die Länder-PDFs einmalig (und bei Novellierungen erneut) selbst in ein eigenes Schema überführen, z. B. per KI-gestützter Extraktion mit menschlicher Prüfung. Priorität für den Start: die eigenen bereits recherchierten Bundesländer (Niedersachsen als Ausgangsfall) plus die einwohnerstärksten Länder (NRW, Bayern, Baden-Württemberg), dann bedarfsgetrieben erweitern.

**Lizenzrechtlich** spricht viel dafür, dass amtliche Kerncurricula als amtliche Werke (§ 5 Abs. 1 UrhG) gemeinfrei sind und – unter Beachtung des Änderungsverbots (§ 62 UrhG) und der Quellenangabe (§ 63 UrhG) – auch kommerziell und gegenüber fremden Nutzer:innen weiterverwendet werden dürfen. Diese Einordnung ist aber nicht für jedes Land und jedes Begleitdokument (z. B. Unterrichtsbeispiele, Bildmaterial) automatisch gegeben und sollte vor einer Öffnung für fremde Familien anwaltlich geprüft werden.

**Der mit Abstand folgenreichste Befund ist datenschutzrechtlich, nicht urheberrechtlich:** Solange nur die eigenen Kinder die App nutzen, greift plausibel die Haushaltsausnahme (Art. 2 Abs. 2 lit. c DSGVO). Sobald Kinder fremder Familien mitmachen, entfällt diese Ausnahme, und der Betreiber wird zum datenschutzrechtlich Verantwortlichen für die Verarbeitung von Daten Minderjähriger — mit Einwilligungspflicht der Erziehungsberechtigten (Art. 8 DSGVO), Informationspflichten, Auftragsverarbeitungsvertrag mit dem KI-Anbieter (Art. 28 DSGVO, ggf. Drittlandtransfer) und Löschkonzept. Das ist praktisch der größere Hebel für die Produktentscheidung als die Lehrplanfrage selbst — siehe Abschnitt 4.

## 2. Ist die Kernfrage: Gibt es eine strukturierte Datenquelle?

### 2.1 KMK vs. Land — wer regelt was

Die Kultusministerkonferenz (KMK) beschließt **Bildungsstandards**: keine Stoffkataloge, sondern fachbezogene Kompetenzbeschreibungen, verbindlich als länderübergreifender Rahmen, aber nur für **drei Checkpoints**: Primarbereich (Ende Klasse 4), Sekundarbereich I (Ende ESA/MSA, faktisch Ende Klasse 9/10) und Abitur. Für Deutsch und Mathematik wurden diese 2022 neu gefasst, für die erste Fremdsprache (Englisch/Französisch) 2023 mit Umsetzungshilfen versehen ([KMK Bildungsstandards Mathematik ESA/MSA, 2022](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-ESA-MSA-Mathe.pdf), [KMK Bildungsstandards Mathematik Primarbereich, 2022](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-Primarbereich-Mathe.pdf), [KMK-Übersicht Bildungsstandards](https://www.kmk.org/themen/qualitaetssicherung-in-schulen/bildungsstandards.html)). Die einzelnen Länder übersetzen diese Standards in ihre eigenen Kerncurricula/Kernlehrpläne/Bildungspläne und legen darin auch die **Zwischenschritte** (z. B. „erwartete Kompetenzen am Ende von Jahrgang 6") sowie konkretere Inhalte fest. **Konsequenz für die App:** Für Klasse 6 gibt es keinen bundesweiten KMK-Text, an dem man sich orientieren könnte — hier ist man zwingend auf die 16 Länderdokumente angewiesen.

### 2.2 Landschaft der Länderportale (Auswahl, Stand der Recherche)

| Bundesland | Portal | Format | Struktur |
|---|---|---|---|
| Niedersachsen | `cuvo.nibis.de` (Curriculare Vorgaben Online) / `mk.niedersachsen.de` | PDF | Nach Schulform/Fach, z. T. gerade in Überarbeitung von schulform-spezifisch zu „schulformübergreifend Sek I" |
| NRW | `lehrplannavigator.nrw.de`, Veröffentlichung über `schulentwicklung.nrw.de` (QUA-LiS) | PDF, dazu Web-Navigator mit Beispiel-Unterrichtsvorhaben | Nach Schulform, „Kernlehrpläne" seit 2019 (G9) bzw. 2022 (Deutsch/Mathe) |
| Bayern | `lehrplanplus.bayern.de` | HTML (interaktiv nach Fach/Jahrgangsstufe navigierbar) | Einzige mir bekannte Landeslösung mit **jahrgangsscharfer** HTML-Navigation statt nur PDF |
| Baden-Württemberg | `bildungsplaene-bw.de` (auch `schule-bw.de`) | HTML + PDF, inkl. „Beispielcurricula" je Fach/Doppeljahrgang | Bildungsplan 2016, aktuell laut Kultusministerium in Überarbeitung |
| Hessen | `kultus.hessen.de` (Kerncurricula-Bereich) | PDF | Kerncurricula je Schulform/Stufe |
| (Referenz) KMK bundesweit | `kmk.org` | PDF | Nur die drei o. g. Checkpoints, kein Jahrgang 6 |

Quellen siehe Abschnitt 6. Für Bayern ist LehrplanPLUS insofern ein Sonderfall, als es tatsächlich strukturiert nach Schulart → Jahrgangsstufe → Fach im HTML navigierbar ist ([LehrplanPLUS Gymnasium 6 Deutsch](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/6/deutsch), [Mathematik](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/6/mathematik)) — das ist näher an „strukturierten Daten" als die reinen PDF-Länder, aber immer noch keine offene API oder ein Bulk-Export.

### 2.3 Maschinenlesbarkeit, OER-Metadaten, Bildungsserver

- **WirLernenOnline (WLO)** ist eine Suchmaschine für freie Bildungsmaterialien (OER) mit Schnittstellen zu Landesbildungsservern; sie verwendet u. a. das **AMB-Profil** (Allgemeines Metadatenprofil für Bildungsressourcen, JSON-LD auf schema.org-Basis) sowie LOM/LRMI zur Beschreibung von *Materialien* ([AMB-Spezifikation, DINI-AG-KIM](https://dini-ag-kim.github.io/amb/draft/)). Wichtig: Diese Standards beschreiben **Unterrichtsmaterial**, nicht den Lehrplantext selbst.
- Das WLO-Projekt „**Vernetzte Curricula**" versucht, die 16 Länder-Curricula inhaltlich zu verknüpfen (z. B. „Thema A in Bayern Klasse 4 entspricht Thema B in Berlin Klasse 5"), befindet sich aber laut eigener Aussage noch in einer frühen Phase, und die Kernaussage lautet ausdrücklich: fast kein Bundesland hat sein Curriculum maschinenlesbar veröffentlicht ([WLO — Vernetzte Curricula](https://wirlernenonline.de/vernetzte-curricula/)).
- **MUNDO/FWU** (Bildungsmediathek der 16 Länder, Projekt SODIX) verknüpft Medien mit landesspezifischen Curricula über eigene Metadatenstandards („MEM"), ist aber ein Mediensuchsystem, kein Curriculum-Datenexport ([FWU – SODIX/MUNDO](https://fwu.de/projekte/sodix-mundo/)).
- Der **Deutsche Bildungsserver** verlinkt zentral auf die 16 Landesportale (klickbare Übersicht), betreibt aber selbst keine Lehrplan-Datenbank mit einheitlichem Schema — es ist eine kuratierte Linksammlung, kein API-Endpunkt ([Deutscher Bildungsserver – Lehrpläne der Bundesländer](https://www.bildungsserver.de/schule/lehrplaene-400-de.html)).

**Fazit Frage 2:** „16 Länderportale mit PDFs" ist die Realität, nicht eine strukturierte Gesamtquelle. Es gibt Ansätze (AMB/LOM-DE, WLO Vernetzte Curricula, MUNDO/FWU), die aber Materialien beschreiben oder Curricula erst *verknüpfen* wollen — keiner davon liefert den Lehrplantext selbst maschinenlesbar.

### 2.4 Pragmatische Optionen für die App (mit Aufwandseinschätzung)

1. **KMK-Bildungsstandards als bundesweiter Kern.** Vorteil: ein Dokument pro Fach, rechtlich unstrittig gemeinfrei, stabil. Nachteil: nur 3 Checkpoints (Kl. 4 / ESA-MSA / Abi) — für Klasse 6 (und die meisten Jahrgänge) inhaltlich zu grob, man verliert die im Alltag relevante Jahrgangsgranularität komplett.
2. **Manuelle/KI-gestützte Ersterfassung der Länder-Kerncurricula in ein eigenes Schema** (z. B. JSON: Bundesland → Schulform → Fach → Doppeljahrgang → Kompetenzbereich → Themen). Aufwand: einmalig pro Bundesland/Fach überschaubar (Kerncurricula sind je 20–80 Seiten strukturierten Fließtexts, mit LLM-gestützter Extraktion plus manueller Stichprobenprüfung in wenigen Stunden pro Dokument machbar), laufender Pflegeaufwand bei Novellierungen (in Niedersachsen z. B. wird gerade Englisch neu gefasst, Deutsch ist in Überarbeitung — siehe Abschnitt 5). Realistischste Option für den Start mit 2–4 Bundesländern.
3. **Sich ganz auf schulinterne Stoffverteilung statt auf Landes-Kerncurricula stützen** (siehe Abschnitt 5.3) — deutlich feingranularer, aber nicht systematisch beschaffbar, sondern nur schulweise, und damit nicht skalierbar für „beliebige Familie meldet sich an".

Empfehlung: Option 2 als Fundament (grobe Themen-/Kompetenzstruktur je Bundesland/Fach/Doppeljahrgang), Option 3 optional als Verfeinerung, wenn eine Familie ihre Schule/ihr Lehrwerk hinterlegt.

## 3. Lizenz/Nutzungsrechte — verschärft durch Multi-Family-Nutzung

- Gesetze, Verordnungen, amtliche Erlasse und Bekanntmachungen genießen nach **§ 5 Abs. 1 UrhG** keinen Urheberrechtsschutz. Kerncurricula/Lehrpläne werden in der Fachliteratur überwiegend als amtliche Werke in diesem Sinn eingeordnet (behördlich erlassen, mit Rechtswirkung für Schulen) ([JuraForum – § 5 UrhG](https://www.juraforum.de/gesetze/urhg/5-amtliche-werke), [ipwiki – Amtliche Werke](https://www.ipwiki.de/urheberrecht:amtliche_werke)). Nutzungspflichten nach § 5 Abs. 2 UrhG: keine Änderung des Wortlauts bei Wiedergabe unverändert erlassener Werke (Bearbeitungen sind erlaubt, unterliegen aber eigenen Regeln), Quellenangabe bei Vervielfältigung.
- Das gilt für den **amtlichen Kerncurriculum-Text selbst**. Begleitmaterial der Landesportale (Unterrichtsbeispiele, Bilder, Erklärvideos) kann eigenen, abweichenden Lizenzbedingungen unterliegen — der niedersächsische Bildungsserver NiBiS weist z. B. für eigene Redaktionsinhalte CC BY 4.0 aus, verweist aber ausdrücklich darauf, bei Partnerinhalten deren eigene Lizenz zu prüfen ([NiBiS bei WirLernenOnline](https://wirlernenonline.de/eduQuellen/nibis/)). Für die App heißt das: den amtlichen Kerncurriculum-Text (der Teil, der uns interessiert) getrennt von etwaigen Zusatzmaterialien behandeln.
- Solange die App nur der eigene Haushalt nutzt, ist die Frage weitgehend akademisch. Sobald Inhalte an **fremde Nutzer:innen ausgeliefert** werden (auch nur als Prompt-Kontext, der in generierten Aufgaben resultiert, die andere Familien sehen), wird aus „private Nutzung" eine Verbreitung/Vervielfältigung gegenüber Dritten — die o. g. gemeinfreie Einordnung trägt das nach Sachstand, ist aber keine verbindliche Prüfung. **Vor einer Öffnung für fremde Familien: urheberrechtliche Prüfung durch Fachperson einholen**, insbesondere für Länder, deren Portale explizite Nutzungsbedingungen mit abweichenden Klauseln formulieren (das war in der verfügbaren Zeit nicht für alle 16 Länder einzeln zu verifizieren).

## 4. Datenschutz (DSGVO) — der wichtigste Befund für Multi-Family-Betrieb

Dies ist keine reine Lehrplanfrage, gehört aber zwingend in diesen Report, weil sie die Produktentscheidung „andere Familien zulassen" stärker prägt als jede Lehrplan-Detailfrage.

- **Haushaltsausnahme (Art. 2 Abs. 2 lit. c DSGVO):** gilt nur für ausschließlich persönliche/familiäre Zwecke. Wer als Anbieter die Plattform bereitstellt, über die Dritte (auch andere Privatpersonen) Daten verarbeiten, fällt nach herrschender Auffassung ohnehin nicht unter die Ausnahme — sobald Kinder fremder Familien die App nutzen, ist der Betreiber regulärer Verantwortlicher ([dr-datenschutz.de – Die Haushaltsausnahme der DSGVO](https://www.dr-datenschutz.de/die-haushaltsausnahme-der-dsgvo/)).
- **Einwilligung Minderjähriger (Art. 8 DSGVO):** Für Angebote der Informationsgesellschaft, die sich direkt an Kinder richten (ausdrücklich werden kindgerechte Lernplattformen als Beispiel genannt), gilt: eigene wirksame Einwilligung erst ab 16 Jahren; darunter ist die Einwilligung der/des Erziehungsberechtigten einzuholen, und der Anbieter muss angemessene Anstrengungen unternehmen, dies zu verifizieren ([dr-datenschutz.de – Einwilligung von Kindern](https://www.dr-datenschutz.de/anforderungen-an-die-einwilligung-von-kindern-nach-der-dsgvo/), [Art. 8 DSGVO Kommentar](https://www.activemind.legal/de/gesetze/dsgvo/artikel-8/)). Praktisch: Registrierungsprozess mit Verifizierung, dass ein Elternteil zustimmt — nicht trivial umzusetzen.
- **Auftragsverarbeitung mit dem KI-Anbieter (Art. 28 DSGVO):** Sobald Prompts mit Bezug zu einem konkreten Kind (Name, Klasse, Leistungsstand, ggf. Fehleranalyse) an ein KI-Modell gehen, braucht es einen AVV mit dem Anbieter; bei Anbietern außerhalb der EU/des EWR zusätzlich eine Übermittlungsgrundlage (Standardvertragsklauseln o. ä.) sowie – bei KI-spezifischen Diensten üblich – Zusatzklauseln wie „kein Training auf Nutzerdaten", Sub-Processor-Liste, Speicherfristen ([blckalpaca – AVV mit KI-Anbietern](https://blckalpaca.at/en/knowledge-base/ai-agents/deploy-ai-agents-gdpr-compliant/auftragsverarbeitung-art-28-ki-anbieter)).
- Weitere Punkte, die bei Multi-Family-Betrieb typischerweise anfallen: Informationspflichten (Art. 13/14), Löschkonzept für Kinderdaten, ggf. Datenschutz-Folgenabschätzung (Art. 35, da Verarbeitung von Kinderdaten in größerem Umfang ein Regelbeispiel ist).

**Einordnung:** Dieser Punkt ist praktisch bedeutsamer als die Lehrplan-Datenquelle — er entscheidet, ob „für fremde Familien öffnen" ohne größeren rechtlich-organisatorischen Umbau überhaupt machbar ist. Sachstand, keine Rechtsberatung — vor jeder Öffnung für fremde Familien zwingend mit Datenschutzbeauftragter/Fachanwalt/Fachanwältin klären.

## 5. Illustration: Niedersachsen, Gymnasium, Jahrgang 6 (Schuljahr 2026/27) und Ausblick Jahrgang 7

Dies dient als konkretes Beispiel dafür, wie ein Kerncurriculum aufgebaut ist und was sich daraus ableiten lässt — nicht als abschließende Stoffliste.

### 5.1 Struktur und aktueller Stand der niedersächsischen Kerncurricula

Niedersachsen formuliert seine Kerncurricula für die Sekundarstufe I traditionell **doppeljahrgangsweise** (5/6, 7/8, 9/10): Es werden erwartete Kompetenzen jeweils **am Ende** der Doppeljahrgangsstufe genannt, nicht pro Einzeljahrgang. Für Jahrgang 6 heißt das: Das Kerncurriculum beschreibt den **Zielzustand am Ende von Klasse 6** — das ist für uns vergleichsweise konkret greifbar, weil das Doppeljahrgangsband mit Klasse 6 abschließt.

Wichtige Aktualisierung, die genau die laufende Schuljahresplanung betrifft: Niedersachsen stellt seine Sek-I-Kerncurricula gerade von schulform-spezifischen Fassungen (Gymnasium/Realschule/Hauptschule getrennt, Stand 2015) auf **schulformübergreifende** Fassungen um:

- **Englisch:** Ein neues, schulformübergreifendes Kerncurriculum „Englisch für die Schulformen des Sekundarbereichs I" (Jahrgänge 5–10) wurde im Schulverwaltungsblatt (SVBl) Juni 2026 veröffentlicht und wird **zum 1. August 2026 verbindlich** — also exakt zum Start des aktuellen Schuljahres 2026/27 ([MK SVBl 06/2026](https://www.mk.niedersachsen.de/download/228993/MK_SVBl_06_26_Amtl.Teil_S.305-315_.pdf); bestätigt über Suchergebnis-Zusammenfassung, da Volltext technisch nicht abrufbar war — vor Einsatz in der App unbedingt gegenprüfen). Das alte, gymnasiumsspezifische Englisch-Kerncurriculum von 2015 ist damit voraussichtlich abgelöst.
- **Deutsch:** Ein analoges schulformübergreifendes Kerncurriculum Deutsch für Sek I befand sich zum Zeitpunkt der Recherche in der Anhörfassung (Oktober 2024) bzw. im Stellungnahmeverfahren (Philologenverband Niedersachsen, März 2025: [PHVN-Stellungnahme](https://www.phvn.de/wp-content/uploads/2025/03/PHVN_Stellungnahme_KC-Sek-I-Deutsch_schulformuebergreifend.pdf)). Ein bestätigtes Inkrafttretensdatum war in der verfügbaren Zeit nicht zu ermitteln — offen, siehe Abschnitt 7.
- **Mathematik:** Kein Hinweis auf eine unmittelbar bevorstehende schulformübergreifende Neufassung für Sek I gefunden; die 2015er-Gymnasialfassung scheint aktuell noch zu gelten, sicher bestätigen ließ sich das in der Recherchezeit aber nicht abschließend.

**Konsequenz für die App:** Gerade weil Niedersachsen mitten in einer Umstellung steckt, braucht die Curriculum-Datenbasis der App einen Versionsstand/Gültigkeitszeitraum pro Dokument — sonst besteht das Risiko, mit einem bereits abgelösten Kerncurriculum zu arbeiten.

### 5.2 Grobe Themenblöcke Ende Jahrgang 6 (Doppeljahrgang 5/6) — zur Orientierung, keine Vollabschrift

Aus Sekundärquellen (Kerncurriculums-Übersichten, Schulbuch-Jahresplanungen) lassen sich folgende Schwerpunktbereiche für das Ende der Doppeljahrgangsstufe 5/6 am Gymnasium grob rekonstruieren — im Detail unbedingt gegen das Originaldokument prüfen:

- **Deutsch:** Kompetenzbereiche Sprechen/Zuhören, Schreiben, Lesen/Umgang mit Texten und Medien, Sprache und Sprachgebrauch untersuchen; inhaltlich u. a. Erzählen (mündlich/schriftlich), einfache literarische Formen (Gedicht, Fabel, Jugendbuch), Rechtschreibung/Grammatik vertiefen, erste Sachtextarbeit, Medienkompetenz.
- **Mathematik:** Erweiterung der Zahlbereiche (Brüche, Dezimalzahlen), Grundrechenarten in neuen Zahlbereichen, Grundlagen Geometrie (Flächen, Winkel, Symmetrie), Umgang mit Größen, erste Datenauswertung/Diagramme.
- **Englisch:** Ausbau des Grundwortschatzes, grundlegende Zeitformen und Satzbau, mündliche und schriftliche Kommunikationssituationen, erste landeskundliche Bezüge (Großbritannien), zunehmend eigenständige Textproduktion.

### 5.3 Lässt sich daraus eine Wochen-Reihenfolge fürs Schuljahr ableiten? Nein — und das ist wichtig

Das Kerncurriculum legt **nur das Ziel am Ende der Doppeljahrgangsstufe** fest. Die **zeitliche Verteilung der Themen innerhalb der Doppeljahrgangsstufe legt laut Erlass die Fachkonferenz der jeweiligen Schule fest** — das steht so ausdrücklich im niedersächsischen Erlass „Die Arbeit in den Schuljahrgängen 5 bis 10 des Gymnasiums" (v. 23.6.2015): Der Fachkonferenz obliegt es, die Themen und die zeitliche Verteilung innerhalb der Doppeljahrgangsstufen festzulegen ([mk.niedersachsen.de – Erlass, per Suchergebnis-Snippel; Volltext technisch nicht abrufbar](https://www.mk.niedersachsen.de/download/98074/Erlass_Die_Arbeit_in_den_Schuljahrgaengen_5_bis_10_des_Gymnasiums_v._23.6.2015.pdf)). Das heißt: **„Was steht in der Woche X dran" lässt sich aus dem staatlichen Kerncurriculum grundsätzlich nicht ableiten** — jeder Versuch dazu wäre Spekulation, keine belastbare Ableitung.

Praktikable, tatsächlich belastbare Alternativen für die App:

1. **Schulinterne Arbeitspläne/Fachcurricula erfragen bzw. auf der Schulhomepage suchen.** Mehrere niedersächsische Gymnasien veröffentlichen ihre schulinternen Curricula/Stoffverteilungen tatsächlich öffentlich als PDF (Beispiele in der Recherche: Gymnasium am Wall Verden, Gymnasium Ulricianum Aurich, Gymnasium Rahlstedt) — das ist kein Landesstandard, sondern schulindividuelle Praxis, aber verbreitet genug, um es aktiv zu prüfen, wenn eine Familie ihre Schule angibt.
2. **Stoffverteilungspläne der Schulbuchverlage.** Klett und Cornelsen bieten zu ihren eingeführten Lehrwerken (z. B. „Deutsch kompetent", „Access", „Challenge") kostenlose Jahres-/Stoffverteilungspläne je Bundesland an, die die Kapitel des Buches auf Wochen/Halbjahre verteilen ([Klett – Stoffverteilungspläne](https://www.klett.de/lehrwerk/deutsch-kompetent-ausgabe-ab-2019/stoffverteilungsplaene), [Cornelsen – Stoffverteilungspläne Englisch](https://www.cornelsen.de/sortiment/stoffverteilungsplaene/englisch)). Das ist deutlich näher an „was passiert diese Woche" als das Kerncurriculum — vorausgesetzt, man kennt das eingeführte Lehrwerk der Schule.
3. **Direkt bei der Schule/Lehrkraft nachfragen** bzw. im Onboarding der App die Familie danach fragen, was aktuell im Unterricht behandelt wird — pragmatisch die zuverlässigste Quelle, aber nicht automatisierbar.

### 5.4 Ausblick Jahrgang 7 (Schuljahr 2027/28) — deutlich unschärfer

Jahrgang 7 eröffnet ein **neues** Doppeljahrgangsband (7/8). Das Kerncurriculum nennt hierfür Kompetenzen erst **am Ende von Jahrgang 8** als Zielzustand — für das einzelne Schuljahr 2027/28 kennt man damit nur die **Richtung** des Zweijahresziels, nicht die Jahresportion. Die Vorhersagbarkeit ist für Jahrgang 7 also strukturell geringer als für Jahrgang 6, unabhängig davon, wie gut man recherchiert: Es fehlt schlicht die im Kerncurriculum verankerte Zwischenmarke. Gleiches Muster gilt für jedes neu beginnende Doppeljahrgangsband in anderen Bundesländern mit vergleichbarer Systematik (z. B. NRW: „erwartete Kompetenzen am Ende der Klassen 6, 8, 10").

### 5.5 Zeitbezug: Herbstferien 2026 und Vorlauf bis zum ersten App-Einsatz

Die niedersächsischen Herbstferien 2026 liegen vom **12.10. bis 24.10.2026** (mehrere Kalenderquellen übereinstimmend: [kalenderpedia.de](https://www.kalenderpedia.de/ferien/ferien-niedersachsen-2026.html), [schulferien.eu](https://www.schulferien.eu/niedersachsen/ferienkalender-ni/)). Bei Schuljahresbeginn um den 12.08.2026 sind das rund acht Unterrichtswochen bis zum ersten App-Einsatz in den Ferien — es ist also plausibel erst der **Anfang** des Jahrgang-6-Stoffs behandelt, während der komplette Jahrgang-5-Stoff als Wiederholungsstoff zur Verfügung steht. Für den Herbstferien-Einsatz der App ist die Wiederholung von Jahrgang-5-Inhalten daher mindestens so relevant wie neuer Jahrgang-6-Stoff.

## 6. Fallstricke & Risiken

- **DSGVO-Umstellung von Privat- auf Multi-Family-Betrieb ist der größte Hebel** (Abschnitt 4) — ohne Einwilligungsprozess, AVV und Löschkonzept ist eine Öffnung für fremde Familien nicht seriös umsetzbar.
- **Kein bundesweites strukturiertes Datenformat** — jede neue Bundesland/Fach-Kombination bedeutet manuelle/KI-gestützte Ersterfassung plus laufende Pflege bei Novellierungen.
- **Niedersachsen ist gerade mitten in einer Kerncurriculum-Umstellung** (Englisch ab 1.8.2026 neu, Deutsch in der Warteschleife) — Gefahr, mit veralteten Dokumenten zu arbeiten, wenn nicht laufend gegen SVBl/Kultusministerium geprüft wird.
- **Lizenzfrage ist bei Begleitmaterial unsauberer** als beim amtlichen Kerncurriculum-Kerntext selbst — sauber trennen.
- **Kein KMK-Checkpoint für Klasse 6** (und die meisten Zwischenjahrgänge) — ein rein KMK-basierter Ansatz würde die Jahrgangsgranularität verlieren, die für ein Coaching-Tool eigentlich der Kern des Nutzens ist.
- **Kerncurriculum ≠ Wochenplan** — jede Ableitung von „was kommt nächste Woche dran" direkt aus dem Landeslehrplan wäre Spekulation; das muss im Produkt (Onboarding, Erwartungsmanagement gegenüber Eltern) klar kommuniziert werden.
- **Recherche-technische Einschränkung:** Viele Primärquellen (mk.niedersachsen.de, cuvo.nibis.de, nglv.de, lehrplannavigator.nrw.de, sogar kmk.org) waren in dieser Recherche nur über Suchmaschinen-Snippets, nicht per Volltextabruf zugänglich. Für den produktiven Aufbau der Curriculum-Datenbasis der App braucht es einen tatsächlichen Dokumentenabruf (Download/Scraping mit Erlaubnis), keine Snippet-basierte Erfassung.

## 7. Quellen (Auswahl, mit Abrufkontext)

- [KMK – Bildungsstandards in Deutschland](https://www.kmk.org/themen/qualitaetssicherung-in-schulen/bildungsstandards.html) — Herstellerangabe/amtlich, Suchergebnis 15.08.2026
- [KMK – Bildungsstandards Mathematik ESA/MSA 2022](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-ESA-MSA-Mathe.pdf) — amtlich
- [KMK – Bildungsstandards Mathematik Primarbereich 2022](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-Primarbereich-Mathe.pdf) — amtlich
- [Niedersächsisches Kultusministerium – SVBl 06/2026 (Kerncurriculum Englisch Sek I)](https://www.mk.niedersachsen.de/download/228993/MK_SVBl_06_26_Amtl.Teil_S.305-315_.pdf) — amtlich, nur über Suchergebnis-Snippet erschlossen
- [Niedersächsisches Kultusministerium – Kerncurriculum Deutsch für den Sekundarbereich I, Anhörfassung Okt. 2024](https://www.mk.niedersachsen.de/download/212300/Kerncurriculum_Deutsch_fuer_den_Sekundarbereich_I.pdf) — amtlich (Entwurf)
- [PHVN – Stellungnahme zum KC Sek-I-Deutsch schulformübergreifend, März 2025](https://www.phvn.de/wp-content/uploads/2025/03/PHVN_Stellungnahme_KC-Sek-I-Deutsch_schulformuebergreifend.pdf) — Verbandsstellungnahme
- [Niedersächsisches Kultusministerium – Erlass „Die Arbeit in den Schuljahrgängen 5–10 des Gymnasiums" v. 23.6.2015](https://www.mk.niedersachsen.de/download/98074/Erlass_Die_Arbeit_in_den_Schuljahrgaengen_5_bis_10_des_Gymnasiums_v._23.6.2015.pdf) — amtlich
- [LehrplanPLUS Bayern – Gymnasium 6 Deutsch](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/6/deutsch) / [Mathematik](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/6/mathematik) — amtlich
- [Bildungsplan BW – Klassen 5/6](https://www.bildungsplaene-bw.de/,Lde/LS/BP2016BW/ALLG/GYM/SPO/IK/5-6) — amtlich
- [Hessen Kultus – Kerncurricula Sekundarstufe I](https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/sekundarstufe-i-kerncurricula) — amtlich
- [Deutscher Bildungsserver – Lehrpläne der Bundesländer](https://www.bildungsserver.de/schule/lehrplaene-400-de.html) — Metaportal
- [WirLernenOnline – Vernetzte Curricula](https://wirlernenonline.de/vernetzte-curricula/) — Projektseite, Stand Recherche
- [DINI-AG-KIM – AMB-Metadatenprofil](https://dini-ag-kim.github.io/amb/draft/) — technische Spezifikation
- [FWU – SODIX/MUNDO](https://fwu.de/projekte/sodix-mundo/) — Herstellerangabe
- [JuraForum – § 5 UrhG Amtliche Werke](https://www.juraforum.de/gesetze/urhg/5-amtliche-werke) — Rechtsportal, unabhängig
- [ipwiki – Amtliche Werke](https://www.ipwiki.de/urheberrecht:amtliche_werke) — Rechtsportal
- [WirLernenOnline – NiBiS (Lizenzhinweis CC BY 4.0)](https://wirlernenonline.de/eduQuellen/nibis/) — Sekundärquelle
- [dr-datenschutz.de – Die Haushaltsausnahme der DSGVO](https://www.dr-datenschutz.de/die-haushaltsausnahme-der-dsgvo/) — Fachportal, unabhängig
- [dr-datenschutz.de – Anforderungen an die Einwilligung von Kindern nach der DSGVO](https://www.dr-datenschutz.de/anforderungen-an-die-einwilligung-von-kindern-nach-der-dsgvo/) — Fachportal
- [activeMind.legal – Art. 8 DSGVO](https://www.activemind.legal/de/gesetze/dsgvo/artikel-8/) — Fachportal
- [blckalpaca – Auftragsverarbeitung Art. 28 mit KI-Anbietern](https://blckalpaca.at/en/knowledge-base/ai-agents/deploy-ai-agents-gdpr-compliant/auftragsverarbeitung-art-28-ki-anbieter) — Fachportal
- [kalenderpedia.de – Ferien Niedersachsen 2026](https://www.kalenderpedia.de/ferien/ferien-niedersachsen-2026.html) und [schulferien.eu – Niedersachsen](https://www.schulferien.eu/niedersachsen/ferienkalender-ni/) — Ferienkalender, gegengeprüft
- [Klett – Stoffverteilungspläne Deutsch kompetent](https://www.klett.de/lehrwerk/deutsch-kompetent-ausgabe-ab-2019/stoffverteilungsplaene) / [Cornelsen – Stoffverteilungspläne Englisch](https://www.cornelsen.de/sortiment/stoffverteilungsplaene/englisch) — Herstellerangabe (Verlag)

## 8. Offene Punkte

- **Genaues Inkrafttretensdatum des neuen Kerncurriculums Deutsch Sek I Niedersachsen** war nicht abschließend zu ermitteln (Stand Recherche: Anhörfassung Okt. 2024, Stellungnahmen bis März 2025, kein bestätigtes SVBl-Datum gefunden). Klärung: direkt bei `mk.niedersachsen.de`/aktuellem SVBl nachsehen oder beim Kultusministerium anfragen.
- **Status Mathematik Sek I Niedersachsen** (ob/wann eine schulformübergreifende Neufassung kommt) konnte nicht sicher geklärt werden.
- **Volltext der amtlichen Kerncurriculum-PDFs** (Englisch neu 2026, Deutsch, Mathematik) war in dieser Recherche technisch nicht abrufbar (Domain-Sperren der Rechercheumgebung) — die inhaltlichen Aussagen zu Kompetenzen/Themen in Abschnitt 5.2 beruhen auf Sekundärquellen und sollten vor Übernahme in die App gegen das Originaldokument geprüft werden.
- **Urheberrechtliche Einordnung als amtliches Werk** ist Sachstand, keine verbindliche Prüfung — vor Öffnung für fremde Familien anwaltliche Prüfung je genutztem Bundesland empfohlen, insbesondere zu eventuell abweichenden Nutzungsbedingungen einzelner Länderportale (nicht für alle 16 Länder im Detail geprüft).
- **DSGVO-Bewertung** ist Sachstand, keine Rechtsberatung — vor Multi-Family-Launch zwingend Datenschutzbeauftragte/n bzw. Fachanwalt/Fachanwältin einbeziehen (insbesondere Einwilligungsprozess-Design, AVV-Texte mit dem konkret gewählten KI-Anbieter, ggf. DSFA).
- **Konkrete Stoffreihenfolge der Schule der Zwillinge** lässt sich nicht recherchieren, sondern nur durch Nachfrage bei der Schule oder über deren veröffentlichten schulinternen Arbeitsplan klären (siehe 5.3).
