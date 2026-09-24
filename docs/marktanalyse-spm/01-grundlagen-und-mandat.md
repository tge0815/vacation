# Marktanalyse Strategisches Portfoliomanagement (SPM) im Enterprise-Umfeld

**Teil 1: Definition, Mandat, Kernanforderungen, Marktbild**
Stand: 24.09.2026. Quellen am Ende; Analystenberichte (Gartner, Forrester) waren
nur über Zusammenfassungen und Hersteller-Pressemitteilungen zugänglich. Die
Volltexte habe ich nicht gelesen. Das ist bei den Marktpositionen zu bedenken.

---

## 0. Kurzfazit

1. **SPM ist keine neue Disziplin, sondern ein Umetikettieren und Aufwerten von
   PPM.** Der Kern bleibt: begrenzte Mittel (Geld, Menschen, Management-Aufmerksamkeit)
   auf die Initiativen verteilen, die die Strategie am meisten voranbringen. Neu
   sind drei Dinge: (a) kontinuierliche statt jährliche Planung, (b) Funding von
   dauerhaften Produkten/Value Streams statt temporären Projekten, (c) Messung von
   Outcomes statt Output.
2. **Das eigentliche Problem ist nicht das Tool, sondern Entscheidungsrechte.**
   SPM scheitert typischerweise, weil niemand im Unternehmen die Macht hat, Vorhaben
   *abzubrechen* oder Budgets unterjährig umzuschichten. Software kann das sichtbar
   machen, aber nicht erzwingen.
3. **Der Softwaremarkt ist reif und konzentriert.** Planview und ServiceNow sind
   bei Gartner (MQ SPM 2026) und Forrester (Wave SPM Q2 2026) Leader. Dahinter
   folgen Broadcom Clarity, Planisware, IBM (Apptio/Targetprocess), Atlassian
   (Jira Align/Focus), Bizzdesign (EA-lastig), Cora u. a. Differenzierung läuft
   2026 fast ausschließlich über KI (Szenarioplanung, Agenten, Outcome-Tracking).
4. **Marktgrößenzahlen sind unzuverlässig.** Die kursierenden Werte (ca. 6–7 Mrd. USD
   2025, ~10 % CAGR) stammen von Report-Anbietern mit intransparenter Methodik
   und vermischen PPM, SPM und teilweise Beratung. Als Größenordnung taugen sie,
   als Planungsgrundlage nicht.

---

## 1. Was ist SPM? Definition und Abgrenzung

### Arbeitsdefinition

> SPM umfasst die Fähigkeiten, Prozesse und Technologien, mit denen ein
> Unternehmen ein Portfolio strategischer Optionen bildet und seine begrenzten
> Ressourcen darauf konzentriert, die unternehmensweite Strategie umzusetzen.
> *(sinngemäß nach Gartner-Glossar)*

Gartner grenzt den **Softwaremarkt** enger ab: Anwendungen für unternehmensweite
strategische Planung, die den Übergang zu einem Zielzustand modellieren und
kontinuierlich überwachen, mit Szenario-Modellierung und datenbasierter
Stakeholder-Entscheidung.

### Abgrenzung zu Nachbardisziplinen

Die Begriffe werden am Markt bewusst unscharf verwendet, weil jeder Hersteller
seine Herkunft zum Zentrum erklärt. Deshalb hier eine Abgrenzung:

| Disziplin | Frage, die sie beantwortet | Zeithorizont | Typischer Owner |
|---|---|---|---|
| **Strategische Planung** | *Wohin wollen wir?* (Ziele, OKRs, Themen) | 1–5 Jahre | Vorstand, Strategy Office |
| **SPM** | *Welche Investitionen bringen uns dorthin, und in welcher Reihenfolge?* | Quartal bis 3 Jahre, rollierend | Strategy/Transformation Office, EPMO, CFO-nah |
| **PPM (klassisch)** | *Welche Projekte machen wir, wie stehen sie?* | Projektlaufzeit | PMO, CIO |
| **Lean Portfolio Mgmt. (SAFe)** | *Wie verteilen wir Budget auf Value Streams, und welche Epics lassen wir durch?* | PI/Quartal | LPM-Team, Business Owner |
| **Enterprise Agile Planning (EAP)** | *Wie koordinieren wir viele agile Teams?* | Sprint bis PI | Engineering, RTE |
| **Enterprise Architecture (EA)** | *Welche Fähigkeiten/Systeme brauchen wir, wo sind Redundanzen?* | Zielbild | Chief Architect |
| **IT Financial Mgmt. (ITFM/TBM)** | *Was kostet IT, wofür genau?* | Geschäftsjahr | CFO/CIO-Finance |
| **Programm-/Projektmanagement** | *Wie liefern wir dieses Vorhaben?* | Vorhaben | Programm-/Projektleitung |

