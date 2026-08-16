# Businessplan & Unit Economics — "Ferien-Lerncoach" als Unternehmen

Stand: 2026-08-15. Kein Rechts-, Steuer- oder Anlagerat — siehe Grenzen im Auftrag. Baut auf
`docs/research/2026-08-15-geschaeftsmodell-kosten.md` (verifizierte KI-Kostenbasis für die
heutigen 3 Kinder: ~0,25–0,78 €/Kind/Monat) und `docs/research/2026-08-15-datenschutz-dsgvo.md`
(DSGVO-Lage) auf. Der Marktteil (Marktgröße, Wettbewerber, Eintrittsbarrieren) wird parallel unter
`docs/research/2026-08-15-markt-wettbewerb-business.md` bearbeitet — bei Abruf dieses Reports lag
diese Datei noch nicht vor; wo Marktannahmen nötig waren, ist das gekennzeichnet und sollte gegen
den fertigen Marktreport abgeglichen werden.

## Empfehlung (Kurzfassung)

**Ein volles, fremdkapitalfinanziertes Unternehmen jetzt zu gründen, ist auf Basis der hier
gerechneten Zahlen nicht zu empfehlen — die Unit Economics tragen im naiven Abo-Modell nicht.**
Mit realistischen deutschen B2C-EdTech-Benchmarks (Kundenakquisekosten ~40–120 € je zahlender
Familie, Kinder-App-typische Churn von 6–9 %/Monat) liegt das Verhältnis von Kundenwert zu
Akquisekosten in der Grundrechnung bei rund **0,9:1 statt der für gesunde Consumer-Subscriptions
üblichen 2,5–4:1**, und die Amortisationszeit einer Neukundin liegt bei ~14 Monaten statt der für
DTC-Abos üblichen 3–6 Monate — noch bevor man die strukturelle Besonderheit dieses Produkts
einrechnet, dass die variablen KI-Kosten (anders als bei klassischer Software) mit jedem Nutzer
linear mitwachsen und **nicht** durch Skalierung gegen null gehen. Empfehlenswert ist stattdessen
ein **gestufter, kapitalarmer Validierungspfad** (Phasenplan unten): zunächst außerhalb des
Familienkreises echte Zahlungsbereitschaft mit harten Abbruchkriterien testen, dabei zwei konkrete
Hebel gegen das Margenproblem prüfen — ein an den Schulferien-Rhythmus angepasstes
**Ferienpaket-Preismodell** statt Dauerabo, und eine **Batch-vorgenerierte Aufgaben-Pool-Strategie**
statt Live-Generierung pro Kind (mit dem klar benannten Zielkonflikt: das verwässert das
"individuell für dein Kind generiert"-Versprechen). Erst wenn diese Validierung über mindestens
einen vollen Ferienzyklus tragfähige Zahlen zeigt, lohnt sich der Aufbau einer Rechtsform mit
Haftungsbeschränkung und ernsthaftem Team-/Kapitalaufbau — vorher wäre jede Investition in GmbH,
Marketing-Budget oder Fremdkapital verfrühtes Geldverbrennen auf Basis unbewiesener Annahmen.

## Annahmen

- 1 USD ≈ 0,864 EUR, wie im Vorreport (Stand 14.08.2026, Sekundärquelle — Primärquellen blockiert).
- **"Kunde" = zahlende Familie**, nicht einzelnes Kind. Angenommene durchschnittliche Kinderzahl im
  Nutzungsalter pro zahlender Familie: **1,6** (eigene Schätzung, plausibel für Sek-I-Zielgruppe mit
  Geschwistern, nicht separat verifiziert — Familien mit nur einem Kind im relevanten Alter oder mit
  drei ziehen den Schnitt in beide Richtungen).
- Referenzpreis für die Modellrechnung: **6,99 €/Monat Familientarif** (mittlere Positionierung
  zwischen Anton Plus Familie [1,67 €/Monat] und sofatutor Familie [~30 €/Monat], siehe Tabelle
  unten) — eine Annahme, kein recherchierter Zielpreis; wird in der Rechnung als Stellgröße
  behandelt, nicht als feste Empfehlung.
- Kein eigener Marktgrößen-Claim — dafür ist der parallele Marktreport zuständig.
- Wo US-Benchmarks (RevenueCat, Adapty, diverse SaaS-Blogs) verwendet wurden, weil deutsche/EdTech-
  spezifische Zahlen nicht auffindbar waren, ist das explizit gekennzeichnet.

---

## 1. Erlösmodelle im Vergleich

