# Lehrpläne in Deutschland als Datenquelle für den Ferien-Lerncoach

Auftrag: Prüfen, ob und wie sich Lehrplaninhalte strukturiert für die Aufgabengenerierung nutzen lassen — nicht nur für den eigenen Haushalt (Zwillinge, Klasse 6, Gymnasium, Niedersachsen), sondern grundsätzlich für Kinder anderer Familien, Bundesländer und Jahrgänge. Recherchestand: 15.08.2026.

**Hinweis zum Scope:** Das Datenschutzthema (DSGVO, Kinderdaten, Einwilligung, KI-API) wird in einem separaten Report behandelt: `docs/research/2026-08-15-datenschutz-dsgvo.md`. Dieser Report konzentriert sich auf die Curriculum-Datenlage und die urheberrechtliche Seite (§ 5 UrhG, Nutzungsbedingungen der Länderportale, OER-Lizenzen).

## Annahmen

- Der konkrete Fall „Zwillinge, Jahrgang 6, Gymnasium, Niedersachsen, Schuljahr 2026/27" dient als **Beispiel und Illustration**, nicht als Zielbild — die App soll grundsätzlich Bundesland × Schulform × Jahrgang × Fach beliebig abdecken können.
- Aktueller Nutzungsstand laut Auftraggeber: **ein zusätzliches Kind aus einer Nachbarfamilie, mit den Eltern abgestimmt** — also eine kleine, geschlossene, nicht-kommerzielle Nutzergruppe, keine offene Plattform. Die Lizenzbewertung in Abschnitt 3 ist auf diesen realistischen Fall zugeschnitten, mit Hinweis, was sich bei breiterer Verteilung oder Veröffentlichung des Repos ändern würde.
- Rechtliche Aussagen sind **Sachstand, keine verbindliche Beratung**. Vor einer Erweiterung über den engen, abgestimmten Kreis hinaus ist Fachpersonal (Urheberrecht) hinzuzuziehen.
- Technischer Hinweis zur Recherche: In meiner Umgebung waren die Domains der Landesministerien/-portale (u. a. `mk.niedersachsen.de`, `cuvo.nibis.de`, `nglv.de`, `schulentwicklung.nrw.de`, `bass.schule.nrw`, sogar `kmk.org`) für direkten Seitenabruf gesperrt (Egress-Proxy). Alle Aussagen zu Dokumentinhalten stützen sich daher auf Suchmaschinen-Snippets und Sekundärquellen (Schulhomepages, Verlage, Verbände), **nicht auf eigene Volltextprüfung der PDFs**. Das ist unten in „Offene Punkte" markiert und sollte vor Produktiveinsatz nachgeholt werden.

## 1. Empfehlung

**Es gibt keine bundesweite strukturierte oder maschinenlesbare Datenquelle für Lehrplaninhalte.** Die Realität sind 16 Länderportale mit PDF-/HTML-Dokumenten in je eigenem Format, Gliederungsschema und Aktualisierungsrhythmus — bestätigt durch die Initiative WirLernenOnline, die genau an diesem Problem arbeitet und offen sagt: „Almost no federal state has published its curricula in machine-readable format." Für eine App, die beliebige Bundesland/Schulform/Jahrgang/Fach-Kombinationen bedienen soll, bedeutet das: entweder (a) sich auf die bundesweiten KMK-Bildungsstandards als kleinsten gemeinsamen Nenner stützen — das funktioniert aber nur an drei Checkpoints (Ende Klasse 4, Ende Sek I/ESA-MSA, Abitur), **nicht** für Zwischenjahrgänge wie Klasse 6 —, oder (b) die Länder-PDFs einmalig (und bei Novellierungen erneut) selbst in ein eigenes Schema überführen, z. B. per KI-gestützter Extraktion mit menschlicher Prüfung. Priorität für den Start: die eigenen bereits recherchierten Bundesländer (Niedersachsen als Ausgangsfall) plus die einwohnerstärksten Länder (NRW, Bayern, Baden-Württemberg), dann bedarfsgetrieben erweitern.