**Kritische Anmerkung:** In der Praxis ist SPM oft nur ein PPM-Tool mit einer
zusätzlichen Strategie-Ebene (OKR-Baum oben, Projektliste unten). Echtes SPM
liegt erst vor, wenn die Portfolioentscheidung **das Budget tatsächlich
bewegt**. Das lässt sich an einer Frage prüfen: *Wurde im letzten Quartal ein
laufendes, grundsätzlich gesundes Vorhaben gestoppt, weil ein anderes
strategisch wichtiger war?* Wenn nein, ist es Reporting und kein Portfoliomanagement.

### Was sich gegenüber klassischem PPM verschoben hat

| Dimension | Klassisches PPM | SPM (Anspruch) |
|---|---|---|
| Planungsrhythmus | Jahresbudget, einmal priorisiert | Rollierend, quartalsweise Re-Allokation |
| Finanzierungseinheit | Projekt (Scope/Zeit/Budget fix) | Produkt, Value Stream, Capability, Kapazitätstopf |
| Erfolgsmaß | On time / on budget | Outcome, Nutzen, Zielbeitrag |
| Scope | Meist IT | Alle Change-Investitionen (IT, Business, Capex/Opex) |
| Methodik | Wasserfall/Stage-Gate | Hybrid: Stage-Gate, agil, produktorientiert parallel |
| Governance | Gremien und Statusberichte | Guardrails, dezentrale Entscheidungen innerhalb von Leitplanken |
| Datenbasis | Manuell gepflegte Statusampeln | Integrierte Echtzeitdaten aus Delivery-Tools (Jira, ADO, ERP) |

---

## 2. Mandat: Wofür ist SPM zuständig?

Das Mandat ist der wichtigste und am häufigsten unterschätzte Teil. Ohne klares
Mandat wird SPM zur Reporting-Abteilung.

### 2.1 Kernmandate (Entscheidungsrechte)

Gartner nennt als typische SPM-Verantwortung: Strategy Mapping,
Investitions-/Funding-Entscheidungen, Kapazität vs. Nachfrage, Roadmapping,
Nutzen-/Wertverfolgung. Operationalisiert heißt das:

| # | Mandat | Konkrete Entscheidung | Ohne dieses Recht … |
|---|---|---|---|
| M1 | **Strategie übersetzen** | Strategische Ziele in messbare Themen/OKRs und Investitionsbereiche zerlegen | … bleibt Strategie ein Foliensatz |
| M2 | **Intake & Priorisierung** | Einheitlicher Eingang aller Vorhaben, einheitliche Bewertungslogik | … gewinnt, wer am lautesten ist oder das eigene Budget hat |
| M3 | **Investitionsallokation** | Budget auf Portfolios/Value Streams/Themen verteilen, unterjährig umschichten | … ist SPM nur Beobachter des Jahresbudgets |
| M4 | **Kapazitätssteuerung** | Nachfrage gegen reale Kapazität (Skills, Teams, Lieferanten) ausgleichen | … wird alles genehmigt und nichts fertig („zu viel WIP“) |
| M5 | **Stop/Continue/Pivot** | Laufende Vorhaben anhalten, kürzen, umlenken | … wächst das Portfolio nur, Sunk-Cost-Logik regiert |
| M6 | **Abhängigkeits- & Roadmap-Management** | Portfolioübergreifende Sequenzierung, Konflikte auflösen | … blockieren sich Programme gegenseitig |
| M7 | **Wert-/Nutzenrealisierung** | Business Cases nachhalten, Nutzen nach Go-Live messen | … wird Nutzen versprochen, aber nie geprüft |
| M8 | **Transparenz & Reporting** | Eine Wahrheit über Portfoliozustand für Vorstand/Aufsicht | … existieren fünf widersprüchliche Excel-Stände |
| M9 | **Governance-Rahmen setzen** | Guardrails, Gates, Schwellenwerte, Eskalationswege definieren | … ist jede Entscheidung Einzelfall |

