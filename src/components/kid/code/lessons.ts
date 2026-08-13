// Lehrplan der Spiele-Werkstatt – für ~11 Jahre. Jede Lektion hat eine kurze
// Erklärung, ein Gerüst mit Lücken (NICHT die Lösung), gestufte Tipps und eine
// separate Lösung. Koordinaten: x nach rechts, y nach unten (0 = oben).

export type Cell = { x: number; y: number };

// Gegner, der zwischen from/to auf einer Achse pendelt.
export type Enemy = { axis: "h" | "v"; line: number; from: number; to: number; speed: number };

type Help = {
  explain: string;
  starter: string;
  hints: string[];
  solution: string;
  bridgeJs: string;
  bridgeCs: string;
  coins: number;
};

// Welt 1: Befehle nacheinander (Sequenz-Engine).
export type SeqLesson = Help & {
  key: string;
  title: string;
  goal: string;
  cols: number;
  rows: number;
  fox: Cell;
  star: Cell;
};

// Welt 2–10: Live-Spiel (Game-Loop-Engine).
export type GameLesson = Help & {
  key: string;
  world: number;
  title: string;
  goal: string;
  cols: number;
  rows: number;
  fox: Cell;
  winOn: "collectAll" | "reachGoal";
  targets?: Cell[];
  targetIcon?: string;
  goalCell?: Cell;
  enemies?: Enemy[];
  gravity?: boolean;
  timeLimit?: number;
};

// ---------------------------------------------------------------- Welt 1
export const WORLD1: SeqLesson[] = [
  {
    key: "w1l1",
    title: "Erste Schritte",
    goal: "Bring den Fuchs zum Stern ⭐.",
    explain:
      "Der Fuchs steht auf einem Gitter. Mit fuchs.rechts(n) läuft er n Felder nach rechts. Probier verschiedene Zahlen aus!",
    cols: 6,
    rows: 4,
    fox: { x: 0, y: 1 },
    star: { x: 4, y: 1 },
    starter: "// Wie viele Felder bis zum Stern? Ändere die Zahl!\nfuchs.rechts(1)\n",
    hints: [
      "Zähl die Felder zwischen Fuchs und Stern.",
      "Der Stern ist genau 4 Felder rechts.",
    ],
    solution: "fuchs.rechts(4)\n",
    bridgeJs: "fuchs.rechts(4)",
    bridgeCs: "transform.position += Vector3.right * 4;",
    coins: 2,
  },
  {
    key: "w1l2",
    title: "Um die Ecke",
    goal: "Erst nach rechts, dann nach oben zum Stern ⭐.",
    explain: "Nach oben geht es mit fuchs.hoch(n), nach unten mit fuchs.runter(n).",
    cols: 6,
    rows: 5,
    fox: { x: 0, y: 4 },
    star: { x: 4, y: 1 },
    starter: "// Erst rechts, dann hoch. Ergänze die zweite Zeile!\nfuchs.rechts(4)\n",
    hints: [
      "Nach rechts stimmt schon – wie viele Felder nach oben?",
      "Es sind 3 Felder nach oben: fuchs.hoch(3)",
    ],
    solution: "fuchs.rechts(4)\nfuchs.hoch(3)\n",
    bridgeJs: "fuchs.rechts(4)\nfuchs.hoch(3)",
    bridgeCs: "transform.position += Vector3.right * 4 + Vector3.up * 3;",
    coins: 2,
  },
  {
    key: "w1l3",
    title: "Clever wiederholen",
    goal: "Bring den Fuchs mit einer Schleife zum Stern ⭐.",
    explain:
      "Statt oft dasselbe zu tippen, nimmt man eine Schleife: wiederhole(n, () => { ... }) macht den Inhalt n-mal.",
    cols: 8,
    rows: 3,
    fox: { x: 0, y: 1 },
    star: { x: 7, y: 1 },
    starter:
      "// Die Schleife läuft noch zu selten. Wie oft muss der Fuchs 1 Feld nach rechts?\nwiederhole(2, () => {\n  fuchs.rechts(1)\n})\n",
    hints: [
      "Zähl die Felder bis zum Stern.",
      "Es sind 7 Felder – ändere die 2 in eine 7.",
    ],
    solution: "wiederhole(7, () => {\n  fuchs.rechts(1)\n})\n",
    bridgeJs: "wiederhole(7, () => fuchs.rechts(1))",
    bridgeCs: "for (int i = 0; i < 7; i++)\n    transform.position += Vector3.right;",
    coins: 3,
  },
];