| Modell | Preispunkt (Markt, DE) | Conversion/Aufwand | Produktvoraussetzung |
|---|---|---|---|
| **Freemium mit Abo-Upgrade** | Kostenlose Basisfunktion + Premium ab ~4–17 €/Monat (Marktspanne, s. Vorreport) | Free-to-paid-Conversion im EdTech-Durchschnitt **2,6 %**, bei ausgereiften Produkten mit stetigem Lernbedarf **5–8 %** (Duolingo ~8 % als Referenz), früher Startpunkt für neue Produkte realistisch **2–4 %** ([userpilot.com](https://userpilot.com/blog/freemium-to-premium/), [winsomemarketing.com](https://winsomemarketing.com/edtech-marketing/freemium-models-in-edtech-when-free-users-actually-convert-to-paid), [kissmetrics.io](https://kissmetrics.io/glossary/free-to-paid-conversion)) | Größter Produktaufwand: Paywall-Logik, Nutzungslimits, Free-Tier muss trotzdem KI-Kosten decken oder deckeln (siehe Abschnitt 2.4) |
| **Reines Abo (kein Free-Tier)** | 4–17 €/Monat Einzelnutzer (Marktspanne) | Keine Conversion-Frage, dafür höhere CAC pro Neukunde (kein "Trichter" über Gratisnutzer) | Am wenigsten zusätzliche Produktarbeit, aber Vertrauensaufbau vor Zahlung schwieriger ohne Testphase |
| **Familientarif** | 10,25 €/Monat (Duolingo, bis 6 Accounts) bis 29,99 €/Monat (sofatutor, 2 Kinder); Anton 19,99 €/Jahr ≈ 1,67 €/Monat als Ausreißer nach unten | Höherer wahrgenommener Wert pro Haushalt, aber Preisanker "pro Kind" wird für Eltern unklar | Mehrfach-Kinder-Accounts unter einem Elternzugang — im Repo laut Vorreport-Kontext bereits vorhanden (Familie mit 3 Kindern) |
| **Schullizenz** | 10,70 €/Schüler/Schuljahr (bettermarks) bis 60 €/Schüler über 3 Jahre (SchulLV); Schulträgerlizenzen (mehrere Schulen) individuell verhandelt ([bettermarks](https://de.bettermarks.com/lizenzen/), [lernmarktplatz.de](https://lernmarktplatz.de/products/schullv-schueler), [ma-lernsoftware.de](https://ma-lernsoftware.de/schultraegerlizenzen/)) | Kein klassischer Conversion-Funnel — B2B-Vertriebszyklus (Schulleitung, Kollegium, ggf. Elternbeirat, Haushaltsjahr der Schule) | Hoher Produkt-/Compliance-Aufwand: Admin-Oberfläche für Lehrkräfte, Klassenverwaltung, Auswertungen, Anbindung an Schulverwaltungssoftware ist in der jetzigen Ein-Familien-App nicht vorhanden |
| **Landeslizenz** | Individuell, i. d. R. über Landesmedienzentren beschafft (siehe z. B. Medienzentrum Limburg-Weilburg für Alfons: 372–616 €/Schule/Jahr als Referenzgröße einer Kreis-/Landeslizenz-Logik) ([mzlw.de](https://mzlw.de/unsere-angebote/landes-und-kreislizenzen/)) | Politischer/administrativer Beschaffungsprozess über Kultusministerium bzw. Landesmedienzentrum, Jahre bis zum Abschluss realistisch | Höchste Eintrittshürde: Referenzen, Ausschreibungsfähigkeit, oft Rahmenvertrag über Landesinstitut — für ein Solo-Projekt ohne Referenzkunden faktisch nicht erreichbar in absehbarer Zeit |
| **Verlagskooperation / White-Label** | Individuell verhandelt, kein öffentlicher Preispunkt auffindbar. Belegtes Präzedenzbeispiel: das EdTech-Startup **Ezri** launchte seine KI-Tutoren als White-Label mit **Cornelsen und Duden Learnattack** ([EDUvation](https://eduvation.de/en/) referenziert; Klett kooperiert vergleichbar mit **schulKI.de** ([news4teachers.de](https://www.news4teachers.de/2024/09/ernst-klett-verlag-und-schulki-de-kooperieren/))) | Kein Endkunden-Funnel — Verhandlung mit dem Verlag direkt; Erfolg hängt an Traction/IP-Reife des Startups, nicht an Marketing | Sehr hoher Aufwand: belastbare Referenzen, sauber dokumentierte IP, meist ein Team statt Einzelperson als Verhandlungspartner erwartet |

**Einordnung:** Für den Ausgangspunkt "ein Solo-Gründer mit bestehendem Prototyp, keine Firma,
keine Referenzkunden" sind **Schullizenz, Landeslizenz und Verlagskooperation faktisch nicht
erreichbar**, bevor nicht ein B2C-Track Record (echte zahlende Familien, echte Nutzungsdaten)
existiert — diese drei Modelle sind eher spätere Phasen (siehe Phasenplan) als ein Einstiegspunkt.
Realistisch bleiben zum Start **Freemium** oder **reines Abo mit Familientarif**.

---

## 2. Unit Economics — der Kern

### 2.1 CAC (Customer Acquisition Cost)

Belastbare deutsche EdTech-B2C-CAC-Zahlen waren nicht auffindbar; die folgenden Benchmarks sind
US-/global-Consumer-Subscription- bzw. genereller EdTech-Herkunft und werden als **Orientierung**,
nicht als exakter deutscher Wert behandelt:

- B2C-Bildungs-Apps geben **unter 120 $ (≈ 104 €)** pro (zahlendem) Nutzer aus, deutlich unter dem
  B2B-EdTech-Wert von ~1.400 $ ([grahamforman.medium.com](https://grahamforman.medium.com/growing-your-edtech-venture-how-efficient-and-effective-is-your-growth-engine-2e09f4f7aca4)).
- Mobile Subscription-Apps mit Preisen im Bereich 5–15 $/Monat und ~12 Monaten Retention tragen
  CACs von **15–40 $ (≈ 13–35 €)**, bei einem LTV-Rahmen von 40–120 $ ([pmtoolkit.ai](https://pmtoolkit.ai/calculators/cac-calculator/mobile-apps)).
- Kosten pro zahlendem Nutzer (Cost per Action) liegen branchenübergreifend bei Mobile Apps
  typischerweise bei **20–80 $ (≈ 17–69 €)** ([adaction.com](https://www.adaction.com/blog/mobile-app-user-acquisition-cost)).

**Für die Modellrechnung verwendete CAC-Spanne: 40–120 € pro zahlender Familie**, Basisfall 70 € —
eigene Schätzung aus den o.g. Spannbreiten, tendenziell am oberen Rand angesetzt, weil eine neue,
markenlose deutsche Kinder-Lern-App bei Eltern erst Vertrauen aufbauen muss (Kinderdaten!, siehe
DSGVO-Report) und organische Kanäle (Empfehlung durch Schule/Elternforum) zwar günstiger, aber
langsamer und schwerer planbar sind als bezahlte Kanäle.

### 2.2 Churn — die saisonale Besonderheit

Zwei Referenzwerte aus der Recherche, die deutlich auseinanderliegen und beide eingeordnet werden
müssen:

- **Bildungs-Apps insgesamt** (Recurly-Branchenreport, vermutlich stark von B2B-/institutionellen
  Verträgen geprägt): Gesamt-Jahreschurn nur **4,99 %**, davon freiwillig 3,30 % ([recurly.com](https://recurly.com/resources/report/churn-benchmarks-education/)).
- **Kinder-Lern-Apps speziell** (Consumer, App-Store-Abos): **6–9 % Monats-Churn**, konkret
  **7,4 %/Monat ≈ 59,9 % Jahres-Churn** als 2026er Benchmark ([retentioncheck.com](https://retentioncheck.com/churn-benchmarks/kids-education-apps)). Haupttreiber laut derselben Quelle: "Kind verliert das Interesse" (36 % der Kündigungen), "Kind wächst aus dem Angebot heraus" (24 %).

**Für die Modellrechnung wird der Kinder-App-spezifische Wert (7,5 %/Monat, Mittelwert der 6–9 %-
Spanne) verwendet**, weil dieses Produkt (Sek-I-Kind, Consumer-B2C, App-Store-artiges Abo-Verhalten)
dem zweiten Cluster strukturell viel ähnlicher ist als B2B-/Instituts-Verträgen — die 4,99 % wären
eine irreführend optimistische Grundlage für dieses Produkt.

**Saisonalität, explizit herausgearbeitet:** E-Learning-Apps zeigen einen Churn-Peak im **Sommer
(7,8 %)** ([adapty.io](https://adapty.io/blog/education-app-subscription-benchmarks/)) — das deckt sich mit der Kernlogik dieses Produkts fast eins zu eins: Der
"Ferien-Lerncoach" wird per Definition am intensivsten **in** den Ferien genutzt und ist danach, im
laufenden Schuljahr, für die meisten Eltern kein täglicher Bedarf mehr. Ein Dauerabo bezahlt in
9 von 12 Monaten für ein Produkt, das seinen Kernnutzen nur in ~10–12 Ferienwochen pro Jahr entfaltet
(Niedersachsen: Sommer-, Herbst-, Weihnachts-, Oster- und Pfingstferien) — das ist strukturell ein
**Kündigungsgrund eingebaut ins Produktversprechen selbst**, nicht nur ein Marktphänomen, dem man
mit besserer Bindung begegnen könnte.

Zwei Reaktionsmöglichkeiten:

1. **Dauerabo verteidigen** über Zusatznutzen außerhalb der Ferien (z. B. leichte Wochenend-Übung,
   Zeugnisvorbereitung) — erhöht Komplexität und Positionierung ("Ferien-App" wird verwässert),
   senkt aber die strukturelle Kündigungsquote.
2. **Ferienpaket-Modell**: statt Dauerabo gezielt kurze, in sich geschlossene Zugänge je
   Ferienperiode verkaufen (z. B. ~15 € für die Sommerferien, ~8 € für kürzere Ferien), passend zum
   tatsächlichen Nutzungsrhythmus verkauft, wiederkehrend zu jeder der 5 Ferienperioden pro
   Schuljahr statt einmal jährlich. Das reduziert "Churn" begrifflich zu "geplantem Nutzungsende",
   macht die entscheidende Kennzahl aber zur **Wiederkaufrate zur nächsten Ferienperiode** statt zur
   Kündigungsquote — ein Metrikwechsel, kein automatischer Erfolg. **Diese Option ist nicht durch
   einen gefundenen Marktbeleg abgesichert** (keine Quelle für "Ferienpaket-Wiederkaufraten" bei
   Lernapps gefunden), sondern eine aus der Produktlogik abgeleitete Hypothese, die man mit echten
   Nutzern testen müsste (siehe Phase 2 im Plan unten).

### 2.3 LTV und Payback-Periode — die Grundrechnung

Mit den obigen Annahmen (Referenzpreis 6,99 €/Monat, Familien-KI-Kosten siehe 2.4, Churn 7,5 %/Monat):

| Größe | Wert | Rechenweg |
|---|---|---|
| Bruttomarge pro Familie/Monat vor variablen KI-Kosten | ~6,80 € | 6,99 € abzüglich Zahlungsdienstleister-Gebühr (~1,5 % + 0,25 €, Stripe-typisch) |
| Variable KI-Kosten pro zahlender Familie/Monat (kommerziell, s. 2.4) | ~1,50–2,50 € | 1,6 Kinder × oberes Ende der Spanne aus dem Vorreport (0,78 €/Kind), plus Puffer für intensivere Nutzung zahlender/engagierter Eltern und gelegentliche Coach-Nachrichten |
| **Bruttomarge nach variablen KI-Kosten** | **~4,30–5,30 €/Monat (≈ 62–76 %)** | 6,80 € − 1,50 bis 2,50 € |
| Durchschnittliche Kundenlebensdauer | ~13,3 Monate | 1 / 0,075 (geometrisches Churn-Modell, ignoriert Saisonalitäts-Klumpung — siehe Vorbehalt unten) |
| **LTV pro Familie** | **~57–71 €** (Mittel ~64 €) | Monatliche Bruttomarge × Lebensdauer |
| **CAC (Basisfall)** | **70 €** | siehe 2.1 |
| **LTV:CAC** | **~0,9:1** | 64 € / 70 € |
| **Payback-Periode** | **~13–16 Monate** | CAC / monatliche Bruttomarge |

**Einordnung gegen die Marktbenchmarks:** Ein gesundes Consumer-Subscription-Verhältnis liegt bei
**2,5:1 bis 4:1** ([foundrycro.com](https://foundrycro.com/blog/ltv-cac-ratio-benchmarks-2026/)), gesunde DTC-Payback-Zeiten bei **3–6 Monaten**
([saashero.net](https://www.saashero.net/strategy/cac-payback-period-b2b-saas/)). Die hier gerechnete Grundvariante liegt **deutlich darunter bzw.
darüber** — mit realistischen deutschen/EdTech-Marktannahmen trägt sich ein klassisches
Dauerabo-Modell für diese App **nicht ohne Weiteres**, wenn man Neukunden aktiv über bezahlte Kanäle
akquiriert. Wichtiger Vorbehalt: Das geometrische Churn-Modell unterstellt gleichmäßige Kündigung
über die Zeit — real dürfte die Kündigung **rund um das Ferienende geklumpt** auftreten (siehe 2.2),
was die reale Lebensdauer-Verteilung bimodal statt glatt macht (ein Teil kündigt fast sofort nach
den großen Sommerferien, ein Teil bleibt über mehrere Ferienzyklen). Das ändert den Erwartungswert
der Rechnung kaum, macht aber die Streuung/das Risiko einzelner Kohorten größer, als die einzelne
LTV-Zahl suggeriert.

### 2.4 Bruttomarge bei Skalierung — der zentrale Punkt

**Klassische SaaS-Grenzkosten gehen bei Skalierung gegen null; hier nicht.** Jede zusätzliche
Familie erzeugt reale, laufende Token-Kosten, die linear mit der Nutzung mitwachsen — der Vorreport
weist das für 3 Kinder mit 0,25–0,78 €/Kind/Monat nach; bei 1.000 zahlenden Familien (1,6 Kinder
im Schnitt) wären das **hochgerechnet ~1.600 aktive Kinder × 0,25–0,78 €/Monat = 400–1.250 €/Monat
allein an KI-Kosten**, bei 10.000 Familien das Zehnfache — es gibt **keinen Skaleneffekt**, der
diese Zahl unterproportional wachsen lässt, außer man ändert die Architektur (siehe unten). Das
steht im Gegensatz zur normalen SaaS-Intuition ("mehr Nutzer = bessere Marge durch Fixkosten-
Verteilung") und ist laut aktuellen Branchenzahlen ein branchenweites Problem: **KI-Produkte laufen
2026 im Schnitt auf 41→45→52 % Bruttomarge** (ICONIQ-Trend 2024–2026), deutlich unter den 80–90 %,
die man von klassischer SaaS gewohnt ist, mit den margenschwächsten, am schnellsten wachsenden
KI-Startups bei **25 % oder sogar negativer** Marge ([saasmag.com](https://www.saasmag.com/ai-cogs-saas-gross-margin-compression/), [dodopayments.com](https://dodopayments.com/blogs/price-ai-wrapper)).

**Geprüfte Gegenmittel — und warum die meisten hier wenig bringen:**

1. **Prompt Caching**: Laut Vorreport (Abschnitt 1.5) technisch **nicht wirksam**, weil die
   Systemprompts der App (max. ~1.350 Token) unter Haikus Mindestlänge für Caching (4.096 Token)
   liegen. Kein weiterer Prüfbedarf hier.
2. **Kleineres Modell**: Bereits auf Haiku 4.5 (dem günstigsten sinnvollen Anthropic-Modell für diese
   Aufgabenklasse) — kein weiterer Hebel, außer man wechselt den Anbieter (siehe Risiko unten).
3. **Anthropic Batch API**: Halbiert alle Token-Preise für asynchrone Verarbeitung (Ergebnis
   innerhalb 24 h statt live) ([finout.io](https://www.finout.io/blog/anthropic-api-pricing), [tldl.io](https://www.tldl.io/resources/anthropic-api-pricing)). Für **Live-Generierung während der
   Übungssitzung eines Kindes ungeeignet** (Kind wartet nicht 24 h auf eine Aufgabe), aber sehr gut
   geeignet für die **Batch-Vorgenerierung eines Aufgaben-Pools** — siehe Punkt 4.
4. **Aufgaben-Wiederverwendung über Nutzer hinweg — die strategisch zentrale Frage.** Der
   Zielkonflikt ist real und muss klar benannt werden: **Volle Live-Generierung pro Kind** (heutiger
   Stand) erzeugt das Produktversprechen "für dein Kind individuell generiert", aber die Kosten
   skalieren 1:1 mit der Nutzerzahl. **Volle Wiederverwendung** (ein statischer Aufgabenpool wie bei
   Anton, der laut Recherche im Vorreport/Marktreport 100.000 Aufgaben umfasst) senkt die
   Grenzkosten fast auf null, ist aber **kein KI-generiertes, individuelles Produkt mehr** — genau
   das Alleinstellungsmerkmal, das dieses Projekt vom etablierten Wettbewerb abheben sollte, wäre
   damit aufgegeben. Der plausibelste Mittelweg, den ich aus der Recherche ableite (keine Quelle
   belegt das für diesen konkreten Fall, es ist eine aus der Anthropic-Batch-API-Mechanik und dem
   üblichen EdTech-Muster [Itembank + adaptive Auswahl, wie es z. B. bettermarks strukturell nutzt]
   abgeleitete Empfehlung): **Batch-Vorgenerierung großer, nach Thema/Schwierigkeit/Fehlerprofil
   getaggter Pools pro Kohorte** (z. B. "Klasse 5, Bruchrechnung, Schwierigkeit mittel" → 200
   Varianten über Nacht per Batch-API zum halben Preis erzeugt), aus denen zur Laufzeit **ausgewählt
   statt generiert** wird — mit gelegentlicher Live-Generierung nur dort, wo es das Produkt
   wirklich braucht (z. B. Vorlese-Bewertung, die zwangsläufig auf die individuelle Antwort reagieren
   muss und sich nicht poolen lässt). Das senkt die Grenzkosten deutlich (Faktor: Poolgröße ×
   Batch-Rabatt von 50 %), verwässert das Individualitätsversprechen aber messbar — ein Kind bekommt
   dann "eine von 200 KI-generierten Varianten", nicht "seine eigene, gerade für seinen Fehler
   erzeugte Aufgabe". Diese Abwägung (Marge vs. Produktversprechen) ist eine Entscheidung, die der
   Auftraggeber treffen muss, keine, die sich rein rechnerisch auflöst.

**Power-User-Risiko bei Flatrate-Preisen**: Ein Kind, das statt der angenommenen ~20 Aufgaben/Tag
z. B. 100 Aufgaben/Tag macht (in den Sommerferien plausibel), erzeugt das Fünffache an variablen
Kosten bei gleichem Abo-Preis — bei einer Flatrate ohne Nutzungsobergrenze verschiebt sich die Marge
mit der Nutzungsintensität, nicht mit der Kundenzahl. Ein hartes oder weiches Nutzungslimit
(z. B. "bis zu X Aufgaben/Tag im Abo enthalten") ist deshalb kein Nice-to-have, sondern eine
Voraussetzung, um die Bruttomarge überhaupt planbar zu machen.

**Freemium-spezifisches Zusatzrisiko:** Anders als bei klassischer SaaS-Freemium (Grenzkosten ≈ 0)
kostet hier **auch die kostenlose Nutzung echtes Geld** (jede generierte Aufgabe ist ein KI-Aufruf).
Bei einer angenommenen Conversion von 2–4 % (frühe EdTech-Phase, s. Abschnitt 1) und einem
begrenzten Gratis-Kontingent von z. B. 0,10–0,20 €/Monat variable Kosten pro Gratis-Kind müssen
25–50 Gratis-Nutzer "durchgefüttert" werden, um einen zahlenden Kunden zu gewinnen — das addiert
**~2,50–10 € zusätzliche, laufende Kosten pro eventuellem Zahler**, on top of der klassischen
Marketing-CAC. Ein Freemium-Modell braucht deshalb zwingend ein **hartes Nutzungslimit im Gratis-
Tier** (z. B. 3 Aufgaben/Tag), sonst frisst der Gratis-Trichter selbst einen relevanten Teil der
Marge auf, bevor überhaupt ein Euro Umsatz entsteht.

---

## 3. Kapitalbedarf und Aufbau

### 3.1 Was fehlt bis zum ersten zahlenden Fremdkunden

Das Kernprodukt existiert bereits (Repo). Für einen **marktfähigen** Stand (nicht mehr "App für die
eigene Familie", sondern "Produkt, das eine fremde Familie bezahlt") fehlen strukturell:

- Mandantenfähigkeit / getrennte Accounts pro Familie mit eigenem Billing
- DSGVO-konforme Einwilligungsprozesse nach Art. 8 (siehe DSGVO-Report), rechtssichere
  Datenschutzerklärung
- Zahlungsanbindung (Stripe/vergleichbar), Widerrufs-Schaltfläche nach neuem § 356a BGB
  (verpflichtend ab 19.06.2026, siehe Vorreport)
- Impressum, AGB, Kündigungsprozess
- Rate-Limiting/Kostenschutz gegen unerwartete KI-Kostenexplosion durch einzelne Nutzer (siehe
  Power-User-Risiko oben)
- Support-Kanal für zahlende Eltern (mind. E-Mail-Adresse mit Reaktionszeit)
- Ggf. Lehrplanabdeckung über Niedersachsen hinaus, falls Zielgruppe bundesweit — Verweis auf
  `docs/research/2026-08-15-lehrplaene-datenquellen.md`

### 3.2 Team, Zeit, Geld

- **Team**: Als Solo-Projekt neben einer Haupttätigkeit realistisch bis zur ersten zahlenden
  Fremdfamilie durchziehbar — die o. g. Punkte sind überschaubar, kein grundlegender Neubau.
  Rechtliche/steuerliche Teile (AGB, Datenschutzerklärung, Gewerbeanmeldung) sind klassische
  Zukaufsleistungen, kein Vollzeit-Team nötig in dieser Phase.
- **Zeit**: Als Nebenprojekt realistisch 6–12 Monate bis zu einer belastbaren ersten Kohorte zahlender
  Fremdfamilien (eigene Schätzung, keine Quelle — abgeleitet aus dem Umfang der offenen Punkte in
  3.1 relativ zum bestehenden Code). Vollzeit (z. B. mit Gründungszuschuss, siehe 3.3) ließe sich das
  auf ca. 3–6 Monate verdichten.
- **Geld**: Freelancer-Richtwerte für zugekaufte Leistung liegen 2026 bei **~80–180 €/Stunde bzw.
  ~824 €/Tagessatz im Schnitt** für Softwareentwicklung ([saasrebels.de](https://saasrebels.de/blog/stundensatz-software-entwickler-2026), [freelancermap.de](https://www.freelancermap.de/blog/stundensatz-it-freelancer/)) —
  relevant, falls Teile (z. B. Billing-Integration, UI-Politur) zugekauft werden sollen. Realistischer
  Cash-Bedarf für die Rechts-/Compliance-Grundlage (Anwalt für AGB/Datenschutzerklärung einmalig,
  Steuerberater-Erstberatung): grob **3.000–8.000 €** (eigene Schätzung auf Basis der Tagessätze,
  keine spezifische Kanzlei-Quotierung recherchiert). Laufende Kosten danach: Hosting (klein, aber
  nicht null bei mehr Nutzern), KI-Kosten (siehe Abschnitt 2, skaliert mit Nutzung, nicht fix),
  Zahlungsdienstleister-Gebühren, ggf. Buchhaltungssoftware (~30–50 €/Monat, Schätzung).

### 3.3 Förderprogramme

| Programm | Höhe | Passt hier? |
|---|---|---|
| **EXIST-Gründerstipendium** | Bis zu 113.500 € Gesamtförderung fürs Team (monatlich 1.000–3.000 € je nach Qualifikation je Person) ([clever-funding.de](https://clever-funding.de/blog/exist-gruendungsstipendium/)) | Nur über eine **Hochschule/Forschungseinrichtung** beantragbar, Team bis 3 Personen, Anforderung "innovativ, technologieorientiert" ([gruenderplattform.de](https://gruenderplattform.de/finanzierung-und-foerderung/exist-gruendungsstipendium)) — passt nur, falls eine Hochschulanbindung (eigene oder eines Co-Founders) besteht. Ohne diese Anbindung **nicht erreichbar**. |
| **Gründungszuschuss (Agentur für Arbeit)** | Bis zu 20.000 € über max. 15 Monate, steuerfrei, nicht rückzahlbar ([gruenderkueche.de](https://www.gruenderkueche.de/fachartikel/gruendungszuschuss-anspruch-antrag-hoehe-voraussetzungen/)) | Voraussetzung: **Bezug von ALG 1 mit mind. 150 Tagen Restanspruch** — nur relevant, falls die gründende Person tatsächlich arbeitslos ist/wird. Bei bestehender Festanstellung **nicht nutzbar**, ohne die Anstellung aufzugeben. |
| **Niedersachsen Startup-Zentren / Accelerator** | Primär **Coaching, Mentoring, Vernetzung**, kein direktes Kapital in den gefundenen Quellen; Land stellt 2,4 Mio. € für 8 Zentren 2026–2028 bereit ([mw.niedersachsen.de](https://www.mw.niedersachsen.de/startseite/uber_uns/presse/presseinformationen/niedersachsen-starkt-sein-startup-okosystem-acht-startup-zentren-erhalten-forderung-bis-2028-247468.html)); u. a. Seedhouse Osnabrück (Digitalisierung), VentureVilla Hannover (Software) ([mw.niedersachsen.de](https://www.mw.niedersachsen.de/startseite/uber_uns/presse/presseinformationen/niedersachsen-starkt-sein-startup-okosystem-acht-startup-zentren-erhalten-forderung-bis-2028-247468.html)) | Niedrigschwellig nutzbar für Beratung/Netzwerk, aber kein Ersatz für Kapitalbedarf. |
| **EdTech-spezifische Programme** | Kein EdTech-spezifischer VC-Fonds in Deutschland (starkes Marktsignal!); Initiativen wie **EDUvation**/Founders Foundation als Anlaufstelle, **Pearson Catalyst** als internationales Accelerator-Programm ([eduvation.de](https://eduvation.de/en/), [bildungsklick.de](https://bildungsklick.de/bildung-und-gesellschaft/detail/pearson-launcht-foerderprogramme-fuer-edtech-startups-in-deutschland)) | Eher Netzwerk/Sichtbarkeit als Kapitalquelle in den gefundenen Quellen. |

**Einordnung**: Am ehesten passend ist die Kombination **Bootstrapping (Eigenleistung, keine
Fremdmittel) + kostenloses Coaching über die niedersächsischen Startup-Zentren**, ggf. EXIST **nur**
bei tatsächlicher Hochschulanbindung. Gründungszuschuss ist eine reine Sonderfall-Option (nur bei
Arbeitslosigkeit relevant) und keine allgemeine Empfehlung für dieses Profil.

### 3.4 Bootstrapping vs. Fremdfinanzierung vs. Wagniskapital

Angesichts der Unit-Economics-Lage aus Abschnitt 2 (LTV:CAC ~0,9:1 im Basisfall, kein belegter
Product-Market-Fit außerhalb der eigenen Familie) wäre **Wagniskapital zu diesem Zeitpunkt
verfrüht** — VC kauft Wachstumstempo, aber ein Geschäftsmodell mit unbewiesenen, tendenziell
unterhalb der Zielwerte liegenden Unit Economics würde mit VC-Geld nur schneller Geld verbrennen,
nicht das eigentliche Problem lösen. Das deckt sich mit dem Marktsignal, dass es **keinen
EdTech-spezifischen VC-Fonds in Deutschland** gibt ([eduvation.de](https://eduvation.de/en/)) — der deutsche Markt für
VC-finanzierte B2C-EdTech ist strukturell dünn. **Bootstrapping mit den o. g. Förderprogrammen als
Ergänzung** passt besser: niedriger Kapitalbedarf (Kernprodukt existiert bereits), unbewiesene
Marktgröße, Ein-Personen-Team-Risiko (siehe Risikoabschnitt) — alles Faktoren, die gegen einen
kapitalintensiven Weg sprechen, bevor nicht echte zahlende Fremdkunden über mindestens einen
Ferienzyklus belegen, dass die Zahlen aus Abschnitt 2 sich verbessern lassen (z. B. durch das
Ferienpaket-Modell oder niedrigere reale CAC über organische Kanäle).

---

## 4. Rechtsform und Struktur

*Sachstand, keine verbindliche Empfehlung — vor der tatsächlichen Gründung mit Steuerberater
(Rechtsform-/Steuerfolgen) und Rechtsanwalt (Haftung, AGB, DSGVO-Auftragsverarbeitung) abstimmen.*

| Rechtsform | Passt in welcher Phase | Haftung bei Kinderdaten | Kapitalbedarf | Investorenfähigkeit |
|---|---|---|---|---|
| **Einzelunternehmen** | Phase 1–2 (erste zahlende Fremdkunden, Validierung) | Unbeschränkt mit Privatvermögen — bei DSGVO-Verstößen mit Kinderdaten (Art. 8, höheres Sensibilitätsniveau) ein reales Risiko, sobald nicht mehr nur die eigene Familie betroffen ist | Minimal, Gewerbeanmeldung genügt, Kleinunternehmerregelung greift bis 25.000 €/100.000 € Umsatz ([taxtify.de](https://taxtify.de/steuer-lexikon/kleinunternehmerregelung/)) | Keine |
| **GbR** | Nur falls >1 Gründer und noch keine Haftungsbeschränkung gewünscht | Unbeschränkte **gesamtschuldnerische** Haftung aller Gesellschafter — bei Kinderdaten eher ungünstig, sobald reale Fremdnutzer dabei sind | Minimal | Praktisch keine |
| **UG (haftungsbeschränkt)** | Phase 3 (rechtliche Grundlage steht, Skalierung auf einige hundert Familien) | Haftung auf Gesellschaftsvermögen beschränkt | 1–24.999 € Stammkapital, Gründungskosten ~300–1.000 € (Musterprotokoll ~490 €); **Thesaurierungspflicht**: 25 % des Jahresgewinns müssen zurückgelegt werden, bis 25.000 € erreicht sind ([gruender-coach.de](https://gruender-coach.de/ratgeber/ug-gruenden/), [va-ra.com](https://va-ra.com/gruendungskosten-bei-gmbh-und-ug-wer-zahlt-was/)) | Eingeschränkt — Investoren sehen die UG oft als Übergangsform |
| **GmbH** | Phase 4 (belegte Traction, Team-/Kapitalaufbau) | Haftung auf Gesellschaftsvermögen beschränkt | 25.000 € Stammkapital zwingend, Gründungskosten ~800–1.000 € ([va-ra.com](https://va-ra.com/gruendungskosten-bei-gmbh-und-ug-wer-zahlt-was/)) | Höhere Reputation bei Verlags-/Schulpartnern, von Investoren i. d. R. erwartet (oft Umwandlung UG→GmbH) |

**Einordnung:** Solange nur die eigene Familie (und ggf. informell die Nachbarfamilie ohne Vertrag)
die App nutzt, ist laut Vorreport **gar keine Rechtsform nötig**. Sobald echte, fremde Familien
gegen Bezahlung Kinderdaten in die App einbringen (Phase 1–2 im Plan unten), sollte spätestens mit
dem Übergang zu einer festen, vertraglich zugesicherten Zahlung eine Rechtsform stehen — angesichts
der Sensibilität von Kinderdaten und potenziell hoher DSGVO-Bußgeldrahmen (bis 20 Mio. € / 4 %
Jahresumsatz laut DSGVO-Report) ist eine **Haftungsbeschränkung (UG) früher sinnvoll als bei einem
x-beliebigen anderen Kleingewerbe** — auch wenn das Einzelunternehmen in der reinen
Validierungsphase (wenige Testkunden, geringes Datenvolumen) noch vertretbar sein kann.

---

## 5. Phasenplan mit Abbruchkriterien

| Phase | Ziel | Aufwand | **Abbruchkriterium** |
|---|---|---|---|
| **0 — Status quo** | Familien-Nutzung, 3 Kinder, kein Geschäft (siehe Vorreport) | Laufend, minimal | — (kein Geschäftsrisiko, kein Abbruch nötig) |
| **1 — Validierung außerhalb der Familie** (2–3 Monate) | 10–20 echte fremde Familien (nicht Freunde/Nachbarn) nutzen die App kostenlos über mind. eine volle Ferienperiode | Gering, Nebenprojekt | Wenn nach 2 Wochen **< 30 % der eingeladenen Testfamilien noch aktiv nutzen** ODER in einer Kurzbefragung **< 20 % "würde ich dafür zahlen" angeben** → kein belastbares Signal für Product-Market-Fit, nicht in Phase 2 investieren |
| **2 — Zahlungsbereitschaft testen** (2–3 Monate) | Echter Kleinbetrag (z. B. 4,99 € Ferienpaket) an 200+ Angesprochene außerhalb des Familienkreises, ohne volle rechtliche Infrastruktur (z. B. über einfache Zahlungsplattform) | Gering-mittel | Wenn die **Conversion unter 2 %** bleibt (Untergrenze des EdTech-Freemium-Benchmarks, s. Abschnitt 1) bei mind. 200 Angesprochenen → Zahlungsbereitschaft nicht belegt, aufhören |
| **3 — Rechtliche/technische Grundlage + Einzelunternehmen** (3–6 Monate) | Impressum, AGB, DSGVO-Prozesse, Zahlungsanbindung, Gewerbeanmeldung, Skalierung auf 100–300 zahlende Familien | 3.000–8.000 € + Zeit | Nach 6 Monaten Livebetrieb: wenn der **monatliche Netto-Deckungsbeitrag je Familie negativ** ist ODER die **real gemessene Payback-Periode > 18 Monate** liegt → Geschäftsmodell trägt nicht, zurück auf Nebenprojekt-Status |
| **4 — Team-/Kapitalaufbau** (ab belegtem PMF) | > 500 zahlende Familien, LTV:CAC nachweislich **> 2:1 über mind. 2 volle Ferienzyklen** (um Saisonalität rauszurechnen), dann UG→GmbH-Umwandlung prüfen, erste Freelancer/Teammitglieder, ggf. Angel-Finanzierung für Marketing | Steigend, ggf. externes Kapital | Wenn nach 2 vollen Jahreszyklen **LTV:CAC nicht > 2:1** UND **Bruttomarge nicht > 60 %** → nicht weiter skalieren, auf jetzigem Niveau halten oder Alternativen (Abschnitt 7) prüfen |
| **5 — Skalierung / Marktzugang** | Landeslizenz-Gespräche, Verlagskooperation, Wachstumsfinanzierung | Hoch | Nur wenn Phase-4-Kriterien erfüllt sind — sonst nicht anlaufen |

**Übergreifendes Abbruchkriterium (Schlüsselperson):** Wenn die gründende Person zu irgendeinem
Zeitpunkt nicht mehr regelmäßig Zeit für Support/Weiterentwicklung/DSGVO-Ansprechbarkeit aufbringen
kann und kein Nachfolger/Co-Founder gefunden wird → Projekt kontrolliert einfrieren (bestehende
zahlende Kunden informieren, keine neuen Kunden mehr aufnehmen) statt inkonsistent weiterlaufen zu
lassen — bei einer Kinder-App mit echten Nutzerdaten ist ein plötzliches, unangekündigtes Verwaisen
das schlechteste aller Enden.

---

## 6. Risiken

| Risiko | Eintrittswahrscheinlichkeit | Wirkung | Kommentar |
|---|---|---|---|
| **Abhängigkeit von einem KI-Anbieter** (Preisänderung, AGB-Änderung zu Minderjährigen, Modellabkündigung) | Mittel–hoch | Hoch | Belegt volatil: Opus wurde 3× günstiger (15$/75$ → 5$/25$), Haiku dagegen mit Haiku 4.5 4× teurer als das abgekündigte Haiku 3 (0,25$/1,25$ → 1$/5$) ([finout.io](https://www.finout.io/blog/anthropic-api-pricing), [pecollective.com](https://pecollective.com/tools/anthropic-api-pricing/)) — Preise bewegen sich in beide Richtungen und teils stark. Mindestalter-Klauseln der Anthropic-Nutzungsbedingungen für Minderjährige waren über den Proxy nicht direkt einsehbar (anthropic.com blockiert) — **offener Punkt, vor jeder Kommerzialisierung zu klären**, da Kinder hier direkte Endnutzer der KI-generierten Inhalte sind. Mitigation: modellagnostische Prompting-Schicht, damit ein Anbieterwechsel kein Rewrite erfordert. |
| **Nachahmung durch etablierte Anbieter** (Anton, sofatutor, Verlage) | Hoch | Hoch | "KI generiert Aufgaben" ist technisch für jeden der großen Anbieter mit bestehender Marke, Vertrauen und Schulvertriebskanal leicht nachbaubar — belegt am Präzedenzfall Ezri×Cornelsen/Klett×schulKI (Verlage kooperieren bereits aktiv mit KI-EdTech). Ein Solo-Projekt hat gegen diese Reichweite keinen strukturellen Schutz außer Geschwindigkeit/Nische. Details siehe Marktreport. |
| **Regulatorische Verschärfung bei Kinderdaten** | Mittel | Mittel–hoch | EU-Trend Richtung mehr Kinderschutz (DSA-Weiterentwicklung, Diskussion um weitere Digital-Fairness-Regeln); zusätzliche Compliance-Pflichten (z. B. Altersverifikation) würden Aufwand und Kosten erhöhen, aber vermutlich nicht das Geschäftsmodell selbst unmöglich machen. |
| **Saisonale Umsatzschwankungen** | Sehr hoch (strukturell) | Mittel | Ist im Produktkern angelegt (siehe Abschnitt 2.2), planbar, wird aber zum echten Problem, sobald Fixkosten (Team, Miete, laufende Verträge) ganzjährig anfallen, während Umsatz saisonal konzentriert ist — Cashflow-Planung muss das explizit abbilden, nicht nur Jahresdurchschnitte rechnen. |
| **Schlüsselpersonenrisiko** (Ein-Personen-Gründer neben Haupttätigkeit) | Hoch (strukturell gegeben) | Hoch | Support, Weiterentwicklung, DSGVO-Ansprechbarkeit hängen vollständig an einer Person mit begrenzter Zeit — siehe übergreifendes Abbruchkriterium in Abschnitt 5. |

---

## 7. Der ehrliche Vergleich — Unternehmensaufbau vs. Alternativen

| Option | Aufwand | Realistischer Ertrag | Risiko |
|---|---|---|---|
| **Eigenes Unternehmen aufbauen** (dieser Report) | Hoch (siehe Phasenplan), auch bei Bootstrapping mehrere Monate/Jahre bis tragfähig | Bei den hier gerechneten Basiszahlen **unsicher** — LTV:CAC unter dem Zielwert im Basisfall, trägt sich nur mit erfolgreicher Umsetzung der Gegenmittel (Ferienpaket-Modell, Pool-Strategie) und/oder günstigerer realer CAC als angenommen | Mittel–hoch: Zeit-, Reputations- und ggf. Kapitalverlust bei Scheitern; DSGVO-Haftung bei Fremdkundendaten |
| **Open Source veröffentlichen** | Mittel (Code aufräumen, Doku, Lizenzwahl) | Kein direktes Geld, aber Reputations-/Portfolio-Wert, potenziell Beratungs-/Consulting-Anfragen | Gering — kein Geschäftsrisiko; Vorteil: Verantwortung für Kinderdaten verschiebt sich auf jeden Selbst-Hoster, nicht auf einen selbst |
| **An bestehenden Anbieter/Verlag lizenzieren** | Hoch (Verhandlung, IP sauber aufbereiten, Rechtsberatung) | Potenziell höchster Einzelbetrag, aber unsicher/selten ohne belastbare Traction — Verlage suchen laut den gefundenen Präzedenzfällen (Ezri, schulKI) eher Teams mit Nutzerzahlen als Einzelpersonen mit Prototyp | Mittel: Zeitaufwand ohne Erfolgsgarantie, keine Exklusivitäts-Hebelwirkung ohne Referenzen |
| **Nebenprojekt mit begrenztem Nutzerkreis** (aktueller Zustand + einige weitere Ferien-Familien, ohne Firma) | Sehr gering | Kein Geld, aber der Kernnutzen (eigene + befreundete Kinder lernen) bleibt vollständig erhalten | Minimal |
| **Gar nicht kommerzialisieren** | Keiner zusätzlich | Keiner finanziell, volle Kontrolle, keine B2C-Zusatzpflichten (DSGVO bleibt für die eigenen Kinder als Verantwortlicher trotzdem relevant, aber ohne Fremdkunden-Komplexität) | Keins außer entgangenem Potenzial |

**Einordnung:** Angesichts der in Abschnitt 2 gerechneten, im Basisfall nicht tragfähigen Unit
Economics ist **"Nebenprojekt mit begrenztem Nutzerkreis" oder "Open Source veröffentlichen"** der
risikoärmste nächste Schritt, wenn das Ziel in erster Linie ist, den bestehenden Wert zu nutzen,
ohne unternehmerisches Risiko einzugehen. Der volle Unternehmensaufbau ist nur dann zu empfehlen,
wenn Phase 1–2 des Plans (Abschnitt 5) echte, überzeugende Zahlen liefern — und selbst dann nur mit
einer klaren Antwort auf den Zielkonflikt aus Abschnitt 2.4 (Individualität vs. Marge).

---

## Fallstricke & Risiken (Recherche-methodisch)

- **Kein deutscher/EdTech-spezifischer CAC-Benchmark gefunden** — die verwendete Spanne (40–120 €)
  ist aus US-Consumer-Subscription- und globalen EdTech-Zahlen abgeleitet, keine direkte deutsche
  Messung. Realistisch könnte die deutsche CAC sowohl niedriger (weniger Wettbewerb um Werbeplätze
  in der Nische) als auch höher (geringere Zahlungsbereitschaft, höhere Skepsis bei Kinderdaten)
  liegen.
- **Der angenommene Referenzpreis (6,99 €/Monat) ist eine eigene Setzung**, kein recherchierter
  Zielwert — die gesamte LTV-Rechnung ist entsprechend als Sensitivitätsrahmen zu lesen, nicht als
  Punktprognose.
- **Ferienpaket-Modell ist eine unbelegte Produkthypothese**, keine durch Marktdaten gestützte
  Empfehlung — sie folgt logisch aus der Saisonalitätsanalyse, müsste aber in Phase 2 real getestet
  werden.
- **Anthropic-Nutzungsbedingungen zu Minderjährigen konnten nicht direkt eingesehen werden**
  (anthropic.com über den Proxy blockiert) — das ist der wichtigste offene rechtliche Punkt vor einer
  echten Kommerzialisierung, da Kinder hier unmittelbare Endnutzer der API-Ausgaben sind, nicht nur
  mittelbar wie z. B. bei einer Erwachsenen-App mit Kinderkonto.
- **Marktreport lag zum Zeitpunkt dieser Recherche noch nicht vor** — die hier verwendeten
  Wettbewerbsbeispiele (Anton, sofatutor, Ezri/Cornelsen) stammen aus eigener Recherche für diesen
  Report bzw. aus dem Vorreport und sollten gegen den fertigen Marktreport abgeglichen werden, sobald
  er vorliegt.

## Quellen

- [userpilot.com – Freemium-to-Premium Conversion Benchmarks](https://userpilot.com/blog/freemium-to-premium/) — Fachportal/Aggregator
- [winsomemarketing.com – Freemium Models in EdTech](https://winsomemarketing.com/edtech-marketing/freemium-models-in-edtech-when-free-users-actually-convert-to-paid) — Fachportal
- [kissmetrics.io – Free-to-Paid Conversion Benchmarks](https://kissmetrics.io/glossary/free-to-paid-conversion) — Fachportal
- [grahamforman.medium.com – EdTech Growth Engine / CAC](https://grahamforman.medium.com/growing-your-edtech-venture-how-efficient-and-effective-is-your-growth-engine-2e09f4f7aca4) — Branchenanalyse
- [pmtoolkit.ai – Mobile App CAC Calculator/Benchmarks](https://pmtoolkit.ai/calculators/cac-calculator/mobile-apps) — Fachportal
- [adaction.com – Mobile App User Acquisition Cost](https://www.adaction.com/blog/mobile-app-user-acquisition-cost) — Fachportal
- [recurly.com – Churn Benchmarks Education](https://recurly.com/resources/report/churn-benchmarks-education/) — Branchenreport (Subscription-Billing-Anbieter)
- [retentioncheck.com – Kids Education App Churn 2026](https://retentioncheck.com/churn-benchmarks/kids-education-apps) — Branchenreport
- [adapty.io – Education App Subscription Benchmarks](https://adapty.io/blog/education-app-subscription-benchmarks/) — Fachportal (Subscription-Analytics-Anbieter)
- [foundrycro.com – LTV:CAC Ratio Benchmarks 2026](https://foundrycro.com/blog/ltv-cac-ratio-benchmarks-2026/) — Fachportal
- [saashero.net – CAC Payback Period B2B SaaS](https://www.saashero.net/strategy/cac-payback-period-b2b-saas/) — Fachportal
- [saasmag.com – AI COGS Problem / Gross Margin Compression](https://www.saasmag.com/ai-cogs-saas-gross-margin-compression/) — Branchenanalyse
- [dodopayments.com – AI Wrapper Pricing](https://dodopayments.com/blogs/price-ai-wrapper) — Fachportal (Zahlungsdienstleister-Blog)
- [finout.io – Anthropic API Pricing 2026](https://www.finout.io/blog/anthropic-api-pricing) — Fachportal/Kostenmanagement-Anbieter
- [pecollective.com – Anthropic API Pricing (offizielle Token-Raten)](https://pecollective.com/tools/anthropic-api-pricing/) — Aggregator
- [tldl.io – Anthropic API Pricing](https://www.tldl.io/resources/anthropic-api-pricing) — Aggregator
- [de.bettermarks.com – Lizenzen](https://de.bettermarks.com/lizenzen/) — Herstellerangabe
- [lernmarktplatz.de – SchulLV Schüler](https://lernmarktplatz.de/products/schullv-schueler) — Testportal
- [ma-lernsoftware.de – Schulträgerlizenzen](https://ma-lernsoftware.de/schultraegerlizenzen/) — Herstellerangabe
- [mzlw.de – Landes- und Kreislizenzen](https://mzlw.de/unsere-angebote/landes-und-kreislizenzen/) — Medienzentrum (öffentliche Stelle)
- [eduvation.de – EdTech-Startups & Programme](https://eduvation.de/en/) — Branchennetzwerk
- [news4teachers.de – Klett Verlag und schulKI.de kooperieren](https://www.news4teachers.de/2024/09/ernst-klett-verlag-und-schulki-de-kooperieren/) — Fachpresse
- [bildungsklick.de – Pearson Förderprogramme EdTech](https://bildungsklick.de/bildung-und-gesellschaft/detail/pearson-launcht-foerderprogramme-fuer-edtech-startups-in-deutschland) — Fachpresse
- [clever-funding.de – EXIST-Gründungsstipendium](https://clever-funding.de/blog/exist-gruendungsstipendium/) — Förderberatung
- [gruenderplattform.de – EXIST-Gründungsstipendium](https://gruenderplattform.de/finanzierung-und-foerderung/exist-gruendungsstipendium) — Offizielles Gründerportal (KfW/BMWK-nah)
- [gruenderkueche.de – Gründungszuschuss 2026](https://www.gruenderkueche.de/fachartikel/gruendungszuschuss-anspruch-antrag-hoehe-voraussetzungen/) — Fachportal
- [mw.niedersachsen.de – Startup-Zentren Niedersachsen](https://www.mw.niedersachsen.de/startseite/uber_uns/presse/presseinformationen/niedersachsen-starkt-sein-startup-okosystem-acht-startup-zentren-erhalten-forderung-bis-2028-247468.html) — Behörde (Land Niedersachsen)
- [gruender-coach.de – UG gründen 2026](https://gruender-coach.de/ratgeber/ug-gruenden/) — Ratgeber
- [va-ra.com – Gründungskosten GmbH/UG](https://va-ra.com/gruendungskosten-bei-gmbh-und-ug-wer-zahlt-was/) — Kanzlei
- [taxtify.de – Kleinunternehmerregelung 2026](https://taxtify.de/steuer-lexikon/kleinunternehmerregelung/) — Steuerportal
- [saasrebels.de – Stundensatz Software-Entwickler 2026](https://saasrebels.de/blog/stundensatz-software-entwickler-2026) — Fachportal
- [freelancermap.de – Stundensatz IT-Freelancer](https://www.freelancermap.de/blog/stundensatz-it-freelancer/) — Freelancer-Plattform
- `docs/research/2026-08-15-geschaeftsmodell-kosten.md` — eigene Vorrecherche (KI-Kostenbasis, Marktpreise Abo)
- `docs/research/2026-08-15-datenschutz-dsgvo.md` — eigene Vorrecherche (DSGVO-Grundlage, Art. 8)
- `docs/research/2026-08-15-lehrplaene-datenquellen.md` — eigene Vorrecherche (Lehrplanbezug)

## Offene Punkte

- **Anthropic-Nutzungsbedingungen zu Minderjährigen** nicht direkt einsehbar (Proxy blockiert
  anthropic.com) — vor jeder Kommerzialisierung zwingend zu klären, da Kinder direkte Endnutzer der
  KI-Ausgaben sind.
- **Kein deutscher/EdTech-spezifischer CAC-Benchmark** gefunden — die verwendete Spanne ist aus
  internationalen Consumer-Subscription-Zahlen abgeleitet; ein A/B-Test mit echtem Marketing-Budget
  in Phase 2 wäre der einzige Weg zu einer belastbaren deutschen Zahl.
  belastbaren
- **Ferienpaket-Preismodell ist unbelegte Hypothese**, kein Marktbeleg für Wiederkaufraten bei
  saisonalen Lern-Apps gefunden — müsste in Phase 2 des Plans real getestet werden.
- **Marktreport** (`docs/research/2026-08-15-markt-wettbewerb-business.md`) lag beim Schreiben dieses
  Reports noch nicht vor — Wettbewerbsannahmen hier sollten dagegen abgeglichen werden.
- **Exakte Preisstrategie für Verlagskooperation/White-Label** nicht auffindbar (keine öffentlichen
  Zahlen zu Ezri×Cornelsen oder Klett×schulKI) — nur die Existenz solcher Deals ist belegt, keine
  Konditionen.
- **Rechtsform- und Steuerfragen sind Sachstand, kein verbindlicher Rat** — vor jeder tatsächlichen
  Gründung mit Steuerberater und Rechtsanwalt abstimmen, insbesondere zur Haftungsfrage bei
  Kinderdaten.