**M3 und M5 sind die Lackmustests.** Die meisten Organisationen geben SPM M1, M2 und M8,
also Übersetzen, Sammeln und Berichten, verweigern aber M3 und M5. Das Budget
bleibt dann bei den Bereichen, und SPM hat keinen Hebel.

### 2.2 Wo SPM organisatorisch hängt, und warum das entscheidend ist

| Aufhängung | Stärke | Schwäche |
|---|---|---|
| **Unter CIO (IT-PMO)** | Nah an Delivery, Tooling vorhanden | Sieht nur IT-Budget; Business nimmt es als IT-Veranstaltung wahr |
| **Unter CFO** | Budgethoheit, Durchgriff | Tendenz zu Kostenkontrolle statt Wertsteuerung; wenig Delivery-Verständnis |
| **Unter CEO/COO (Strategy/Transformation Office)** | Legitimation, unternehmensweit | Kann zur „Folienfabrik“ werden, wenn keine Budgethoheit folgt |
| **Föderiert (zentrales EPMO + Bereichsportfolios)** | Skaliert, respektiert Bereichsverantwortung | Hoher Abstimmungsaufwand, Gefahr inkonsistenter Bewertung |

Meine Einschätzung: Ein zentrales Strategy/Transformation Office mit
**Co-Ownership durch den CFO** für die Allokationsentscheidung ist die robusteste
Konstellation. Ein rein IT-getriebenes SPM erreicht fast nie echte
Enterprise-Wirkung, auch wenn es der häufigste Startpunkt ist.

### 2.3 Normative Bezugsrahmen

- **PMI – The Standard for Portfolio Management (4. Aufl.)**: prinzipienbasiert,
  Themen u. a. Strategie, Governance, Kapazität/Fähigkeiten, Stakeholder, Wert,
  Risiko, agile Praktiken. Gut als Vokabular, aber wenig operativ.
- **SAFe Lean Portfolio Management**: Value-Stream-Funding, Lean Budgets,
  Guardrails, Portfolio-Kanban. Das bisherige „Participatory Budgeting“ wird nach
  aktuellen Berichten in „Strategic Investment Planning“ umbenannt, mit stärkerem
  Fokus auf finanzielle Verantwortung. *Kritik:* In der Praxis oft schwergewichtig;
  Value-Stream-Funding setzt eine Controlling-Umstellung voraus, die viele
  Unternehmen nie abschließen. Dann läuft SAFe-Vokabular auf klassischer Projektfinanzierung.
- **AXELOS MoP (Management of Portfolios)**: in Europa/öffentlicher Sektor verbreitet.
- **OKR-Frameworks**: liefern die Zielseite, aber keine Investitionslogik.

---

## 3. Kernanforderungen

### 3.1 Fachliche Anforderungen (was ein SPM-Ansatz/Tool können muss)

**A. Strategie & Ziele**
- Hierarchisches Zielmodell (Vision → Ziele/OKRs → Themen → Initiativen → Epics/Projekte)
- Nachvollziehbare Verknüpfung *jeder* Investition mit mindestens einem Ziel
- Zielerreichung messbar (KPIs, Key Results) und mit Delivery-Daten verbunden

**B. Intake & Bewertung**
- Einheitlicher Demand-Eingang (Ideen, Anträge, regulatorische Pflichten)
- Konfigurierbare Scoring-Modelle (strategischer Fit, Wert, Risiko, Dringlichkeit,
  Pflicht), z. B. WSJF, gewichtete Scores, Kosten-Nutzen