**Lizenzrechtlich** ist der amtliche Kerncurriculum-Text selbst nach Sachstand unproblematisch: Er dürfte als amtliches Werk (§ 5 Abs. 1 UrhG) gemeinfrei sein und darf unverändert mit Quellenangabe genutzt werden — unabhängig davon, ob das für den eigenen Haushalt, einen abgestimmten Freundeskreis oder öffentlich geschieht, denn § 5 UrhG kennt keine Beschränkung auf Privatnutzung. **Vorsicht ist bei Zusatzmaterial geboten**, das kein amtliches Werk ist: Verlags-Stoffverteilungspläne, Schulbuchinhalte oder nicht klar lizenzierte Landesportal-Zusatzinhalte sind regulär urheberrechtlich geschützt. Diese für ein zweites Kind zu nutzen ist im engen, privat abgestimmten Rahmen unkritisch (Privatkopie-Charakter), sie aber **im Repo/Code fest einzubetten und dieses zu veröffentlichen, wäre ein realistisches Versehen mit echtem Risiko** — siehe Abschnitt 3.

**Datenschutz (DSGVO)** wird hier bewusst nicht vertieft — siehe separater Report. Kurzfassung: Sobald ein Kind außerhalb des eigenen Haushalts mitmacht, ist die Frage relevant und dort behandelt.

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
2. **Manuelle/KI-gestützte Ersterfassung der Länder-Kerncurricula in ein eigenes Schema** (z. B. JSON: Bundesland → Schulform → Fach → Doppeljahrgang → Kompetenzbereich → Themen). Aufwand: einmalig pro Bundesland/Fach überschaubar (Kerncurricula sind je 20–80 Seiten strukturierten Fließtexts, mit LLM-gestützter Extraktion plus manueller Stichprobenprüfung in wenigen Stunden pro Dokument machbar), laufender Pflegeaufwand bei Novellierungen (in Niedersachsen z. B. wird gerade Englisch neu gefasst, Deutsch ist in Überarbeitung — siehe Abschnitt 5). Realistischste Option für den Start mit 2–4 Bundesländern. Da die Kerncurricula amtliche Werke sind (Abschnitt 3), ist das Einpflegen des reinen Kerncurriculum-Textes in ein eigenes Schema lizenzrechtlich unproblematisch.
3. **Sich ganz auf schulinterne Stoffverteilung statt auf Landes-Kerncurricula stützen** (siehe Abschnitt 4.3) — deutlich feingranularer, aber nicht systematisch beschaffbar, sondern nur schulweise, und damit nicht skalierbar für „beliebige Familie meldet sich an". Achtung: schulinterne Arbeitspläne einzelner Schulen sind i. d. R. ebenfalls amtliche/dienstliche Dokumente der jeweiligen Schule und öffentlich einsehbar, wenn die Schule sie online stellt — das ist etwas anderes als Verlagsmaterial (siehe Abschnitt 3).

Empfehlung: Option 2 als Fundament (grobe Themen-/Kompetenzstruktur je Bundesland/Fach/Doppeljahrgang), Option 3 optional als Verfeinerung, wenn eine Familie ihre Schule/ihr Lehrwerk hinterlegt.

## 3. Lizenz/Nutzungsrechte — bewertet für den realistischen Fall (kleiner, abgestimmter Kreis)

**Ausgangslage:** Aktuell nutzt neben den eigenen Zwillingen ein Kind aus einer Nachbarfamilie die App, mit den Eltern abgestimmt. Das ist keine öffentliche Veröffentlichung, sondern ein kleiner, nicht-kommerzieller, geschlossener Kreis. Die folgende Bewertung ist auf diesen Fall zugeschnitten, mit Hinweis, was sich bei größerer Verbreitung ändert.

