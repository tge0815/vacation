# Was Lern-Apps für 11–13-Jährige motivierend macht — und woran sie scheitern

Stand: 2026-08-16. Anlass: „Anton nicht so toll" (Beobachtung, keine Studie) trifft auf 6–9 %
Monats-Churn im Businessplan, dessen Hauptursache laut Branchenbenchmark „Kind verliert das
Interesse" (36 %) ist ([businessplan-unit-economics.md](/home/user/vacation/docs/research/2026-08-15-businessplan-unit-economics.md)).
Diese Recherche fragt gezielt: was **außer** mehr Gamification trägt Motivation — die
Rangliste-Frage ist laut Vorgängerreport ([marktanalyse-lernapps.md](/home/user/vacation/docs/research/2026-08-15-marktanalyse-lernapps.md))
bereits geklärt und bleibt hier unangetastet.

## Empfehlung

Die Evidenz zeigt ein konsistentes Muster: **Autonomie- und Kompetenzerleben tragen Motivation
zuverlässig, extrinsische Belohnungen tragen sie nur kurzfristig und können sie bei bereits
interessanten Aufgaben sogar untergraben (Korrumpierungseffekt) — am stärksten bei genau der Art
Belohnung, die am leichtesten zu bauen ist (Punkte fürs bloße Erscheinen).** Das Repo macht vieles
davon bereits richtig, ohne dass es explizit so benannt wurde: keine Ranglisten, leistungs- statt
teilnahmekontingente Coins, ein adaptiver Pfad mit echter Spaced-Repetition-Logik, erklärendes statt
wertendes Feedback. Die größten Hebel liegen nicht im Nachbau von Gamification, sondern in drei
konkreten, günstigen Korrekturen: dem harten Streak-Reset (bekannter Reibungspunkt, jetzt mit
Evidenz unterlegt), der zu groben Schwierigkeits-Totzone zwischen 41 % und 79 % Trefferquote, und
der Content-Kalibrierung auf „10–11 Jahre", obwohl die Nutzer 11–13 sind — letzteres ist über die
bereits im Vorgänger-Report dokumentierte `grade`-Lücke hinaus auch ein **Motivationsproblem**, nicht
nur ein Schwierigkeitsproblem: Elfährige am Übergang zur frühen Adoleszenz brauchen laut
Stage-Environment-Fit-Forschung *mehr* Autonomie und *weniger* kindliche Ansprache, nicht weniger.

## Annahmen

- Zielgruppe wie vom Auftrag vorgegeben: 11–13 Jahre, Gymnasium, freiwilliges häusliches Üben ohne
  Aufsicht — das ist entwicklungspsychologisch der Übergang in die frühe Adoleszenz, nicht mehr
  „Grundschulkind", was für mehrere Befunde unten den Ausschlag gibt.
- Die im Auftrag genannte Prämisse (keine sichtbaren Ranglisten/Vergleiche) wird nicht erneut
  geprüft, sondern als Randbedingung übernommen.
- Wo Primärquellen wegen blockierter Domains nicht per `WebFetch` erreichbar waren, wurde auf
  Suchmaschinen-Zusammenfassungen mit Zitat-Snippets zurückgegriffen — das ist an den betroffenen
  Stellen explizit vermerkt, nicht stillschweigend gleichgesetzt mit Primärquellen-Lektüre.

---

## 1. Motivationspsychologie: Selbstbestimmungstheorie und der Korrumpierungseffekt

### Autonomie, Kompetenz, soziale Eingebundenheit — was die Evidenz trägt