- Unterscheidung *Pflicht* (Regulatorik, Run) vs. *Wahl* (Change/Grow)

**C. Szenario- & Investitionsplanung** *(Kern-Differenzierung gegenüber PPM)*
- What-if-Szenarien: Budgetdeckel, Kapazitätsgrenzen, Prioritätsänderungen
- Portfolio-Optimierung unter Nebenbedingungen (effiziente Grenze)
- Mehrere Finanzierungsmodelle parallel: Projekt, Produkt/Value Stream,
  Kapazitätstöpfe, Capex/Opex-Trennung
- Rollierende Planung (Quartal) neben Jahresbudget

**D. Kapazität & Ressourcen**
- Top-down-Kapazitätsplanung auf Team-/Skill-Ebene (nicht nur Personen-Stunden)
- Nachfrage-/Angebotsabgleich über alle Portfolios
- Einbezug externer Kapazität (Dienstleister, Offshore)

**E. Roadmaps & Abhängigkeiten**
- Portfolioübergreifende Roadmaps, Meilensteine, Abhängigkeiten
- Hybride Delivery abbilden: Stage-Gate, Wasserfall, agil, Produkt im selben Portfolio

**F. Finanzen**
- Budget, Forecast, Ist (aus ERP), Earned Value wo sinnvoll
- Anbindung an ITFM/TBM für Run-Kosten (Stichwort Apptio)

**G. Nutzen & Outcomes**
- Business-Case-Management mit Nachverfolgung nach Abschluss
- Outcome-Metriken (nicht nur Meilensteine)

**H. Governance & Reporting**
- Konfigurierbare Workflows, Gates, Freigaben, Audit-Trail
- Vorstands- und Aufsichtsreporting, Portfolio-Health, Risiko-Heatmaps

### 3.2 Nicht-funktionale Anforderungen (im Enterprise oft entscheidender)

| Anforderung | Warum kritisch |
|---|---|
| **Integration** mit Jira, Azure DevOps, ServiceNow, SAP/ERP, HR-Systemen | Ohne automatische Datenflüsse veraltet SPM in Wochen, und manuelle Pflege tötet jede Einführung |
| **Datenmodell-Flexibilität** | Portfoliostrukturen ändern sich mit jeder Reorganisation |
| **Skalierung** | Tausende Vorhaben, zehntausende Nutzer, mehrere Geschäftseinheiten |
| **Rollen-/Rechtemodell** | Vertrauliche Strategie- und M&A-Themen, Mandantenfähigkeit |
| **Compliance/Datenschutz** | DSGVO, Datenresidenz (EU-Hosting), für Banken DORA/BAIT, Auslagerungsregeln; Betriebsrat bei Kapazitäts-/Personendaten (§ 87 BetrVG) |
| **Nachvollziehbarkeit** | Audit-Trail für Investitionsentscheidungen (Revision, Aufsicht) |
| **KI-Governance** | Nachvollziehbarkeit KI-gestützter Empfehlungen; EU AI Act relevant, sobald Personaldaten/-bewertung berührt werden |

### 3.3 Organisatorische Voraussetzungen (die eigentlichen Showstopper)

1. **Sponsoring auf Vorstandsebene** mit Bereitschaft, Budgethoheit abzugeben
2. **Einheitliche Bewertungslogik**, die Bereiche akzeptieren (politisch schwer)
3. **Controlling-Anpassung**, wenn produkt-/value-stream-basiert finanziert wird
4. **Datenqualität/-disziplin** in den Delivery-Tools
5. **Portfolio-Kompetenz**: Portfoliomanager sind keine Projektmanager mit größerer Liste
6. **Stop-Kultur**: Abbrüche müssen als Erfolg der Steuerung gelten, nicht als Scheitern

---

## 4. Marktbild (Software)

### 4.1 Marktgröße, mit Vorbehalt

- Custom Market Insights: SPM-Markt ca. **6,8 Mrd. USD (2025)** → ca. **16,3 Mrd. USD
  (2035)**, CAGR ~9,7 %; Nordamerika ~42 % Anteil; APAC wächst am schnellsten;
  Cloud-Segment wächst überdurchschnittlich.