- **Amtlicher Kerncurriculum-Text:** Gesetze, Verordnungen, amtliche Erlasse und Bekanntmachungen genießen nach **§ 5 Abs. 1 UrhG** keinen Urheberrechtsschutz. Kerncurricula/Lehrpläne werden in der Fachliteratur überwiegend als amtliche Werke in diesem Sinn eingeordnet (behördlich erlassen, mit Rechtswirkung für Schulen) ([JuraForum – § 5 UrhG](https://www.juraforum.de/gesetze/urhg/5-amtliche-werke), [ipwiki – Amtliche Werke](https://www.ipwiki.de/urheberrecht:amtliche_werke)). Nutzungspflichten nach § 5 Abs. 2 UrhG: keine Änderung des Wortlauts bei Wiedergabe unverändert erlassener Werke, Quellenangabe bei Vervielfältigung (§ 62/63 UrhG). **Wichtig: Diese Gemeinfreiheit ist nicht auf Privatnutzung beschränkt** — sie gilt unabhängig von Nutzerkreis-Größe oder kommerziellem Charakter. Anzeigen des Kerncurriculum-Textes in der App und Verwendung als Prompt-Kontext für ein KI-Modell ist damit nach Sachstand unabhängig davon unproblematisch, ob nur die eigenen Kinder, das Nachbarkind oder später mehr Familien die App nutzen — solange der Text unverändert wiedergegeben und die Quelle genannt wird.
- **Nicht-amtliches Zusatzmaterial** (Verlags-Stoffverteilungspläne, Schulbuchinhalte, ggf. redaktionelle Landesportal-Inhalte) ist regulär urheberrechtlich geschützt und **nicht** von § 5 UrhG erfasst. Solche Inhalte für den privaten Gebrauch der eigenen Kinder plus eines eng abgestimmten Nachbarkindes zu nutzen, bewegt sich noch im Bereich, den man umgangssprachlich als „privaten Gebrauch" einordnen würde (vergleichbar der Privatkopie-Logik aus § 53 UrhG, die aber streng genommen für Vervielfältigungen zum eigenen Gebrauch gedacht ist und nicht beliebig auf Dritte skaliert) — eine belastbare rechtliche Einordnung dafür wurde in dieser Recherche nicht gefunden und sollte im Zweifel von einer Fachperson bestätigt werden.
- **NiBiS-Beispiel zur Einordnung von Landesportal-Material:** Der niedersächsische Bildungsserver weist für eigene Redaktionsinhalte CC BY 4.0 aus, verweist aber ausdrücklich darauf, bei Partnerinhalten deren eigene Lizenz zu prüfen ([NiBiS bei WirLernenOnline](https://wirlernenonline.de/eduQuellen/nibis/)). Das heißt: Landesportale sind selbst ein Flickenteppich aus gemeinfreiem amtlichem Text, eigenem CC-BY-Material und ggf. lizenzpflichtigem Partnermaterial — vor jeder Übernahme prüfen, welche Kategorie konkret vorliegt.
- **Das eigentliche Risiko liegt nicht in der aktuellen Nutzung, sondern in einer künftigen Veröffentlichung des Repos.** Ein Git-Repo, in dem irgendwann Verlagsmaterial (z. B. ein eingescannter oder abgetippter Stoffverteilungsplan von Klett/Cornelsen) oder nicht klar lizenziertes Landesportal-Zusatzmaterial fest eingebettet ist, würde bei Veröffentlichung des Codes eine unautorisierte öffentliche Zugänglichmachung fremder Werke bedeuten — unabhängig davon, ob die App selbst kommerziell ist. Der amtliche Kerncurriculum-Text selbst wäre davon nicht betroffen (siehe oben), wohl aber jedes Zusatzmaterial. **Praktische Konsequenz:** Wenn Zusatzmaterial ins Repo soll, klar trennen (z. B. eigenes, gitignored Verzeichnis für lizenzpflichtiges Material) und nur den amtlichen Kerncurriculum-Text in versionierten, öffentlich sichtbaren Dateien ablegen.
- Für eine spätere breitere Verteilung der App (viele fremde Familien, ggf. kommerziell) ändert sich an der Bewertung des amtlichen Kerncurriculum-Textes selbst wenig (§ 5 UrhG bleibt anwendbar), wohl aber wächst das Risiko bei Zusatzmaterial deutlich, weil „kleiner abgestimmter Kreis" als informelle Rechtfertigung dann nicht mehr trägt. **Vor einer solchen Erweiterung: urheberrechtliche Prüfung durch Fachperson einholen**, insbesondere zu eventuell abweichenden Nutzungsbedingungen einzelner Länderportale (nicht für alle 16 Länder im Detail geprüft).

## 4. Illustration: Niedersachsen, Gymnasium, Jahrgang 6 (Schuljahr 2026/27) und Ausblick Jahrgang 7

Dies dient als konkretes Beispiel dafür, wie ein Kerncurriculum aufgebaut ist und was sich daraus ableiten lässt — nicht als abschließende Stoffliste.

### 4.1 Struktur und aktueller Stand der niedersächsischen Kerncurricula

Niedersachsen formuliert seine Kerncurricula für die Sekundarstufe I traditionell **doppeljahrgangsweise** (5/6, 7/8, 9/10): Es werden erwartete Kompetenzen jeweils **am Ende** der Doppeljahrgangsstufe genannt, nicht pro Einzeljahrgang. Für Jahrgang 6 heißt das: Das Kerncurriculum beschreibt den **Zielzustand am Ende von Klasse 6** — das ist für uns vergleichsweise konkret greifbar, weil das Doppeljahrgangsband mit Klasse 6 abschließt.

Wichtige Aktualisierung, die genau die laufende Schuljahresplanung betrifft: Niedersachsen stellt seine Sek-I-Kerncurricula gerade von schulform-spezifischen Fassungen (Gymnasium/Realschule/Hauptschule getrennt, Stand 2015) auf **schulformübergreifende** Fassungen um:

- **Englisch:** Ein neues, schulformübergreifendes Kerncurriculum „Englisch für die Schulformen des Sekundarbereichs I" (Jahrgänge 5–10) wurde im Schulverwaltungsblatt (SVBl) Juni 2026 veröffentlicht und wird **zum 1. August 2026 verbindlich** — also exakt zum Start des aktuellen Schuljahres 2026/27 ([MK SVBl 06/2026](https://www.mk.niedersachsen.de/download/228993/MK_SVBl_06_26_Amtl.Teil_S.305-315_.pdf); bestätigt über Suchergebnis-Zusammenfassung, da Volltext technisch nicht abrufbar war — vor Einsatz in der App unbedingt gegenprüfen). Das alte, gymnasiumsspezifische Englisch-Kerncurriculum von 2015 ist damit voraussichtlich abgelöst.
- **Deutsch:** Ein analoges schulformübergreifendes Kerncurriculum Deutsch für Sek I befand sich zum Zeitpunkt der Recherche in der Anhörfassung (Oktober 2024) bzw. im Stellungnahmeverfahren (Philologenverband Niedersachsen, März 2025: [PHVN-Stellungnahme](https://www.phvn.de/wp-content/uploads/2025/03/PHVN_Stellungnahme_KC-Sek-I-Deutsch_schulformuebergreifend.pdf)). Ein bestätigtes Inkrafttretensdatum war in der verfügbaren Zeit nicht zu ermitteln — offen, siehe Abschnitt 7.
- **Mathematik:** Kein Hinweis auf eine unmittelbar bevorstehende schulformübergreifende Neufassung für Sek I gefunden; die 2015er-Gymnasialfassung scheint aktuell noch zu gelten, sicher bestätigen ließ sich das in der Recherchezeit aber nicht abschließend.

**Konsequenz für die App:** Gerade weil Niedersachsen mitten in einer Umstellung steckt, braucht die Curriculum-Datenbasis der App einen Versionsstand/Gültigkeitszeitraum pro Dokument — sonst besteht das Risiko, mit einem bereits abgelösten Kerncurriculum zu arbeiten.

### 4.2 Grobe Themenblöcke Ende Jahrgang 6 (Doppeljahrgang 5/6) — zur Orientierung, keine Vollabschrift

Aus Sekundärquellen (Kerncurriculums-Übersichten, Schulbuch-Jahresplanungen) lassen sich folgende Schwerpunktbereiche für das Ende der Doppeljahrgangsstufe 5/6 am Gymnasium grob rekonstruieren — im Detail unbedingt gegen das Originaldokument prüfen:

- **Deutsch:** Kompetenzbereiche Sprechen/Zuhören, Schreiben, Lesen/Umgang mit Texten und Medien, Sprache und Sprachgebrauch untersuchen; inhaltlich u. a. Erzählen (mündlich/schriftlich), einfache literarische Formen (Gedicht, Fabel, Jugendbuch), Rechtschreibung/Grammatik vertiefen, erste Sachtextarbeit, Medienkompetenz.
- **Mathematik:** Erweiterung der Zahlbereiche (Brüche, Dezimalzahlen), Grundrechenarten in neuen Zahlbereichen, Grundlagen Geometrie (Flächen, Winkel, Symmetrie), Umgang mit Größen, erste Datenauswertung/Diagramme.
- **Englisch:** Ausbau des Grundwortschatzes, grundlegende Zeitformen und Satzbau, mündliche und schriftliche Kommunikationssituationen, erste landeskundliche Bezüge (Großbritannien), zunehmend eigenständige Textproduktion.

### 4.3 Lässt sich daraus eine Wochen-Reihenfolge fürs Schuljahr ableiten? Nein — und das ist wichtig

Das Kerncurriculum legt **nur das Ziel am Ende der Doppeljahrgangsstufe** fest. Die **zeitliche Verteilung der Themen innerhalb der Doppeljahrgangsstufe legt laut Erlass die Fachkonferenz der jeweiligen Schule fest** — das steht so ausdrücklich im niedersächsischen Erlass „Die Arbeit in den Schuljahrgängen 5 bis 10 des Gymnasiums" (v. 23.6.2015): Der Fachkonferenz obliegt es, die Themen und die zeitliche Verteilung innerhalb der Doppeljahrgangsstufen festzulegen ([mk.niedersachsen.de – Erlass, per Suchergebnis-Snippet; Volltext technisch nicht abrufbar](https://www.mk.niedersachsen.de/download/98074/Erlass_Die_Arbeit_in_den_Schuljahrgaengen_5_bis_10_des_Gymnasiums_v._23.6.2015.pdf)). Das heißt: **„Was steht in der Woche X dran" lässt sich aus dem staatlichen Kerncurriculum grundsätzlich nicht ableiten** — jeder Versuch dazu wäre Spekulation, keine belastbare Ableitung.

Praktikable, tatsächlich belastbare Alternativen für die App:

1. **Schulinterne Arbeitspläne/Fachcurricula erfragen bzw. auf der Schulhomepage suchen.** Mehrere niedersächsische Gymnasien veröffentlichen ihre schulinternen Curricula/Stoffverteilungen tatsächlich öffentlich als PDF (Beispiele in der Recherche: Gymnasium am Wall Verden, Gymnasium Ulricianum Aurich, Gymnasium Rahlstedt) — das ist kein Landesstandard, sondern schulindividuelle Praxis, aber verbreitet genug, um es aktiv zu prüfen, wenn eine Familie ihre Schule angibt.
2. **Stoffverteilungspläne der Schulbuchverlage.** Klett und Cornelsen bieten zu ihren eingeführten Lehrwerken (z. B. „Deutsch kompetent", „Access", „Challenge") kostenlose Jahres-/Stoffverteilungspläne je Bundesland an, die die Kapitel des Buches auf Wochen/Halbjahre verteilen ([Klett – Stoffverteilungspläne](https://www.klett.de/lehrwerk/deutsch-kompetent-ausgabe-ab-2019/stoffverteilungsplaene), [Cornelsen – Stoffverteilungspläne Englisch](https://www.cornelsen.de/sortiment/stoffverteilungsplaene/englisch)). Das ist deutlich näher an „was passiert diese Woche" als das Kerncurriculum — vorausgesetzt, man kennt das eingeführte Lehrwerk der Schule. **Lizenzhinweis:** Diese Pläne sind Verlagsmaterial, kein amtliches Werk (siehe Abschnitt 3) — zur eigenen Orientierung nutzen, nicht unverändert ins Repo/die App einbetten oder weiterverteilen.
3. **Direkt bei der Schule/Lehrkraft nachfragen** bzw. im Onboarding der App die Familie danach fragen, was aktuell im Unterricht behandelt wird — pragmatisch die zuverlässigste Quelle, aber nicht automatisierbar.

### 4.4 Ausblick Jahrgang 7 (Schuljahr 2027/28) — deutlich unschärfer

Jahrgang 7 eröffnet ein **neues** Doppeljahrgangsband (7/8). Das Kerncurriculum nennt hierfür Kompetenzen erst **am Ende von Jahrgang 8** als Zielzustand — für das einzelne Schuljahr 2027/28 kennt man damit nur die **Richtung** des Zweijahresziels, nicht die Jahresportion. Die Vorhersagbarkeit ist für Jahrgang 7 also strukturell geringer als für Jahrgang 6, unabhängig davon, wie gut man recherchiert: Es fehlt schlicht die im Kerncurriculum verankerte Zwischenmarke. Gleiches Muster gilt für jedes neu beginnende Doppeljahrgangsband in anderen Bundesländern mit vergleichbarer Systematik (z. B. NRW: „erwartete Kompetenzen am Ende der Klassen 6, 8, 10").

### 4.5 Zeitbezug: Herbstferien 2026 (kurz)

Die niedersächsischen Herbstferien 2026 liegen vom **12.10. bis 24.10.2026** (mehrere Kalenderquellen übereinstimmend: [kalenderpedia.de](https://www.kalenderpedia.de/ferien/ferien-niedersachsen-2026.html), [schulferien.eu](https://www.schulferien.eu/niedersachsen/ferienkalender-ni/)). Bei Schuljahresbeginn um den 12.08.2026 sind das rund acht Unterrichtswochen bis zum ersten App-Einsatz in den Ferien — plausibel ist damit erst der Anfang des Jahrgang-6-Stoffs behandelt, während der komplette Jahrgang-5-Stoff als Wiederholungsstoff zur Verfügung steht.

## 5. Fallstricke & Risiken

- **Kein bundesweites strukturiertes Datenformat** — jede neue Bundesland/Fach-Kombination bedeutet manuelle/KI-gestützte Ersterfassung plus laufende Pflege bei Novellierungen.
- **Niedersachsen ist gerade mitten in einer Kerncurriculum-Umstellung** (Englisch ab 1.8.2026 neu, Deutsch in der Warteschleife) — Gefahr, mit veralteten Dokumenten zu arbeiten, wenn nicht laufend gegen SVBl/Kultusministerium geprüft wird.
- **Verlags-/Zusatzmaterial ist keine Gemeinfreiheit** — anders als der Kerncurriculum-Text selbst nicht unbedacht ins (potenziell später öffentliche) Repo einbetten.
- **Kein KMK-Checkpoint für Klasse 6** (und die meisten Zwischenjahrgänge) — ein rein KMK-basierter Ansatz würde die Jahrgangsgranularität verlieren, die für ein Coaching-Tool eigentlich der Kern des Nutzens ist.
- **Kerncurriculum ≠ Wochenplan** — jede Ableitung von „was kommt nächste Woche dran" direkt aus dem Landeslehrplan wäre Spekulation; das muss im Produkt (Onboarding, Erwartungsmanagement gegenüber Eltern) klar kommuniziert werden.
- **Recherche-technische Einschränkung:** Viele Primärquellen (mk.niedersachsen.de, cuvo.nibis.de, nglv.de, lehrplannavigator.nrw.de, sogar kmk.org) waren in dieser Recherche nur über Suchmaschinen-Snippets, nicht per Volltextabruf zugänglich. Für den produktiven Aufbau der Curriculum-Datenbasis der App braucht es einen tatsächlichen Dokumentenabruf (Download/Scraping mit Erlaubnis), keine Snippet-basierte Erfassung.
- **Datenschutz** ist bei Erweiterung über den eigenen Haushalt hinaus relevant — separat behandelt in `docs/research/2026-08-15-datenschutz-dsgvo.md`.

## 6. Quellen (Auswahl, mit Abrufkontext)

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
- [kalenderpedia.de – Ferien Niedersachsen 2026](https://www.kalenderpedia.de/ferien/ferien-niedersachsen-2026.html) und [schulferien.eu – Niedersachsen](https://www.schulferien.eu/niedersachsen/ferienkalender-ni/) — Ferienkalender, gegengeprüft
- [Klett – Stoffverteilungspläne Deutsch kompetent](https://www.klett.de/lehrwerk/deutsch-kompetent-ausgabe-ab-2019/stoffverteilungsplaene) / [Cornelsen – Stoffverteilungspläne Englisch](https://www.cornelsen.de/sortiment/stoffverteilungsplaene/englisch) — Herstellerangabe (Verlag)

## 7. Offene Punkte

- **Genaues Inkrafttretensdatum des neuen Kerncurriculums Deutsch Sek I Niedersachsen** war nicht abschließend zu ermitteln (Stand Recherche: Anhörfassung Okt. 2024, Stellungnahmen bis März 2025, kein bestätigtes SVBl-Datum gefunden). Klärung: direkt bei `mk.niedersachsen.de`/aktuellem SVBl nachsehen oder beim Kultusministerium anfragen.
- **Status Mathematik Sek I Niedersachsen** (ob/wann eine schulformübergreifende Neufassung kommt) konnte nicht sicher geklärt werden.
- **Volltext der amtlichen Kerncurriculum-PDFs** (Englisch neu 2026, Deutsch, Mathematik) war in dieser Recherche technisch nicht abrufbar (Domain-Sperren der Rechercheumgebung) — die inhaltlichen Aussagen zu Kompetenzen/Themen in Abschnitt 4.2 beruhen auf Sekundärquellen und sollten vor Übernahme in die App gegen das Originaldokument geprüft werden.
- **Belastbare rechtliche Einordnung der „kleiner abgestimmter Kreis"-Nutzung von Verlagsmaterial** (Abschnitt 3) wurde nicht gefunden — eine klare Aussage, ob/wie weit das über den reinen Eigengebrauch hinaus zulässig ist, sollte eine Fachperson bestätigen, bevor mehr als das eine abgestimmte Nachbarkind mitmacht.
- **Urheberrechtliche Nutzungsbedingungen einzelner Länderportale** wurden nicht für alle 16 Länder im Detail geprüft — vor Erweiterung auf weitere Bundesländer jeweils die konkreten Nutzungsbedingungen des Portals gegenlesen.
- **Konkrete Stoffreihenfolge der Schule der Zwillinge** lässt sich nicht recherchieren, sondern nur durch Nachfrage bei der Schule oder über deren veröffentlichten schulinternen Arbeitsplan klären (siehe 4.3).