Eine aktuelle Meta-Analyse SDT-basierter Interventionen im Bildungskontext (36 Studien, 11.792
Teilnehmende, 137 Effektgrößen) findet **robuste Effekte für Autonomie-Förderung (g = 1,14) und
Kompetenz-Förderung (g = 0,48)** auf die intrinsische Motivation (g = 0,58, in
experimentellen/quasi-experimentellen Designs), aber **keinen signifikanten Effekt für soziale
Eingebundenheit** (g = 0,44, n.s.) ([Wang, Wang et al., Studies in Educational Evaluation](https://selfdeterminationtheory.org/wp-content/uploads/2024/06/2024_WangWangEtAl_MetaEdu.pdf) —
Fachartikel, unabhängige Meta-Analyse). Eine zweite, sehr große Meta-Analyse (144 Studien, ca.
79.000 Schüler:innen) findet **Kompetenzerleben als stärksten Prädiktor selbstbestimmter Motivation**,
vor Autonomie und vor Relatedness ([PMC-Meta-Analyse zu Need Support](https://pmc.ncbi.nlm.nih.gov/articles/PMC12276404/) —
Fachartikel).

**Einordnung für eine Solo-Lern-App ohne Klassenkontext:** Soziale Eingebundenheit ist damit der
SDT-Baustein, den eine Einzelkind-App strukturell am schwersten bedienen kann — und laut Evidenz auch
der, der am wenigsten zum Motivationseffekt beiträgt. Das relativiert den Reflex, „mehr Sozial-Feature"
zu bauen (Freunde, geteilte Fortschritte), zumal das laut Vorgänger-Report ohnehin die Vergleichsrisiken
zwischen Geschwistern reaktiviert. Der wirksame Hebel ist **Autonomie** (spürbare Wahlfreiheit, nicht
nur „du darfst" in der Copy) und **Kompetenzerleben** (die Erfahrung, tatsächlich besser zu werden —
was eine eng geführte Schwierigkeitssteuerung direkt liefert, siehe Abschnitt 2).

### Der Korrumpierungseffekt — wann Belohnungen schaden

Die Kernstudie ist die Meta-Analyse von Deci, Koestner & Ryan (1999, *Psychological Bulletin*, 128
Studien): **teilnahmekontingente Belohnungen** (Belohnung fürs bloße Mitmachen) untergraben die
freiwillige Wiederaufnahme der Tätigkeit am stärksten (d = −0,40), gefolgt von
**abschlusskontingenten** (d = −0,36) und am schwächsten **leistungskontingenten** Belohnungen
(d = −0,28) — Belohnung explizit für *gute* Leistung schadet also am wenigsten, ist aber immer noch
negativ. **Unerwartetes** Lob und reines verbales Feedback wirkten dagegen positiv (d = +0,33 auf
freiwillige Wiederaufnahme) ([Deci, Koestner & Ryan 1999/2001](https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf) —
Fachartikel/Meta-Analyse, Primärquelle). Wichtig für diese App: **tangible (materielle) Belohnungen
schadeten Kindern in der Meta-Analyse stärker als Studierenden** — die Zielgruppe ist also nicht die
robusteste Gruppe für dieses Risiko.

Die klassischen Ausgangsexperimente sind Deci (1971, Puzzle-Aufgabe: Gruppe mit Geldbelohnung verlor
danach messbar Interesse) und Lepper, Greene & Nisbett (1973, „Overjustification"-Experiment:
Kindergartenkinder, die fürs Malen — eine Tätigkeit, die sie zuvor freiwillig und gern taten — eine
erwartete Belohnung bekamen, malten danach seltener und schlechter als die unbelohnte Gruppe)
(zusammengefasst u.a. bei [Wikipedia/Sekundärquellen zum Korrumpierungseffekt](https://de.wikipedia.org/wiki/Korrumpierungseffekt) —
Primärstudien selbst nicht direkt abrufbar, WebFetch auf mehrere deutschsprachige Erklärseiten war
blockiert, daher hier über Suchmaschinen-Snippets rekonstruiert, nicht Volltext-geprüft).

**Wo die Evidenz umstritten ist — das muss ehrlich benannt werden:** Cameron & Pierce legten 1994
eine eigene Meta-Analyse vor, die zum Gegenschluss kam: negative Effekte seien selten und in der
Praxis leicht vermeidbar. Deci, Koestner & Ryan (1999) argumentierten, diese Gegen-Meta-Analyse sei
methodisch fehlerhaft; Lepper, Ryan/Deci und Kohn kritisierten sie ebenfalls scharf
([Cameron & Pierce 1994 / Debatten-Übersicht](https://pubmed.ncbi.nlm.nih.gov/22478353/) —
Fachartikel; [Debatten-Zusammenfassung Cortland](https://web.cortland.edu/andersmd/psy501/intrinsic.pdf)).
Der Streit ist über 25 Jahre alt und bis heute nicht endgültig beigelegt. **Meine Einordnung:** Für
die Fragestellung dieser App reicht die schwächere, aber breiter geteilte Aussage aus beiden Lagern:
Belohnungen sind bei Aufgaben mit **geringem** ursprünglichem Interesse eher unproblematisch bis
hilfreich (Schulübung fällt oft in diese Kategorie — kaum ein Kind übt Verbformen aus Leidenschaft),
schädlich werden sie vor allem, wenn sie **teilnahmekontingent, erwartet und materiell** sind und auf
eine Tätigkeit treffen, die für das einzelne Kind bereits reizvoll ist. Das ist relevant, weil manche
Kinder z. B. das Vorlese-Format oder ein bestimmtes Fach durchaus gern mögen — für die ist das Risiko
real, für andere kaum.

**Direkte Konsequenz für Punktesysteme:** Ein Coin-System ist am wenigsten riskant, wenn es (a) an
**Leistung** hängt, nicht ans bloße Öffnen der App, (b) **nicht überraschend groß/variabel** ist
(siehe Abschnitt 3 zu Zufallsbelohnungen), und (c) nicht die einzige oder dominante Rückmeldung ist,
sondern Feedback zur Sache (Erklärung, warum etwas richtig/falsch war) im Vordergrund steht. Das
Repo trifft zwei von drei dieser Bedingungen bereits (siehe Abschnitt 6).

---

## 2. Flow und Schwierigkeitssteuerung — die 85-%-Faustregel

Csikszentmihalyis Flow-Modell postuliert eine schmale Diagonale zwischen Langeweile (Fähigkeit >
Herausforderung) und Überforderung/Angst (Herausforderung > Fähigkeit); vier Bedingungen müssen
gleichzeitig erfüllt sein: klares Ziel, unmittelbares Feedback, passende Schwierigkeit, minimale
Störung ([Flow-Theorie-Überblick](https://mlpp.pressbooks.pub/mavlearn/chapter/flow-theory/) —
Lehrbuch-Sekundärquelle, keine Primärstudie). Das ist seit Jahrzehnten Konsens, aber qualitativ —
für eine konkrete Umsetzung fehlte lange ein Zielwert.

**Die konkreteste verfügbare Zahl:** Wilson et al. (2019, *Nature Communications*) leiten formal her,
dass für gradientenbasierte Lernalgorithmen die **optimale Trainings-Erfolgsquote bei rund 85 %**
liegt (Fehlerquote ≈ 15,87 %) — der Punkt, an dem der Lernfortschritt pro Durchgang am schnellsten
ist ([Wilson et al. 2019](https://www.nature.com/articles/s41467-019-12552-4) — Fachartikel,
Primärquelle; Zugriff über Suchmaschinen-Zusammenfassung, WebFetch auf nature.com und PMC war
blockiert). **Wichtige Einschränkung, die in der populären Berichterstattung oft unter den Tisch
fällt:** Das Ergebnis ist formal für eine breite Klasse von Lernalgorithmen (u. a. binäre
Klassifikationsaufgaben) hergeleitet und mit Tier-Lernexperimenten (nicht direkt mit
Schulkind-RCTs zu Matheaufgaben) abgeglichen worden. Es ist eine **mathematisch plausible, gut
zitierte Faustregel**, aber **keine direkt an 11–13-jährigen Gymnasiast:innen geprüfte
pädagogische Norm**. Ich behandle „ca. 80–85 % Trefferquote als Zielband" deshalb als **starke
Heuristik**, nicht als bewiesenen Fixwert — konsistent mit dem älteren, unscharferen Konzept der
„Zone der proximalen Entwicklung" (Vygotski), das dieselbe Grundaussage seit Jahrzehnten stützt,
ohne eine Zahl zu liefern.

**Praktische Implikation:** Adaptive Systeme sollten die Schwierigkeit so nachführen, dass die
*rollierende* Trefferquote pro Thema in der Nähe von 80–85 % bleibt — spürbar über „nur nicht 0 %
oder 100 %", aber ohne den Anspruch, dass 85 % eine geprüfte Punktlandung für Elfjährige in
Deutsch-Grammatik ist.

---

## 3. Was Gamification wirklich leistet — Mechanik für Mechanik

**Gesamtbild zuerst:** Die größte verfügbare Meta-Analyse zu Gamification im Bildungskontext
(Sailer & Homner 2020, *Educational Psychology Review*) findet kleine bis moderate Effekte auf
kognitive Lernergebnisse (g = 0,49, **stabil** auch in methodisch strengen Studien), motivationale
(g = 0,36) und Verhaltens-Ergebnisse (g = 0,25, **beide weniger stabil** — schrumpfen in strengeren
Studien). Entscheidend: **der Effekt hängt an den konkreten Elementen** — reine
Belohnungs-/Status-Mechaniken (Punkte, Badges, Ränge) allein sind deutlich schwächer als Designs mit
echter Herausforderung, sinnvollen Zielen und Narrativ
([Sailer & Homner 2020](https://eric.ed.gov/?id=EJ1245270) — Fachartikel, Meta-Analyse; Volltext
über link.springer.com war blockiert, hier über ERIC-Zusammenfassung). Ein systematischer Review
(Hamari, Koivisto & Sarsa 2014) kommt zu einem ähnlichen Bild: 62,5 % der geprüften Fallstudien
berichten positive Effekte, aber mit erheblichen methodischen Schwächen (kleine Stichproben, kurze
Zeiträume, fehlende Kontrollgruppen) — „es kommt stark auf Kontext und Nutzer an", kein
Automatismus ([Hamari et al. 2014](https://www.researchgate.net/publication/256743509_Does_Gamification_Work_-_A_Literature_Review_of_Empirical_Studies_on_Gamification) —
Fachartikel/Konferenzbeitrag).

Mechanik für Mechanik:

| Mechanik | Belegte Wirkung | Bewertung |
|---|---|---|
| **Punkte/Coins, leistungskontingent** | Kleine bis moderate Effekte auf Motivation, wenn an Leistung statt Teilnahme gekoppelt (siehe Abschnitt 1); Effekt schwächt sich ohne begleitende Herausforderung/Narrativ deutlich ab | Sinnvoll, aber nicht als Haupt-Antrieb — als Nebenprodukt guter Aufgaben, nicht als Ersatz dafür |
| **Badges/Abzeichen** | Eine Studie: „did not affect academic performance", wurde aber von Schüler:innen positiv als Motivationsanreiz wahrgenommen; teils wussten Schüler:innen nicht mal, dass es sie gab ([SAGE 2024 Studie](https://journals.sagepub.com/doi/10.1177/10468781241237389) — Fachartikel) | Wirkungslos auf Lernergebnis, harmlos, aber auch kein Hebel — geringe Priorität |
| **Ranglisten/Leaderboards** | Laut Vorgänger-Report didaktisch riskant zwischen Kindern; ein Vergleich Badges vs. Leaderboards in physikalischen Online-Kursen zeigte je nach Kontext unterschiedliche Effekte auf Leistung ([Springer-Vergleichsstudie](https://link.springer.com/article/10.1007/s10639-022-10983-z) — Fachartikel, Volltext nicht abrufbar, nur Titel/Metadaten geprüft) | **Bewusst nicht bauen** (bereits Beschluss aus Vorgänger-Report) |
| **Level/Stufen** | Kein dediziert belastbarer Einzelbefund gefunden; wirkt v. a. über den Goal-Gradient-Effekt (siehe unten), wenn sichtbar nah am nächsten Level | Als Fortschritts-Framing sinnvoll, keine eigenständige Wirkung ohne das darunterliegende Fortschrittssignal |
| **Avatare/Personalisierung** | Mehrere Studien: Avatar-Anpassung erhöht Autonomie-Erleben, Identifikation, Spielzeit; eine Studie im Bildungsspielkontext berichtet sogar verbesserte Lernergebnisse durch höheres Engagement ([Cyberpsychology-Studie](https://cyberpsychology.eu/article/view/4340), [ScienceDirect-Studie zu Autonomie/Kontrolle](https://www.sciencedirect.com/science/article/abs/pii/S0747563215001090) — beide Fachartikel, kleinere Stichproben, nicht so breit repliziert wie SDT-Kernbefunde) | Mechanistisch plausibel (bedient echtes Autonomiebedürfnis), moderate Evidenz — günstige Option, kein Muss |
| **Fortschrittsbalken/-ringe** | Goal-Gradient-Effekt (Kivetz, Urminsky & Zheng 2006, *Journal of Marketing Research*): Anstrengung/Motivation steigt nachweislich, je näher das Ziel rückt; „Endowed Progress"-Effekt (Nunes & Drèze 2006) verstärkt das durch einen geschenkten Vorsprung ([Kivetz et al. 2006](https://www.researchgate.net/publication/239776073_The_Goal-Gradient_Hypothesis_Resurrected_Purchase_Acceleration_Illusionary_Goal_Progress_and_Customer_Retention) — Fachartikel) | **Gut belegt, billig zu bauen, im Repo bereits vorhanden** (siehe Abschnitt 6) |
| **Zufalls-/Überraschungsbelohnungen (Lootbox-artig)** | Variable-Ratio-Verstärkung erzeugt nachweislich hohe Bindung, ist aber mit Glücksspiel-Mechanik verwandt; systematische Übersichtsarbeit findet Zusammenhänge zwischen Lootbox-Nutzung und Problemglücksspiel/-gaming, regulatorische Verfahren (u. a. FTC vs. Epic) richten sich explizit gegen solche Mechaniken bei Minderjährigen ([PLOS One Scoping Review](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0263177) — Fachartikel, systematischer Review) | **Aktiv vermeiden** — ethisch das riskanteste Element der ganzen Liste, gerade bei Kindern |
| **Streaks** | Siehe eigener Abschnitt unten | Differenzierte Bewertung nötig, nicht pauschal gut oder schlecht |

### Streaks — der Sonderfall

Streaks binden nachweislich: Duolingo selbst berichtet (Sekundärquellen, keine unabhängige Prüfung
möglich, da Zahlen aus Marketing-/PM-Blogs stammen, nicht aus einer veröffentlichten Studie) eine
3,6-fach höhere langfristige Bindung bei Nutzer:innen mit 7-Tage-Streak und eine 21%ige Reduktion des
Abbruchrisikos durch die „Streak-Freeze"-Funktion ([justanotherpm.com](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature),
[darewell.co](https://darewell.co/en/duolingo-streaks-retention-secret/) — beide Blog/Marketing,
**niedrige Verlässlichkeit**, keine Primärquelle bei Duolingo selbst gefunden). Der Mechanismus
dahinter ist Verlustaversion (Kahneman): Ein aufgebauter Streak fühlt sich als Besitz an, dessen
Verlust überproportional schmerzt. Genau das ist das Problem für ein Kinderprodukt: Verlustaversion
erzeugt Rückkehr-Verhalten über **Druck und Angst vor dem Verlieren**, nicht über Freude an der
Sache — das ist definitionsgemäß keine intrinsische, sondern eine kontrollierte Motivationsform
(SDT-Terminologie). Öffentliche Elternratgeber beschreiben das bei Duolingo explizit als Quelle von
Stress bei Kindern, sobald ein Tag verpasst wird (bereits im Vorgänger-Report
[marktanalyse-lernapps.md](/home/user/vacation/docs/research/2026-08-15-marktanalyse-lernapps.md)
zitiert). Duolingos eigene Reaktion — Streak-Freeze, Streak-Repair, zeitlich befristete
Wiederherstellungs-Events — ist ein Eingeständnis, dass die reine Verlustaversions-Mechanik ohne
Sicherheitsnetz zu hart ist.

**Einordnung:** Streaks sind kein Motivator, den man verbietet, sondern einer, dessen **Härte** man
dosiert. Ein Streak mit Gnadenfrist behält den Bindungseffekt bei ausgelassenen Tagen, verliert aber
die Verlustaversions-Spitze, die zu Stress und (bei zwei Kindern im selben Haushalt) zu
asymmetrischem Frust führt (eins krank, das andere nicht — bereits im Vorgänger-Report benannt).

---

## 4. Warum Kinder Anton & Co. konkret langweilig finden — qualitative Hinweise

**Wichtig vorab:** Alles Folgende sind Aussagen aus Elternforen, Ratgeber-Blogs und
Erfahrungsberichten, aggregiert über Suchmaschinen-Snippets (mehrere Primärseiten — urbia.de,
gutefrage.net, web.de, apps.apple.com, check-app.de, trusted.de — waren über den Recherche-Proxy
blockiert und konnten nicht per `WebFetch` im Volltext geprüft werden). Das ist **keine
repräsentative Erhebung**, sondern ein Stimmungsbild aus Zufallsfunden, an dem sich Muster ablesen
lassen, keine Häufigkeiten.

Konkret berichtete Kritikpunkte an Anton (und sinngemäß vergleichbaren Drill-Apps):

- **Wiederholungs-Monotonie bei gleichem Interaktionsmuster:** Eltern berichten, Kinder empfänden
  Aufgaben als sich wiederholend, weil im Kern immer dieselbe Handlung verlangt wird (z. B. „ein
  Wort anklicken"), unabhängig vom Fachinhalt — die Aufgabe *fühlt* sich gleich an, auch wenn der
  Stoff wechselt.
- **Gefühl, nie fertig zu werden:** Manche Aufgaben(-serien) werden als so lang empfunden, dass
  Kinder das Gefühl hatten, „nie fertig zu werden" — ein Hinweis auf fehlende sichtbare
  Fortschritts-/Endpunkt-Signale innerhalb einer Aufgabenserie, nicht nur global.
- **Belohnung verzerrt Aufgabenwahl:** Mehrfach genannte Sorge (Eltern, auch medienpädagogische
  Stimmen): Kinder wählen bevorzugt leichte Aufgaben, um schnell Coins zu sammeln, statt sich fachlich
  zu fordern — ein direktes Beispiel für den Korrumpierungseffekt in freier Wildbahn: Die Belohnung
  verschiebt das Ziel von „etwas lernen" zu „Punkte farmen".
- **Auswendiglernen statt Verstehen:** Berichtet wird, dass Kinder bei Wiederholungsaufgaben eher
  Antwortmuster memorieren als den Inhalt zu verstehen — ein Hinweis, dass reine
  Wiederholungs-Drill-Formate ohne Kontextwechsel Verstehen nicht erzwingen.
- **Sucht-/Kompulsions-Sorge von Fachpersonen:** Eine Quelle referenziert einen „Suchtexperten", der
  vor Mechanismen in Lern-Apps wie Anton warnt (Titel/Snippet legt Warnung vor
  Belohnungs-/Coin-Mechaniken nahe; Inhalt der Primärquelle über den Proxy nicht erreichbar, daher
  hier bewusst zurückhaltend als Hinweis, nicht als geprüfte Aussage wiedergegeben).
- **Widerspruch in den Quellen:** Andere Berichte loben ausdrücklich die Aufgabenvielfalt als
  Gegenmittel gegen Monotonie. Das deutet darauf hin, dass die Erfahrung stark vom **Fach/Thema**
  und vom **individuellen Kind** abhängt, nicht von einem pauschalen App-Mangel — konsistent mit der
  SDT-Aussage, dass Autonomie (Wahlfreiheit, welches Format/Thema) der Hebel ist, nicht ein
  universelles Content-Problem.
- **Multisensorik fehlt:** Medienpädagogische Stimmen betonen, dass Kinder im entsprechenden Alter
  auch handschriftlich/körperlich lernen sollten — ein Tablet-Format kann das strukturell nicht
  ersetzen. Für eine reine Software-App ist das kein lösbares Produktproblem, aber ein ehrlicher
  Hinweis, dass „mehr Engagement in der App" nicht das einzige relevante Ziel ist.

**Fazit dieses Abschnitts:** Kein einziger gefundener Kritikpunkt lautete „zu wenig Gamification"
oder „zu wenig Punkte". Die durchgängigen Themen sind **Wahlfreiheit, Format-Abwechslung,
Belohnungsverzerrung der Aufgabenwahl** und **Verstehen vs. Auswendiglernen** — deckt sich exakt mit
den SDT-/Korrumpierungs-Befunden aus Abschnitt 1.

Sources dieser qualitativen Recherche (alle über Suchmaschinen-Aggregation, Primärtext teils nicht
prüfbar): [check-app.de – Anton-Kritik](https://www.check-app.de/2026/03/03/anton-app-kritik-macht-sie-kinder-suechtig/),
[urbia.de-Forum](https://www.urbia.de/forum/6-kids-schule/5416632-anton-app-erfahrungen),
[gostudent.org – Anton im Test](https://insights.gostudent.org/die-lern-app-anton-im-test),
[web.de – Suchtexperte warnt](https://web.de/magazine/ratgeber/kind-familie/lern-apps-anton-motivieren-kinder-suchtexperte-warnt-35881144),
[gutefrage.net-Thread](https://www.gutefrage.net/frage/koennt-ihr-die-lernapp-antonoder-aehnliches-empfehlen),
[trusted.de – Anton-Test](https://trusted.de/anton).

---

## 5. Was gut gemachte Beispiele anders machen — Duolingo als Hauptfall

Duolingo ist der am besten untersuchte Fall, weil das Unternehmen selbst Effizienz-Studien
veröffentlicht und weil unabhängige Forschung dazu existiert. Zwei Befunde sind für diese App
zentral:

1. **Engagement ≠ Lernerfolg, empirisch belegt:** Eine unabhängige Studie fand **keinen
   signifikanten Zusammenhang zwischen fortgesetztem Engagement/wahrgenommener Wirksamkeit und
   tatsächlichem Lernerfolg** ([Language Learning & Technology 2024](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/ea47a53e-da6e-4419-bd55-e72b458294f4/content) —
   Fachartikel). Duolingo ist gleichzeitig nachweislich wirksam für Grundwortschatz und
   Leseverständnis auf Anfängerniveau, aber schwächer für höhere Sprachkompetenzen (Sprechen,
   Schreiben, komplexe Kommunikation) — die Gamification trägt die Breitenwirkung, nicht die Tiefe.
2. **Design-Bausteine, die tatsächlich übertragbar sind:**
   - **Sofortiges Feedback nach jedem Einzelitem**, nicht erst am Ende einer Serie — reduziert die
     „fühlt sich endlos an"-Kritik aus Abschnitt 4 strukturell.
   - **Kurze Lern-Einheiten** (5–10 Minuten), die ein klares Abschluss-Gefühl erzeugen — direkter
     Bezug zum Goal-Gradient-Effekt.
   - **Adaptive Itemschwierigkeit** über einen laufenden Algorithmus („Birdbrain"), nicht über
     manuelle Stufenwahl — strukturell vergleichbar mit `nextDifficulty()` im Repo.
   - **Streak mit Sicherheitsnetz** (Freeze/Repair) statt hartem Reset — siehe Abschnitt 3.
   - **Opt-out aus sozialem Vergleich** (privates Profil, Ligen abschaltbar) — bestätigt indirekt die
     Position des Vorgänger-Reports: sozialer Vergleich ist so riskant, dass selbst der Anbieter, der
     ihn einsetzt, einen Fluchtweg eingebaut hat.

**Was sich NICHT überträgt — und warum das wichtig ist:**
- Duolingos Geschäftsmodell (Werbung/Abo, Umsatz hängt an **Sitzungshäufigkeit**) erzeugt einen
  Anreiz, Nutzung zu maximieren, nicht Lernerfolg pro Zeiteinheit. Diese App hat dieses Interesse
  nicht — die Eltern zahlen nicht pro Session, sie wollen ein Tagesziel erfüllt und dann Ruhe. Ein
  Kern-Duolingo-Mechanismus (aggressive Push-Notifications, teils als „guilt-tripping" kritisiert,
  z. B. die traurige Eule bei Inaktivität) ist für ein Kinderprodukt ohne Aufsicht **ethisch nicht
  vertretbar** und sollte bewusst nicht kopiert werden.
- Vokabel-Drill (Duolingos Kernformat) ist strukturell wiederholungsfreundlich; Mathe-Textaufgaben,
  Aufsatzformulierung oder Lesekompetenz lassen sich nicht in derselben Bite-Size-MC-Logik abbilden,
  ohne genau die von Anton-Kritiker:innen bemängelte Format-Monotonie zu reproduzieren.
- Duolingos Zielgruppe ist überwiegend erwachsen und selbstmotiviert (Sprache lernen aus eigenem
  Antrieb); die Zielgruppe hier ist minderjährig und übt größtenteils **nicht** aus freiem
  Fachinteresse, sondern weil Schule/Eltern es erwarten — die Ausgangslage für Korrumpierungseffekte
  ist dadurch grundsätzlich anders (siehe Abschnitt 1: geringes Ausgangsinteresse macht Belohnung
  eher unproblematisch als bei Duolingos „Hobby-Lerner:innen").

---

## 6. Konkrete Ableitungen für das Repo

Geprüfte Dateien: `src/lib/db/repo.ts`, `src/lib/ai/prompts.ts`, `src/lib/ai/exercises.ts`,
`src/app/api/path/route.ts`, `src/components/kid/{KidToday,KidPath,ExercisePlayer,RewardShop}.tsx`.

### Was heute schon gut gelöst ist (nicht anfassen, nur bewusst machen)

- **Leistungs- statt teilnahmekontingente Coins:** `awardCorrectCoins()` in `repo.ts` (Z. 522–547)
  vergibt Coins pro 10 **richtigen** Antworten am Tag, nicht fürs bloße Öffnen der App. Das ist
  laut Deci/Koestner/Ryan (1999) exakt der am wenigsten schädliche Belohnungstyp (d = −0,28 statt
  −0,40 bei Teilnahme-Belohnung).
- **Fester Kurs statt Zufall:** Die Coin-Vergabe ist deterministisch (10 richtig = 1 Coin), kein
  Zufallselement — vermeidet die Lootbox-Problematik aus Abschnitt 3 komplett, ohne dass das je
  bewusst so benannt wurde.
- **Goal-Gradient-Umsetzung vorhanden:** Fortschrittsringe pro Fach (`KidToday.tsx`) und
  Fortschrittsbalken in `ExercisePlayer.tsx`/`KidToday.tsx` sind exakt der belegte Mechanismus aus
  Abschnitt 3 — bereits eingebaut, nicht neu zu erfinden.
- **Echte Spaced-Repetition-Logik, nicht nur Behauptung:** `src/app/api/path/route.ts` (Z. 90–97)
  berechnet ein Wiederholungsintervall aus der 14-Tage-Trefferquote (`acc >= 0.85` → 3 Tage,
  `>= 0.70` → 2 Tage, sonst 1 Tag) — bemerkenswert nah an der 85-%-Heuristik aus Abschnitt 2, ohne
  dass dort erkennbar bewusst danach designt wurde. Zusätzlich gibt es eine Schwächen-Erkennung pro
  Thema (`weakTopicId`) und eine rotierende „Kür"-Etappe (`variety`) — das ist didaktisch
  überdurchschnittlich für den Umfang des Projekts.
- **Erklärendes statt wertendes Feedback:** `gradeSystemPrompt()` in `prompts.ts` verlangt explizit
  „erkläre kurz und einfach, warum" bei Fehlern, nicht nur „falsch". Das ist näher an
  Prozess-Feedback (Dweck) als an reinem Ergebnis-Lob und vermeidet die reine Bewertungssprache.
- **Autonomie-Copy bereits vorhanden:** `KidPath.tsx` formuliert explizit „Der Fuchs schlägt dir eine
  Reihenfolge vor – du darfst aber frei wählen, wo du anfängst" und `KidToday.tsx`: „Du darfst
  jederzeit freiwillig weiterüben – jedes Fach ist offen." Sprachlich ist das SDT-konform.
- **Streak wird bei 0 nicht prominent gezeigt** (`prog.streak > 0` in `KidToday.tsx`, Z. 96) — kleine,
  aber echte Milderung: ein gebrochener Streak wird nicht als große rote „0" ausgestellt, sondern
  verschwindet einfach. Reduziert den Verlustaversions-Trigger, ohne dass das Problem strukturell
  gelöst wäre.
- **Kein sozialer Vergleich im Kind-UI** (bestätigt erneut, siehe Vorgänger-Report).

### Was fehlt, das die Evidenz stützt (priorisiert nach Wirkung/Aufwand)

1. **Streak-Gnadenfrist — hohe Wirkung, geringer Aufwand.** `currentStreak()` in `repo.ts`
   (Z. 402–417) resettet bei einer Lücke hart auf 0. Abschnitt 3 zeigt: das ist der Teil der
   Streak-Mechanik, der laut Elternratgebern Stress statt Motivation erzeugt, und Duolingos eigene
   Reaktion (Freeze/Repair) ist ein Eingeständnis, dass das nötig ist. Konkret: ein „Frei-Tag" pro
   Woche, der den Streak nicht bricht, wäre eine kleine Funktionsänderung mit direktem Bezug zum
   Haupt-Churn-Treiber „Kind verliert Interesse" aus dem Businessplan. **War bereits im
   Vorgänger-Report als Empfehlung notiert — hier zusätzlich mit der Verlustaversions-/Streak-Evidenz
   unterlegt, keine neue Erkenntnis, aber jetzt besser begründet.**
2. **Schwierigkeits-Totzone schließen — mittlere Wirkung, geringer Aufwand.** `nextDifficulty()` in
   `exercises.ts` (Z. 38–49) erhöht die Schwierigkeit nur bei ≥ 80 % Trefferquote und senkt sie nur
   bei ≤ 40 % — dazwischen (41–79 %) passiert **nichts**, obwohl das laut Abschnitt 2 bereits ein
   breiter Bereich ist, in dem ein Kind spürbar zu leicht (60–70 % wäre für die 85-%-Heuristik schon
   im Frust-Bereich, wenn die Zielgruppe eigentlich Erfolg gewöhnt ist) oder zu schwer liegen kann.
   Konkrete Änderung: Absenkschwelle auf z. B. ≤ 60 % anheben, damit die Spanne enger um das
   80–85-%-Zielband liegt.
3. **Klassenstufe/Alterston nicht an Prompts gekoppelt — bereits bekannt, hier motivational
   verschärft.** `TUTOR_BASE` in `prompts.ts` ist fest auf „ca. 10-11 Jahre" verdrahtet, obwohl die
   Zielgruppe laut Auftrag 11–13 Jahre ist und `users.grade` ungenutzt bleibt (Kernbefund des
   Vorgänger-Reports). Die motivationale Ergänzung dazu: Der Übergang in die frühe Adoleszenz
   (Stage-Environment-Fit-Forschung, Eccles) geht mit **wachsendem Autonomiebedürfnis** und
   sinkender Toleranz für kindliche Ansprache einher — ein Tonfall, der für 10-Jährige kalibriert
   ist, kann sich für 12-/13-Jährige „kindisch" und damit demotivierend anfühlen, unabhängig vom
   Schwierigkeitsgrad. Das ist ein zusätzlicher, eigenständiger Grund, diesen Fix zu priorisieren,
   nicht nur der bereits dokumentierte Skalierungsgrund.
4. **Echte Themenwahl statt nur Reihenfolge-Wahl — mittlere Wirkung, mittlerer Aufwand.** Die
   „Wahlfreiheit" in `KidPath.tsx` betrifft nur, in welcher Reihenfolge Pflicht-Etappen bearbeitet
   werden, nicht *welche* Etappen es sind (die wählt der Algorithmus in `path/route.ts` komplett
   selbst). Laut Abschnitt 1 ist Autonomie der am stärksten belegte SDT-Hebel (g = 1,14) — eine
   kleine Erweiterung, bei der das Kind gelegentlich zwischen zwei vom Algorithmus vorgeschlagenen
   Themen wählen darf (statt nur Reihenfolge), würde diesen Hebel direkter bedienen.
5. **Feedback-Formulierung auf Prozess statt Ergebnis schärfen — geringe Wirkung, sehr geringer
   Aufwand.** `gradeSystemPrompt()` verlangt „ermutigendes Feedback", aber keine explizite Anweisung,
   Anstrengung/Strategie statt Fähigkeit zu loben (Prozess- vs. Personen-Lob, Abschnitt 6a unten).
   Ein Satz Prompt-Ergänzung („Lobe die angewandte Strategie oder Anstrengung, nicht die
   Fähigkeit/Klugheit des Kindes") ist eine Ein-Zeilen-Änderung mit greifbarem didaktischem Nutzen.

### Was eingebaut ist, das laut Evidenz eher schadet (mit Einordnung, nicht Alarmismus)

- **Harter Streak-Reset** (siehe oben) — der klarste Fall. Direkt mit Evidenz (Verlustaversion,
  Duolingos eigene Kurskorrektur) unterlegter Reibungspunkt.
- **Spiele-Werkstatt als Freischaltung nach Pflichtprogramm** (`KidToday.tsx`,
  `werkstattUnlocked = allDone`): strukturell ein Premack-Prinzip („erst Pflicht, dann Kür"), kein
  klassischer Korrumpierungseffekt-Fall, weil die Belohnung (Spiele) nicht die Lerntätigkeit selbst
  ist. Der Risikopunkt ist eher **rhetorisch**: Die Copy „Erst deinen Weg heute schaffen … dann
  freigeschaltet" rahmt Lernen implizit als Hindernis vor dem eigentlich Schönen. Das ist kein
  Muss-Fix, aber ein Punkt, den man bei einer Text-Überarbeitung im Kopf behalten sollte — Eltern,
  die diese Struktur bewusst als Bildschirmzeit-Grenze wollen, ist das vermutlich ohnehin recht.
  **Kein eindeutiger Schadensbefund, eher ein Beobachtungshinweis.**

---

## 7. Wie man es misst — und wie man Bindung von Lernerfolg trennt

Der Kernpunkt aus Abschnitt 5 (Duolingo-Studie: kein signifikanter Zusammenhang zwischen Engagement
und Lernerfolg) muss die Messstrategie prägen: **zwei getrennte Kennzahlen-Familien, nie eine als
Proxy für die andere verwenden.**

**Bindungs-/Engagement-Metriken** (beantworten: „kommt das Kind wieder?"):
- Aktive Tage pro Woche, Rückkehrquote am Folgetag nach einer Lücke
- Sitzungsdauer und -abbruchquote (Aufgabe begonnen, aber nicht beendet — im Repo über `attempts`
  bereits protokollierbar)
- Verteilung der Streak-Längen (viele kurze Streaks nach Resets = Hinweis auf zu harten
  Reset-Mechanismus)
- Einlöse-Quote der Coins im `RewardShop` (werden sie tatsächlich gegen Bildschirmzeit getauscht,
  oder gehortet/ignoriert? — Letzteres deutete sich in den Anton-Erfahrungsberichten aus Abschnitt 4
  bereits an: „Coins gesammelt, aber nie eingelöst")

**Lern-Metriken** (beantworten: „lernt das Kind tatsächlich mehr?"):
- Trefferquote pro Thema **über die Zeit**, nicht als Momentaufnahme — ein Anstieg der
  Trefferquote bei gleichzeitig steigender `difficulty` ist das eigentliche Erfolgssignal, ein
  Anstieg bei gleichbleibender/sinkender Schwierigkeit kann auch „hat sich an das enge Aufgabenmuster
  gewöhnt" bedeuten
- **Verzögerter Retest**: gelegentlich ein Thema erneut abfragen, das seit mehreren Tagen nicht mehr
  geübt wurde (im `path/route.ts`-Scheduling durch die `gapDays`-Logik ohnehin schon technisch
  vorbereitet) — das ist der einzige Weg, „hat es kurzfristig gelernt" von „hat es sich eingeprägt"
  zu unterscheiden, und die einzige Methode, die „hat gelernt, die App zu bedienen"
  (Antwortmuster-Auswendiglernen, aus Abschnitt 4 als Anton-Kritik bekannt) von echtem Verstehen zu
  trennen
- Durchschnittliche erreichte `difficulty` pro Thema über mehrere Wochen als grober
  Fortschritts-Indikator

**Wie man Wirkung einer Änderung prüft, und ab wann:** Bei einer Nutzerbasis von zwei Kindern ist
eine klassische A/B-Testgruppe nicht sinnvoll (zu kleine Stichprobe für Signifikanz). Praktikabler
ist ein **ABAB-Einzelfalldesign**: Änderung für 2–3 Wochen einführen, dann für 2–3 Wochen zurücknehmen,
Engagement- und Lern-Metriken in beiden Phasen vergleichen — mit dem Wissen, dass zwei Kinder keine
belastbare Statistik ergeben, sondern nur eine grobe Richtungsanzeige. Wichtig: **Neuheitseffekte**
einkalkulieren (mehrere der oben zitierten Gamification-Studien warnen ausdrücklich, dass
Motivationseffekte durch Neuheit nach einigen Wochen abklingen) — eine Verbesserung, die nur in
Woche 1 sichtbar ist, aber in Woche 4 verschwindet, ist kein belastbarer Befund.

---

## Empfehlung zur Methode: Wie befragt man zwei Zwölfjährige sauber?

**Das ist ausdrücklich eine Empfehlung, keine Entscheidung — die Wahl der Methode liegt beim
Auftraggeber.**

Das Grundproblem ist doppelt: Kinder generell neigen dazu, Erwachsenen Gefälligkeitsantworten zu
geben, wenn direkt gefragt wird ([Vergleichsstudie Think-Aloud vs. Konstruktive Interaktion](https://www.researchgate.net/publication/228824427_A_Comparison_of_Think-aloud_Questionnaires_and_Interviews_for_Testing_Usability_with_Children) —
Fachartikel: „prompting could result in children mentioning problems in order to please the
experimenter"); hier verschärft sich das zusätzlich, weil der befragende Erwachsene der Autor der
App ist.

Konkrete, erprobte Techniken aus der Kinder-Usability-Forschung:

1. **Beobachtung vor Befragung.** Freies Nutzungsverhalten (welches Fach wird ohne Zwang zuerst
   geöffnet, wo wird abgebrochen, wo klickt das Kind schnell durch ohne die Erklärung zu lesen) ist
   ein verlässlicheres Signal als eine direkte Frage danach. Das lässt sich aus den bestehenden
   `attempts`-Daten teilweise sogar automatisiert auswerten (Abbruchquote, Zeit pro Aufgabe).
2. **Konstruktive Interaktion statt Einzel-Interview.** Beide Zwillinge gemeinsam an der App
   arbeiten lassen und sich dabei gegenseitig erklären lassen (nicht dem Elternteil) — eine
   kontrollierte Vergleichsstudie fand, dass **bekannte Paare** (hier: Geschwister) beim gemeinsamen
   Lösen deutlich mehr Usability-Probleme äußern (80 % der gefundenen Probleme) als Einzelkinder im
   klassischen Think-Aloud oder unbekannte Paare (63 %) ([Als, Jensen & Skov 2005](https://vbn.aau.dk/en/publications/comparison-of-think-aloud-and-constructive-interaction-in-usabili/) —
   Fachartikel/Konferenzbeitrag). Der Elternteil hört nur zu, fragt nicht aktiv nach — reduziert den
   „Vater hat es gebaut"-Bias erheblich, weil das Gespräch zwischen den Kindern stattfindet.
3. **Konkrete statt abstrakte Fragen.** Statt „Macht dir die App Spaß?" (globale Bewertungsfrage,
   lädt zu Gefälligkeitsantworten ein) besser: „Zeig mir eine Aufgabe von heute, bei der du am
   liebsten sofort auf ‚Überspringen' geklickt hättest" oder „Welche der drei Aufgabenarten von
   heute würdest du morgen zuerst machen — und welche zuletzt?" Konkrete Erinnerungsanker liefern
   verwertbarere Antworten als globale Sentiment-Fragen.
4. **Vergleichs-/Forced-Choice statt Ja/Nein.** Zwei Varianten (z. B. mit/ohne Fortschrittsbalken,
   mit/ohne Streak-Anzeige) nebeneinander zeigen und fragen „welche findest du besser, und warum" —
   ohne zu verraten, welche Version neu/eigene Idee ist. Erschwert Gefälligkeitsantworten, weil es
   keine erkennbar „richtige" Antwort gibt.
5. **„Again-Again"-Technik** aus dem Fun-Toolkit (Read, MacFarlane & Casey): pro einzelnem
   Aufgabentyp/Feature separat fragen „würdest du das nochmal machen?" (ja/vielleicht/nein) statt
   eine globale Bewertung der ganzen App abzufragen — liefert granulare, featurebezogene Daten statt
   einer diffusen Gesamtmeinung ([Fun-Toolkit-Übersicht](https://experience.aalto.fi/fun-toolkit/) —
   Methoden-Ressource, Sekundärquelle zur Originalstudie von Read & MacFarlane).
6. **Nicht ankündigen, dass es ein „Interview" ist.** Beiläufig nach einer bereits beendeten
   Übungssession fragen, nicht als separater, formeller Termin — reduziert die soziale
   Erwartungshaltung, „die richtige Antwort" geben zu müssen.
7. **Wenn möglich: nicht der Vater fragt.** Ein neutraler Erwachsener (anderes Elternteil,
   Verwandte:r) reduziert den Gefälligkeits-Bias strukturell stärker als jede Fragetechnik — laut der
   oben zitierten Forschung ist die Anwesenheit/Rolle der befragenden Person einer der größten
   Störfaktoren bei Kinder-Usability-Tests.

---

## Fallstricke & Risiken

- **Zwei Kinder sind keine Stichprobe.** Jede Beobachtung aus Familientests (auch mit den oben
  genannten Methoden) bleibt anekdotisch. Für produktweite Entscheidungen (falls die App an fremde
  Familien geht) braucht es irgendwann mehr Nutzer:innen, nicht nur bessere Fragetechnik.
  Es ist auch eine offene Frage, wie repräsentativ Zwillinge im Vergleich zueinander sind — der
  Vorgänger-Report weist auf den „Spiegeleffekt" bei Zwillingen hin, der ihre Reaktionen
  möglicherweise stärker angleicht, als bei zwei unabhängigen Kindern zu erwarten wäre.
- **Der Korrumpierungseffekt-Streit ist nicht abgeschlossen** (Abschnitt 1). Wer eine harte
  „Belohnungen sind schädlich"-Position vertritt, überzieht die Evidenz; wer Belohnungen für
  grundsätzlich unbedenklich hält, ignoriert 25 Jahre Gegenevidenz. Die hier gegebenen Empfehlungen
  (leistungskontingent statt teilnahmekontingent, kein Zufall, kein Ersatz für erklärendes Feedback)
  sind der Teil der Debatte, in dem sich beide Lager treffen — nicht die maximale Vorsicht.
- **Die 85-%-Regel ist eine Heuristik, keine geprüfte Norm für Schulkinder** (Abschnitt 2) —
  Fehlinterpretation als exakte Zielmarke wäre eine Überinterpretation der Quelle.
- **Viele Primärquellen zu Anton-Kritik und einige Marketing-Kennzahlen zu Duolingo (Streak-Freeze-
  Wirkung) waren wegen blockierter Domains nicht im Volltext prüfbar** — als Suchmaschinen-Snippet
  wiedergegeben, mit entsprechend geringerer Verlässlichkeit gekennzeichnet. Vor einer
  Grundsatzentscheidung, die stark auf diesen Einzelpunkten beruht, sollte jemand mit
  funktionierendem Zugriff die Originalseiten direkt prüfen.
- **Neuheitseffekt bei jeder gamifizierten Änderung** — mehrere zitierte Meta-Analysen warnen
  ausdrücklich, dass Motivationseffekte von Gamification-Elementen mit der Zeit abklingen. Ein
  Wirksamkeitsnachweis nach 1–2 Wochen ist kein verlässlicher Wirksamkeitsnachweis.

---

## Quellen

**Motivationspsychologie / SDT / Korrumpierungseffekt**
- [Deci, Koestner & Ryan 1999/2001 – Extrinsic Rewards and Intrinsic Motivation in Education](https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf) — Fachartikel/Meta-Analyse (Primärquelle), abgerufen 2026-08-16
- [Cameron & Pierce – Pervasive negative effects of rewards? Debatte](https://pubmed.ncbi.nlm.nih.gov/22478353/) — Fachartikel, abgerufen 2026-08-16
- [Debatten-Zusammenfassung, Cortland University](https://web.cortland.edu/andersmd/psy501/intrinsic.pdf) — Lehrmaterial-Sekundärquelle, abgerufen 2026-08-16
- [Wikipedia – Korrumpierungseffekt](https://de.wikipedia.org/wiki/Korrumpierungseffekt) — Enzyklopädie/Sekundärquelle, nur über Suchmaschinen-Snippet geprüft (WebFetch blockiert), abgerufen 2026-08-16
- [SDT-Meta-Analyse Bildungskontext, Wang, Wang et al.](https://selfdeterminationtheory.org/wp-content/uploads/2024/06/2024_WangWangEtAl_MetaEdu.pdf) — Fachartikel, Meta-Analyse, abgerufen 2026-08-16
- [Need-Support-Meta-Analyse (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12276404/) — Fachartikel, Meta-Analyse, abgerufen 2026-08-16
- [Eccles/Midgley – Stage-Environment Fit](https://pubmed.ncbi.nlm.nih.gov/8442578/) — Fachartikel, abgerufen 2026-08-16

**Flow / Schwierigkeitssteuerung**
- [Wilson et al. 2019 – The Eighty Five Percent Rule for optimal learning, Nature Communications](https://www.nature.com/articles/s41467-019-12552-4) — Fachartikel (Primärquelle), nur über Suchmaschinen-Zusammenfassung geprüft (WebFetch blockiert), abgerufen 2026-08-16
- [Flow-Theorie-Überblick, Maverick Learning Pressbook](https://mlpp.pressbooks.pub/mavlearn/chapter/flow-theory/) — Lehrbuch-Sekundärquelle, abgerufen 2026-08-16

**Gamification-Mechaniken**
- [Sailer & Homner 2020 – The Gamification of Learning: A Meta-Analysis (ERIC)](https://eric.ed.gov/?id=EJ1245270) — Fachartikel, Meta-Analyse, abgerufen 2026-08-16
- [Hamari, Koivisto & Sarsa 2014 – Does Gamification Work?](https://www.researchgate.net/publication/256743509_Does_Gamification_Work_-_A_Literature_Review_of_Empirical_Studies_on_Gamification) — Fachartikel/Konferenzbeitrag, abgerufen 2026-08-16
- [K-12-Gamification-Meta-Analyse 2025, Psychology in the Schools](https://onlinelibrary.wiley.com/doi/10.1002/pits.70056) — Fachartikel, Meta-Analyse, nur Abstract/Snippet geprüft (WebFetch blockiert), abgerufen 2026-08-16
- [SAGE 2024 – Badges/Leaderboards Grundschul-Feldstudie](https://journals.sagepub.com/doi/10.1177/10468781241237389) — Fachartikel, abgerufen 2026-08-16
- [Springer – Gamification, Autonomie/Relatedness, minimale Kompetenz-Wirkung (Titel/Metadaten)](https://link.springer.com/article/10.1007/s11423-023-10337-7) — Fachartikel, Meta-Analyse, nur Titel/Snippet geprüft (WebFetch blockiert), abgerufen 2026-08-16
- [Kivetz, Urminsky & Zheng 2006 – Goal-Gradient-Hypothese](https://www.researchgate.net/publication/239776073_The_Goal-Gradient_Hypothesis_Resurrected_Purchase_Acceleration_Illusionary_Goal_Progress_and_Customer_Retention) — Fachartikel, abgerufen 2026-08-16
- [PLOS One – Lootbox Scoping Review](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0263177) — Fachartikel, systematischer Review, abgerufen 2026-08-16
- [Avatar-Customization-Studie, Cyberpsychology Journal](https://cyberpsychology.eu/article/view/4340) — Fachartikel, abgerufen 2026-08-16

**Streaks / Duolingo**
- [justanotherpm.com – Psychology Behind Duolingo Streaks](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature) — Blog/Marketing-Sekundärquelle, niedrige Verlässlichkeit, abgerufen 2026-08-16
- [darewell.co – Duolingo Streaks Retention Secret](https://darewell.co/en/duolingo-streaks-retention-secret/) — Blog/Marketing-Sekundärquelle, niedrige Verlässlichkeit, abgerufen 2026-08-16
- [Duolingo-Lerneffekt-Studie, Language Learning & Technology 2024](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/ea47a53e-da6e-4419-bd55-e72b458294f4/content) — Fachartikel, abgerufen 2026-08-16

**Anton-Kritik / Nutzerstimmen (qualitativ, nicht repräsentativ)**
- [check-app.de – Anton App Kritik](https://www.check-app.de/2026/03/03/anton-app-kritik-macht-sie-kinder-suechtig/) — Ratgeber-Blog, nur Snippet geprüft (blockiert), abgerufen 2026-08-16
- [urbia.de-Forum – Anton-Erfahrungen](https://www.urbia.de/forum/6-kids-schule/5416632-anton-app-erfahrungen) — Elternforum, nur Snippet geprüft (blockiert), abgerufen 2026-08-16
- [gostudent.org – Anton im Test](https://insights.gostudent.org/die-lern-app-anton-im-test) — Anbieter-Blog (Konkurrent), nur Snippet geprüft (blockiert), abgerufen 2026-08-16
- [web.de – Suchtexperte warnt vor Lern-Apps](https://web.de/magazine/ratgeber/kind-familie/lern-apps-anton-motivieren-kinder-suchtexperte-warnt-35881144) — Ratgeber-Artikel, nur Titel/Snippet geprüft (blockiert), abgerufen 2026-08-16

**Kinder-Usability-Methodik**
- [Als, Jensen & Skov 2005 – Comparison of Think-Aloud and Constructive Interaction](https://vbn.aau.dk/en/publications/comparison-of-think-aloud-and-constructive-interaction-in-usabili/) — Fachartikel/Konferenzbeitrag, abgerufen 2026-08-16
- [Vergleichsstudie Think-Aloud/Fragebogen/Interview mit Kindern](https://www.researchgate.net/publication/228824427_A_Comparison_of_Think-aloud_Questionnaires_and_Interviews_for_Testing_Usability_with_Children) — Fachartikel, abgerufen 2026-08-16
- [Fun-Toolkit/Smileyometer-Übersicht, Aalto Experience Platform](https://experience.aalto.fi/fun-toolkit/) — Methoden-Ressource, abgerufen 2026-08-16

**Interne Referenzen**
- [docs/research/2026-08-15-marktanalyse-lernapps.md](/home/user/vacation/docs/research/2026-08-15-marktanalyse-lernapps.md) — Vorgänger-Report, Rangliste-Entscheidung und Streak-Reibungspunkt
- [docs/research/2026-08-15-businessplan-unit-economics.md](/home/user/vacation/docs/research/2026-08-15-businessplan-unit-economics.md) — Churn-Zahlen (6–9 %/Monat, „Kind verliert Interesse" 36 %)

---

## Offene Punkte

- **Mehrere Primärquellen zu Anton-Nutzerkritik waren über den Recherche-Proxy nicht per `WebFetch`
  erreichbar** (urbia.de, gutefrage.net, apps.apple.com, web.de, check-app.de, trusted.de,
  nngroup.com, de.wikipedia.org, link.springer.com, onlinelibrary.wiley.com, nature.com,
  pmc.ncbi.nlm.nih.gov, u. a.). Die hier wiedergegebenen Inhalte stammen aus
  Suchmaschinen-Zusammenfassungen mit Zitat-Fragmenten, nicht aus geprüftem Volltext. **Zu klären:**
  mit funktionierendem, ungefiltertem Internetzugang die App-Store-Rezensionen (Apple/Google Play)
  zu Anton direkt durchsehen — dort liegt vermutlich die dichteste Konzentration konkreter,
  wörtlicher Kinder-/Elternstimmen, die hier nur indirekt zugänglich waren.
- **Die konkrete Duolingo-Kennzahl „21 % weniger Abbruch durch Streak-Freeze"** stammt aus
  PM-/Marketing-Blogs, nicht aus einer von Duolingo selbst veröffentlichten Studie oder einem
  Investor-Report. **Zu klären:** in Duolingos Efficacy-Research-Seite oder Quartalsberichten nach
  einer offiziellen, belastbareren Zahl suchen, falls diese Größenordnung für eine Entscheidung
  wichtig wird.
- **Kein direkter RCT zu 11–13-Jährigen mit genau diesem App-Typ (KI-generierte Drillaufgaben,
  Ferienkontext) gefunden** — die gesamte Evidenzbasis ist auf verwandte, aber nicht identische
  Kontexte (Sprachlern-Apps, allgemeine Schulgamification, Laborexperimente) übertragen. Das ist der
  aktuelle Stand der Forschung insgesamt, keine Recherchelücke, die sich durch mehr Suchen schließen
  ließe.
- **Ob die vorgeschlagene Streak-Gnadenfrist und die engere Schwierigkeits-Totzone tatsächlich
  wirken**, lässt sich nur durch die in Abschnitt 7 skizzierte ABAB-Beobachtung am eigenen Nutzerpaar
  klären — dafür bräuchte es vorher ein einfaches Logging der oben genannten Engagement-/Lern-Metriken,
  die aktuell aus den vorhandenen `attempts`-Daten größtenteils ableitbar, aber noch nicht als
  Dashboard aufbereitet sind.