- Andere Häuser (MarketsandMarkets, Mordor, Fortune BI) berichten für „PPM“
  Werte in ähnlicher Größenordnung, aber mit abweichenden Abgrenzungen.

**Kritik:** Diese Reports sind Pay-to-read-Produkte mit intransparenter
Methodik. Sie addieren teils Beratung, zählen Work-Management-Tools
(monday.com, Smartsheet) mit oder nicht, und widersprechen sich um Faktor 2–3.
Belastbarer sind Umsatzangaben börsennotierter Anbieter. Bei den großen Anbietern ist
SPM aber nicht separat ausgewiesen (ServiceNow, Broadcom, IBM) oder die Firma
ist privat (Planview, PE-finanziert). **Für eine belastbare Größenschätzung
wäre ein Bottom-up-Ansatz nötig** (Anzahl Großunternehmen × Durchdringung ×
typischer ACV). Das kann ein nächster Schritt sein.

### 4.2 Analystenpositionierung 2025/2026

| Report | Stand | Bekannte Positionen (aus Hersteller-PR bestätigt) |
|---|---|---|
| **Gartner MQ Strategic Portfolio Management** | Juni 2026, 9 Anbieter | Planview Leader (5. Jahr in Folge, höchste/weiteste Position), ServiceNow Leader; Cora vertreten |
| **Gartner Critical Capabilities SPM** | Juni 2026 | Use Cases: Enterprise Agile, projektzentriert, produktzentriert |
| **Forrester Wave SPM Tools** | Q2 2026, 13 Anbieter, 22 Kriterien | Leader: Planview, ServiceNow, Bizzdesign; Strong Performer: Atlassian; IBM/Apptio vertreten |
| **Gartner MQ Adaptive Project Mgmt. & Reporting** | Sept. 2025 (Nachbarmarkt) | Leader: monday.com, Planisware, Planview |

*Die vollständigen Listen und Positionen von Broadcom Clarity, Planisware, IBM
u. a. im SPM-MQ 2026 konnte ich nicht verifizieren.*

### 4.3 Anbietercluster

| Cluster | Anbieter | Herkunft/Stärke | Typisches Risiko |
|---|---|---|---|
| **SPM-Spezialisten (End-to-End)** | Planview (Portfolios, AdaptiveWork, Anvi-KI), Planisware, Broadcom Clarity, Cora | Tiefes Portfolio-, Ressourcen- und Finanzmodell | Komplexe, lange Einführung; Broadcom: Kunden- und Preispolitik nach VMware-Erfahrung kritisch prüfen |
| **Plattform-Anbieter** | ServiceNow SPM, (SAP über Partner/Portfolio & Project Mgmt.) | Integration in bestehende Plattform, Workflow, IT-Nähe | SPM als Anhängsel der ITSM-Plattform; Business-Akzeptanz; Lizenzkosten-Lock-in |
| **Agile/EAP-Herkunft** | Atlassian (Jira Align, Focus), IBM Targetprocess, Digital.ai | Nähe zu Delivery-Teams, SAFe-Abbildung | Schwach in Finanzen/Business-Portfolios außerhalb IT |
| **Finanz-/TBM-Herkunft** | IBM Apptio | Kostentransparenz, IT-Finanzen | Portfolio-Entscheidungslogik weniger ausgeprägt |
| **EA-Herkunft** | Bizzdesign, (LeanIX/SAP, Ardoq) | Capability-basierte Planung, Architektur-Zielbild | Wenig Delivery- und Ressourcensteuerung |
| **Work-Management von unten** | monday.com, Smartsheet, Asana, Wrike | Schnelle Adoption, niedrige Einstiegshürde | Fehlende Enterprise-Tiefe bei Szenario/Finanzen; Wildwuchs |
| **Strategy-/OKR-Tools** | WorkBoard, Quantive u. a. | Zielseite, Management-Rhythmus | Keine Investitions- und Kapazitätslogik |

### 4.4 Markttrends 2025/2026