// -------------------------------------------------------- Welt 2–10 (Spiel)
const MOVE = `onUpdate(() => {
  if (taste("rechts")) fuchs.x += 0.18
  if (taste("links"))  fuchs.x -= 0.18
  if (taste("hoch"))   fuchs.y -= 0.18
  if (taste("runter")) fuchs.y += 0.18
})`;

export const GAME_LESSONS: GameLesson[] = [
  // ---- Welt 2: Steuern & Game-Loop
  {
    key: "w2l1",
    world: 2,
    title: "Steuere den Fuchs",
    goal: "Steuere den Fuchs mit den Pfeiltasten zum Stern ⭐.",
    explain:
      "onUpdate(() => { ... }) läuft in JEDEM Bild (Frame). taste(\"rechts\") ist wahr, solange die Taste gedrückt ist. So bewegst du den Fuchs live.",
    cols: 7,
    rows: 5,
    fox: { x: 0, y: 4 },
    winOn: "reachGoal",
    goalCell: { x: 6, y: 0 },
    starter:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.18\n  // Der Stern liegt auch OBEN. Ergänze die Steuerung nach oben!\n})\n',
    hints: [
      'Nach oben steuerst du mit taste("hoch").',
      "Bewege den Fuchs dann mit fuchs.y -= 0.18 nach oben.",
      'if (taste("hoch")) fuchs.y -= 0.18',
    ],
    solution: 'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.18\n  if (taste("hoch"))   fuchs.y -= 0.18\n})\n',
    bridgeJs: 'if (taste("hoch")) fuchs.y -= 0.18',
    bridgeCs: "if (Input.GetKey(KeyCode.UpArrow))\n    transform.position += Vector3.up * speed * Time.deltaTime;",
    coins: 3,
  },
  {
    key: "w2l2",
    world: 2,
    title: "Sammle alle Münzen",
    goal: "Sammle alle 🪙 mit den Pfeiltasten ein.",
    explain:
      "Jetzt ein echtes Mini-Spiel! Du brauchst die Steuerung in alle vier Richtungen. Achte auf die Zeit.",
    cols: 8,
    rows: 6,
    fox: { x: 0, y: 0 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 1 }, { x: 3, y: 4 }, { x: 6, y: 5 }, { x: 1, y: 3 }, { x: 5, y: 0 }],
    targetIcon: "🪙",
    timeLimit: 25,
    starter:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.18\n  if (taste("links"))  fuchs.x -= 0.18\n  // Es fehlen noch hoch und runter!\n})\n',
    hints: [
      'taste("hoch") und taste("runter") fehlen noch.',
      "Nach oben: fuchs.y -= 0.18, nach unten: fuchs.y += 0.18",
      "Mach den Fuchs schneller: nimm 0.24 statt 0.18.",
    ],
    solution: MOVE + "\n",
    bridgeJs: 'if (taste("runter")) fuchs.y += 0.18',
    bridgeCs: "if (Input.GetKey(KeyCode.DownArrow))\n    transform.position += Vector3.down * speed * Time.deltaTime;",
    coins: 4,
  },

  // ---- Welt 3: Variablen & Punkte
  {
    key: "w3l1",
    world: 3,
    title: "Punkte zählen",
    goal: "Sammle alle Münzen und zeige deine Punkte oben an.",
    explain:
      "Eine Variable ist wie eine beschriftete Kiste zum Merken. let punkte = 0 erstellt sie, punkte += 1 legt eins dazu. Mit hud(text) zeigst du etwas oben an. beimEinsammeln(() => {...}) läuft immer, wenn du eine Münze fängst.",
    cols: 8,
    rows: 6,
    fox: { x: 0, y: 0 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 0 }, { x: 4, y: 3 }, { x: 2, y: 5 }, { x: 6, y: 4 }],
    targetIcon: "🪙",
    starter:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  // TODO: zähle +1 und zeige die Punkte mit hud(...) an\n})\n\n' + MOVE + "\n",
    hints: [
      "Die Kiste ist oben schon da: let punkte = 0.",
      "In beimEinsammeln kommt: punkte += 1",
      'Zeig es an: hud("Punkte: " + punkte)',
    ],
    solution:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  punkte += 1\n  hud("Punkte: " + punkte)\n})\n\n' + MOVE + "\n",
    bridgeJs: "punkte += 1",
    bridgeCs: "int score = 0;\nscore += 1;",
    coins: 3,
  },
  {
    key: "w3l2",
    world: 3,
    title: "Wie viele noch?",
    goal: "Zeige an, wie viele Münzen noch fehlen.",
    explain:
      "Mit -= ziehst du von einer Variable ab. Starte bei der Gesamtzahl und zähl runter, bis 0 – dann sind alle da.",
    cols: 8,
    rows: 5,
    fox: { x: 0, y: 2 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 2 }, { x: 4, y: 0 }, { x: 2, y: 4 }],
    targetIcon: "🪙",
    starter:
      'let uebrig = 3\n\nbeimEinsammeln(() => {\n  // TODO: eins weniger, dann mit hud anzeigen\n})\n\n' + MOVE + "\n",
    hints: [
      "Zieh eins ab: uebrig -= 1",
      'Dann anzeigen: hud("Noch: " + uebrig)',
    ],
    solution:
      'let uebrig = 3\n\nbeimEinsammeln(() => {\n  uebrig -= 1\n  hud("Noch: " + uebrig)\n})\n\n' + MOVE + "\n",
    bridgeJs: "uebrig -= 1",
    bridgeCs: "remaining -= 1;",
    coins: 3,
  },

  // ---- Welt 4: Wenn-dann (Bedingungen)
  {
    key: "w4l1",
    world: 4,
    title: "Turbo-Fuchs",
    goal: "Halte die Leertaste für Turbo und erreiche den Stern rechtzeitig.",
    explain:
      "Mit wenn (if) triffst du Entscheidungen: if (Bedingung) { ... } läuft nur, wenn die Bedingung wahr ist. Hier: schneller, wenn die Leertaste (taste(\"turbo\")) gedrückt ist.",
    cols: 10,
    rows: 3,
    fox: { x: 0, y: 1 },
    winOn: "reachGoal",
    goalCell: { x: 9, y: 1 },
    timeLimit: 7,
    starter:
      'onUpdate(() => {\n  let tempo = 0.12\n  // TODO: wenn taste("turbo") gedrückt ist, mach tempo größer (z.B. 0.35)\n  if (taste("rechts")) fuchs.x += tempo\n})\n',
    hints: [
      'Baue eine Bedingung ein: if (taste("turbo")) { ... }',
      "Setze darin tempo = 0.35",
      "Halte beim Spielen die Leertaste gedrückt.",
    ],
    solution:
      'onUpdate(() => {\n  let tempo = 0.12\n  if (taste("turbo")) tempo = 0.35\n  if (taste("rechts")) fuchs.x += tempo\n})\n',
    bridgeJs: 'if (taste("turbo")) tempo = 0.35',
    bridgeCs: "if (Input.GetKey(KeyCode.Space)) speed = 0.35f;",
    coins: 3,
  },
  {
    key: "w4l2",
    world: 4,
    title: "Wenn – sonst",
    goal: "Zeige 'TURBO', wenn du boostest, sonst 'normal'. Und erreiche den Stern.",
    explain:
      "if / else heißt: wenn – sonst. if (Bedingung) { A } else { B } macht A, wenn die Bedingung wahr ist, sonst B.",
    cols: 10,
    rows: 3,
    fox: { x: 0, y: 1 },
    winOn: "reachGoal",
    goalCell: { x: 9, y: 1 },
    timeLimit: 8,
    starter:
      'onUpdate(() => {\n  let tempo = 0.12\n  if (taste("turbo")) {\n    tempo = 0.35\n    // TODO: hud("🚀 TURBO")\n  } else {\n    // TODO: hud("🚶 normal")\n  }\n  if (taste("rechts")) fuchs.x += tempo\n})\n',
    hints: [
      'In den if-Block: hud("🚀 TURBO")',
      'In den else-Block: hud("🚶 normal")',
    ],
    solution:
      'onUpdate(() => {\n  let tempo = 0.12\n  if (taste("turbo")) {\n    tempo = 0.35\n    hud("🚀 TURBO")\n  } else {\n    hud("🚶 normal")\n  }\n  if (taste("rechts")) fuchs.x += tempo\n})\n',
    bridgeJs: 'if (schnell) { ... } else { ... }',
    bridgeCs: "if (fast) { /* ... */ } else { /* ... */ }",
    coins: 3,
  },

  // ---- Welt 5: Gegner & Kollision
  {
    key: "w5l1",
    world: 5,
    title: "Weiche aus!",
    goal: "Erreiche den Stern, ohne den Gegner 👾 zu berühren.",
    explain:
      "Gegner bewegen sich hin und her. Berührst du einen, ist das Spiel vorbei – das nennt man Kollision. Beobachte das Muster und lauf im richtigen Moment durch.",
    cols: 9,
    rows: 5,
    fox: { x: 0, y: 2 },
    winOn: "reachGoal",
    goalCell: { x: 8, y: 2 },
    enemies: [{ axis: "v", line: 4, from: 0, to: 4, speed: 0.07 }],
    starter: MOVE + "\n// Tipp: Der Gegner pendelt hoch und runter. Warte den richtigen Moment ab!\n",
    hints: [
      "Der Gegner in der Mitte bewegt sich senkrecht.",
      "Warte, bis er ganz oben oder unten ist, dann lauf schnell durch.",
      "Du kannst seine Position lesen: hud(\"Gegner y: \" + Math.round(gegner[0].y))",
    ],
    solution: MOVE + "\n",
    bridgeJs: "// Kollision: OnCollisionEnter in Unity",
    bridgeCs: "void OnCollisionEnter2D(Collision2D c) { /* getroffen */ }",
    coins: 3,
  },
  {
    key: "w5l2",
    world: 5,
    title: "Doppelte Gefahr",
    goal: "Zwei Gegner! Erreiche trotzdem den Stern ⭐.",
    explain:
      "Jetzt patrouillieren zwei Gegner. Plane deine Route und nutze Lücken. Manchmal hilft Warten mehr als Rennen.",
    cols: 10,
    rows: 5,
    fox: { x: 0, y: 2 },
    winOn: "reachGoal",
    goalCell: { x: 9, y: 2 },
    enemies: [
      { axis: "v", line: 3, from: 0, to: 4, speed: 0.08 },
      { axis: "v", line: 6, from: 0, to: 4, speed: 0.06 },
    ],
    starter: MOVE + "\n// Zwei Gegner – finde die Lücken!\n",
    hints: [
      "Beide Gegner bewegen sich senkrecht, aber unterschiedlich schnell.",
      "Geh Gegner für Gegner: erst an dem einen vorbei, dann warten, dann am nächsten.",
    ],
    solution: MOVE + "\n",
    bridgeJs: "// mehrere Collider im Spiel",
    bridgeCs: "// Tag \"Enemy\" + OnCollisionEnter2D",
    coins: 4,
  },

  // ---- Welt 6: Funktionen
  {
    key: "w6l1",
    world: 6,
    title: "Bau dir einen Befehl",
    goal: "Baue die Funktion 'schritt' fertig und erreiche den Stern.",
    explain:
      "Eine Funktion ist ein eigener Befehl, den du selbst baust: function schritt() { ... }. Einmal schreiben, so oft benutzen wie du willst. In Unity heißen sie Methoden.",
    cols: 9,
    rows: 3,
    fox: { x: 0, y: 1 },
    winOn: "reachGoal",
    goalCell: { x: 8, y: 1 },
    starter:
      "// TODO: baue die Funktion fertig\nfunction schritt() {\n  // hier: den Fuchs nach rechts bewegen\n}\n\nonUpdate(() => {\n  if (taste(\"rechts\")) schritt()\n})\n",
    hints: [
      "In die Funktion kommt: fuchs.x += 0.2",
      "Aufgerufen wird sie schon unten mit schritt().",
    ],
    solution:
      "function schritt() {\n  fuchs.x += 0.2\n}\n\nonUpdate(() => {\n  if (taste(\"rechts\")) schritt()\n})\n",
    bridgeJs: "function schritt() { fuchs.x += 0.2 }",
    bridgeCs: "void Schritt() { transform.position += Vector3.right * speed; }",
    coins: 4,
  },
  {
    key: "w6l2",
    world: 6,
    title: "Funktion mit Zahl",
    goal: "Gib deiner Funktion eine Zahl mit (Parameter) und sammle die Münzen.",
    explain:
      "Funktionen können etwas mitbekommen – das nennt man Parameter: function gehe(menge) { ... }. Beim Aufruf gehe(0.2) steckt menge dann 0.2.",
    cols: 8,
    rows: 4,
    fox: { x: 0, y: 1 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 1 }, { x: 4, y: 3 }],
    targetIcon: "🪙",
    starter:
      "function gehe(menge) {\n  // TODO: bewege den Fuchs um 'menge' nach rechts\n}\n\nonUpdate(() => {\n  if (taste(\"rechts\")) gehe(0.2)\n  if (taste(\"links\"))  gehe(-0.2)\n  if (taste(\"hoch\"))   fuchs.y -= 0.2\n  if (taste(\"runter\")) fuchs.y += 0.2\n})\n",
    hints: [
      "In die Funktion: fuchs.x += menge",
      "So gilt gehe(0.2) für rechts und gehe(-0.2) für links.",
    ],
    solution:
      "function gehe(menge) {\n  fuchs.x += menge\n}\n\nonUpdate(() => {\n  if (taste(\"rechts\")) gehe(0.2)\n  if (taste(\"links\"))  gehe(-0.2)\n  if (taste(\"hoch\"))   fuchs.y -= 0.2\n  if (taste(\"runter\")) fuchs.y += 0.2\n})\n",
    bridgeJs: "function gehe(menge) { fuchs.x += menge }",
    bridgeCs: "void Gehe(float menge) { transform.position += Vector3.right * menge; }",
    coins: 4,
  },

  // ---- Welt 7: Listen
  {
    key: "w7l1",
    world: 7,
    title: "Die Münz-Liste",
    goal: "Zeige mit hud an, wie viele Münzen noch übrig sind – aus der Liste.",
    explain:
      "Eine Liste hält viele Dinge auf einmal. Im Spiel liegen alle Münzen in der Liste muenzen. muenzen.length ist die Anzahl. Eine schon eingesammelte Münze hat .weg = true.",
    cols: 8,
    rows: 6,
    fox: { x: 0, y: 0 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 0 }, { x: 4, y: 3 }, { x: 2, y: 5 }, { x: 6, y: 4 }, { x: 1, y: 2 }],
    targetIcon: "🪙",
    starter:
      'onUpdate(() => {\n  // TODO: zähle die übrigen Münzen aus der Liste und zeige sie an\n  if (taste("rechts")) fuchs.x += 0.2\n  if (taste("links"))  fuchs.x -= 0.2\n  if (taste("hoch"))   fuchs.y -= 0.2\n  if (taste("runter")) fuchs.y += 0.2\n})\n',
    hints: [
      "Die übrigen Münzen: muenzen.filter(m => !m.weg).length",
      'Zeig es an: hud("Übrig: " + muenzen.filter(m => !m.weg).length)',
    ],
    solution:
      'onUpdate(() => {\n  hud("Übrig: " + muenzen.filter(m => !m.weg).length)\n  if (taste("rechts")) fuchs.x += 0.2\n  if (taste("links"))  fuchs.x -= 0.2\n  if (taste("hoch"))   fuchs.y -= 0.2\n  if (taste("runter")) fuchs.y += 0.2\n})\n',
    bridgeJs: "muenzen.filter(m => !m.weg).length",
    bridgeCs: "coins.Count(m => !m.collected)",
    coins: 4,
  },

  // ---- Welt 8: Zufall
  {
    key: "w8l1",
    world: 8,
    title: "Glücks-Fuchs",
    goal: "Jede Münze gibt zufällig 1–3 Punkte. Sammle alle und zeig die Summe.",
    explain:
      "Zufall macht Spiele spannend: zufall(1, 3) gibt eine Zufallszahl von 1 bis 3 (wie ein Würfel). So bekommt jede Münze mal mehr, mal weniger Punkte.",
    cols: 8,
    rows: 5,
    fox: { x: 0, y: 2 },
    winOn: "collectAll",
    targets: [{ x: 7, y: 2 }, { x: 3, y: 0 }, { x: 5, y: 4 }, { x: 1, y: 3 }],
    targetIcon: "🪙",
    starter:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  // TODO: zufällige Punkte dazuzählen und anzeigen\n})\n\n' + MOVE + "\n",
    hints: [
      "Würfle die Punkte: let gewinn = zufall(1, 3)",
      "Dann: punkte += gewinn",
      'Anzeigen: hud("Punkte: " + punkte)',
    ],
    solution:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  punkte += zufall(1, 3)\n  hud("Punkte: " + punkte)\n})\n\n' + MOVE + "\n",
    bridgeJs: "punkte += zufall(1, 3)",
    bridgeCs: "score += Random.Range(1, 4);",
    coins: 4,
  },

  // ---- Welt 9: Schwerkraft & Springen
  {
    key: "w9l1",
    world: 9,
    title: "Spring zum Stern",
    goal: "Springe hoch und erreiche den fliegenden Stern ⭐.",
    explain:
      "Schwerkraft zieht den Fuchs in jedem Frame ein bisschen nach unten. Mit fuchs.springe() hüpft er hoch – aber nur, wenn er am Boden ist (fuchs.amBoden ist dann wahr). Genau wie ein Rigidbody in Unity.",
    cols: 8,
    rows: 6,
    fox: { x: 0, y: 5 },
    winOn: "reachGoal",
    goalCell: { x: 4, y: 2 },
    gravity: true,
    starter:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.15\n  if (taste("links"))  fuchs.x -= 0.15\n  // TODO: springen, wenn "hoch" gedrückt UND der Fuchs am Boden ist\n})\n',
    hints: [
      'Nur am Boden springen: if (taste("hoch") && fuchs.amBoden)',
      "Darin dann: fuchs.springe()",
      "Lauf nach rechts und spring im richtigen Moment zum Stern.",
    ],
    solution:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.15\n  if (taste("links"))  fuchs.x -= 0.15\n  if (taste("hoch") && fuchs.amBoden) fuchs.springe()\n})\n',
    bridgeJs: 'if (taste("hoch") && fuchs.amBoden) fuchs.springe()',
    bridgeCs: "if (Input.GetKeyDown(KeyCode.Space) && grounded)\n    rb.velocity = Vector2.up * jump;",
    coins: 5,
  },

  // ---- Welt 10: Dein eigenes Spiel (Capstone)
  {
    key: "w10l1",
    world: 10,
    title: "Der große Fuchs-Run",
    goal: "Sammle ALLE Münzen, weiche dem Gegner aus und zeig deine Punkte. Alles zusammen!",
    explain:
      "Jetzt alles auf einmal: Steuerung, eine Variable für die Punkte, beimEinsammeln, ein Gegner und die Zeit. Du bist jetzt Spiele-Programmierer! 🎮",
    cols: 10,
    rows: 6,
    fox: { x: 0, y: 0 },
    winOn: "collectAll",
    targets: [{ x: 9, y: 0 }, { x: 5, y: 3 }, { x: 2, y: 5 }, { x: 8, y: 5 }, { x: 3, y: 1 }, { x: 6, y: 4 }],
    targetIcon: "🪙",
    enemies: [{ axis: "v", line: 5, from: 0, to: 5, speed: 0.07 }],
    timeLimit: 40,
    starter:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  // TODO: Punkte hochzählen und mit hud anzeigen\n})\n\nonUpdate(() => {\n  // TODO: Steuerung in alle vier Richtungen (0.22)\n})\n',
    hints: [
      "Punkte: in beimEinsammeln punkte += 1 und hud(\"Punkte: \" + punkte).",
      "Steuerung wie in Welt 2 – aber mit Tempo 0.22.",
      "Weiche dem Gegner in der Mitte aus, während du sammelst.",
    ],
    solution:
      'let punkte = 0\n\nbeimEinsammeln(() => {\n  punkte += 1\n  hud("Punkte: " + punkte)\n})\n\nonUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.22\n  if (taste("links"))  fuchs.x -= 0.22\n  if (taste("hoch"))   fuchs.y -= 0.22\n  if (taste("runter")) fuchs.y += 0.22\n})\n',
    bridgeJs: "// dein erstes komplettes Spiel!",
    bridgeCs: "// Update(), Rigidbody, Collider, Score – alles zusammen",
    coins: 6,
  },
];