1. **KI als Hauptdifferenzierung.** Forrester sieht den Abstand zwischen Spitze
   und Rest vor allem darin, wie gezielt KI in die wichtigen Entscheidungen
   eingebettet ist. Beispiele: Planview Anvi (Okt. 2025; Agenten-Studio,
   Szenarioplanung, MCP-Server), ServiceNow Now Assist for SPM (KI-Statusberichte,
   Zielgesundheit mit Konfidenzwerten).
   *Kritik:* Die meisten KI-Features sind derzeit Zusammenfassungen,
   Status-Generierung und Anomalie-Erkennung. Echte Portfolio-Optimierung
   (Mixed-Integer-Optimierung unter Nebenbedingungen) gibt es seit 20 Jahren und
   wurde selten genutzt, weil nicht die Mathematik gefehlt hat, sondern Daten und
   Entscheidungsbereitschaft. Daran ändert KI nichts Grundsätzliches.
2. **„Wer steuert die KI-Investitionen?“** SPM wird als Instrument positioniert,
   den ROI der massiven KI-Budgets nachzuweisen. Das ist aktuell das stärkste
   Verkaufsargument gegenüber Vorständen.
3. **Konvergenz der Nachbarmärkte.** EA, ITFM, EAP und SPM wachsen zusammen
   (IBM: Apptio + Targetprocess; SAP: LeanIX; Atlassian: Jira Align + Focus;
   Planview: breite Suite). Der Kunde kauft zunehmend Plattform statt Best-of-Breed.
4. **Vom Projekt zum Produkt.** Gartner betont, dass produktzentrierte Delivery
   Rolle und Mandat von Portfoliomanagern verändert. Das hat Folgen für
   Controlling, Aktivierung (Capex) und Budgetprozesse.
5. **Nachfrage-Treiber:** PMI-Studie (Dez. 2025, >5.800 Befragte) zeigt: nur 50 %
   der Projekte liefern Wert über Aufwand; 35 % der Executives nennen die Lücke
   zwischen Planung und Umsetzung als Top-Hindernis für Transformation.
   (*Vorsicht:* PMI ist Interessenverband der Projektmanagement-Profession.)

---

## 5. Kritische Einordnung: Risiken und Gegenargumente

- **Tool-first-Falle:** Die meisten SPM-Einführungen sind Software-Projekte, die
  ein Governance-Problem lösen sollen. Wenn Mandat M3/M5 fehlt, erzeugt das
  teuerste Tool nur hübscheres Reporting. Die Einführung sollte mit
  Entscheidungsrechten beginnen, nicht mit der Toolauswahl.
- **Analystenberichte sind keine neutrale Marktabbildung.** MQ/Wave bewerten eine
  kleine, vorselektierte Anbieterzahl (9 bzw. 13). Hersteller-PR zitiert
  selektiv. Für Auswahlentscheidungen sind Referenzkunden gleicher Branche und
  Größe aussagekräftiger.
- **Scheinpräzision:** Scoring-Modelle mit 15 gewichteten Kriterien erzeugen
  Zahlen mit zwei Nachkommastellen aus geschätzten Inputs. Das legitimiert
  politische Entscheidungen, statt sie zu verbessern. Wenige, harte Kriterien sind
  oft besser.
- **Kontinuierliche Planung kollidiert mit Jahresbudget und HGB/IFRS-Logik.**
  Ohne Mitwirkung von Controlling bleibt „quarterly re-allocation“ Theorie.
- **Agil vs. Governance:** Zu viele Gates bremsen agile Teams; zu wenige machen
  das Portfolio unsteuerbar. Hier bestehen echte Zielkonflikte, keine lösbaren
  Missverständnisse.
- **Mitbestimmung (DE):** Kapazitäts- und Ressourcenplanung auf Personenebene ist
  mitbestimmungspflichtig und verzögert Rollouts erheblich, wenn man es nicht
  früh adressiert.
- **Vendor-Lock-in:** Plattformanbieter (ServiceNow, Atlassian, IBM) bündeln SPM
  günstig ins Bestandsgeschäft. Der Wechselpreis zeigt sich erst bei der Verlängerung.

---

## 6. Offene Punkte für die nächsten Teile