// ---- Welten-Struktur für die Übersicht --------------------------------
export type WorldMeta = { n: number; title: string; kind: "seq" | "game"; keys: string[] };

export const WORLD_TITLES: Record<number, string> = {
  1: "Welt 1 · Bewegung & Schleifen",
  2: "Welt 2 · Steuern & Game-Loop",
  3: "Welt 3 · Variablen & Punkte",
  4: "Welt 4 · Wenn-dann",
  5: "Welt 5 · Gegner & Kollision",
  6: "Welt 6 · Funktionen",
  7: "Welt 7 · Listen",
  8: "Welt 8 · Zufall",
  9: "Welt 9 · Schwerkraft & Springen",
  10: "Welt 10 · Dein eigenes Spiel",
};

export const WORLDS: WorldMeta[] = [
  { n: 1, title: WORLD_TITLES[1], kind: "seq", keys: WORLD1.map((l) => l.key) },
  ...Array.from({ length: 9 }, (_, i) => i + 2).map((n) => ({
    n,
    title: WORLD_TITLES[n],
    kind: "game" as const,
    keys: GAME_LESSONS.filter((l) => l.world === n).map((l) => l.key),
  })),
];

export const LESSON_ORDER: string[] = [...WORLD1.map((l) => l.key), ...GAME_LESSONS.map((l) => l.key)];
export const ALL_KEYS: string[] = ["basics", ...LESSON_ORDER];

export function lessonMeta(key: string): { title: string; goal: string; coins: number } | undefined {
  const l = findSeq(key) ?? findGame(key);
  return l ? { title: l.title, goal: l.goal, coins: l.coins } : undefined;
}

export function findSeq(key: string): SeqLesson | undefined {
  return WORLD1.find((l) => l.key === key);
}
export function findGame(key: string): GameLesson | undefined {
  return GAME_LESSONS.find((l) => l.key === key);
}