Die Anfrage brach nach „…und dann möchte ich das als erstes“ ab. Mögliche
Fortsetzungen, zwischen denen zu entscheiden ist:

1. Detaillierter **Anbietervergleich** (Top 6–8, Funktionen, Preismodelle, DACH-Präsenz)
2. **Bottom-up-Marktgröße** DACH/Europa
3. **Zielgruppen-/Käuferanalyse** (wer kauft, Buying Center, Kaufauslöser)
4. **Lückenanalyse / Positionierung** für ein eigenes Angebot (Produkt oder Beratung)
5. **Reifegradmodell & Einführungs-Roadmap** für ein konkretes Unternehmen

---

## Quellen

- Gartner Glossar – Strategic Portfolio Management: https://www.gartner.com/en/information-technology/glossary/strategic-portfolio-management
- Gartner Peer Insights – SPM Markt: https://www.gartner.com/reviews/market/strategic-portfolio-management
- Gartner – Strengthen your SPM Plan: https://www.gartner.com/en/information-technology/role/strategic-portfolio-management
- Gartner – Critical Capabilities for SPM (2026): https://www.gartner.com/en/documents/7993337
- Planview PR – Leader im Gartner MQ SPM 2026: https://newsroom.planview.com/planview-again-named-by-gartner-as-a-leader-in-strategic-portfolio-management-2/
- Cora Systems – im Gartner MQ SPM 2026: https://corasystems.com/news/cora-systems-gartner-magic-quadrant-spm
- Forrester Wave SPM Tools Q2 2026: https://www.forrester.com/report/the-forrester-wave-tm-strategic-portfolio-management-tools-q2-2026/RES193238
- Forrester Blog – Why SPM Is Entering A New Era: https://www.forrester.com/blogs/why-strategic-portfolio-management-is-entering-a-new-era/
- ServiceNow – Forrester Leader SPM: https://www.servicenow.com/au/workflow/news/forrester-leader-strategic-portfolio-management.html
- Bizzdesign – Forrester Wave SPM Q2 2026: https://bizzdesign.com/analyst-report/spm-tool-forrester-wave-q2-2026
- Atlassian – Strong Performer Forrester Wave SPM: https://www.atlassian.com/blog/company-news/forrester-strategic-portfolio-management-2026
- Apptio – Forrester Wave SPM: https://www.apptio.com/resources/analyst-reports/the-forrester-wave-strategic-portfolio-management-tools/
- Planisware – Leader Gartner MQ APMR 2025: https://www.businesswire.com/news/home/20250922815353/en/Planisware-a-Leader-in-2025-Gartner-Magic-Quadrant-for-Adaptive-Project-Management-Reporting-Four-Years-Running
- monday.com – Leader Gartner MQ APMR 2025: https://ir.monday.com/news-and-events/news-releases/news-details/2025/monday-com-Named-a-Leader-in-the-2025-Gartner-Magic-Quadrant-for-Adaptive-Project-Management-and-Reporting-for-the-Fourth-Consecutive-Year/default.aspx
- Planview – Market Momentum H2 2026 (Anvi, Scenario Planning): https://newsroom.planview.com/planview-extends-market-momentum-into-second-half-of-2026/
- Planisware – AI-driven SPM Vendors 2026 (Herstellerquelle!): https://planisware.com/resources/planisware-hub/top-6-ai-driven-strategic-portfolio-management-vendors-2026
- Custom Market Insights – SPM Market Size: https://www.custommarketinsights.com/report/strategic-portfolio-management-market/
- MarketsandMarkets – PPM Market: https://www.marketsandmarkets.com/Market-Reports/project-portfolio-management-software-market-225932595.html
- PMI – Strategy-Execution Gap (Dez. 2025): https://www.pmi.org/about/press-media/2025/new-pmi-research-reveals-strategy-execution-gap-is-undermining-transformation-and-how-to-close-it
- PMI – Standard for Portfolio Management 4th Ed.: https://www.pmi.org/standards/for-portfolio-management
- SAFe Lean Budgets / Strategic Investment Planning: https://agility-at-scale.com/safe/lpm/lean-budgets/
