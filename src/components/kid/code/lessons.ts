// Welt 1 der Spiele-Werkstatt. Bewusst echtes (kleines) JavaScript – für ~12
// Jahre. Koordinaten: x nach rechts, y nach unten (0 = oberste Reihe).
export type Cell = { x: number; y: number };

export type Lesson = {
  key: string;
  title: string;
  learn: string; // was man hier lernt
  goal: string; // die Aufgabe
  cols: number;
  rows: number;
  fox: Cell;
  star: Cell;
  walls?: Cell[];
  starter: string;
  hint: string;
  bridgeJs: string;
  bridgeCs: string;
  coins: number;
};

export const WORLD1: Lesson[] = [
  {
    key: "w1l1",
    title: "Erste Schritte",
    learn:
      "Der Fuchs steht auf einem Gitter. Jede Zelle ist eine Position. Mit fuchs.rechts(n) läuft er n Felder nach rechts.",
    goal: "Bring den Fuchs zum Stern ⭐.",
    cols: 6,
    rows: 4,
    fox: { x: 0, y: 1 },
    star: { x: 4, y: 1 },
    starter: "// Tipp: der Stern ist 4 Felder rechts.\nfuchs.rechts(1)\n",
    hint: "Wie viele Felder sind es bis zum Stern? Ändere die Zahl in fuchs.rechts( ).",
    bridgeJs: "fuchs.rechts(4)",
    bridgeCs: "transform.position += Vector3.right * 4;",
    coins: 2,
  },
  {
    key: "w1l2",
    title: "Um die Ecke",
    learn:
      "Nach oben geht es mit fuchs.hoch(n), nach unten mit fuchs.runter(n). Kombiniere die Befehle.",
    goal: "Erst nach rechts, dann nach oben zum Stern ⭐.",
    cols: 6,
    rows: 5,
    fox: { x: 0, y: 4 },
    star: { x: 4, y: 1 },
    starter: "fuchs.rechts(2)\nfuchs.hoch(1)\n",
    hint: "Der Stern ist 4 Felder rechts und 3 Felder oben.",
    bridgeJs: "fuchs.rechts(4)\nfuchs.hoch(3)",
    bridgeCs: "transform.position += Vector3.right * 4 + Vector3.up * 3;",
    coins: 2,
  },
  {
    key: "w1l3",
    title: "Clever wiederholen",
    learn:
      "Statt oft dasselbe zu tippen: eine Schleife! wiederhole(n, () => { ... }) macht etwas n-mal.",
    goal: "Bring den Fuchs mit einer Schleife ganz nach rechts zum Stern ⭐.",
    cols: 8,
    rows: 3,
    fox: { x: 0, y: 1 },
    star: { x: 7, y: 1 },
    starter: "wiederhole(3, () => {\n  fuchs.rechts(1)\n})\n",
    hint: "Wie oft muss der Fuchs 1 Feld nach rechts? Ändere die Zahl in wiederhole( ).",
    bridgeJs: "wiederhole(7, () => fuchs.rechts(1))",
    bridgeCs: "for (int i = 0; i < 7; i++)\n    transform.position += Vector3.right;",
    coins: 3,
  },
];

// Welt 2: der echte Game-Loop. Der Fuchs wird LIVE gesteuert – onUpdate() läuft
// in jedem Frame, taste(...) sagt, welche Taste gedrückt ist.
export type GameLesson = {
  key: string;
  title: string;
  learn: string;
  goal: string;
  cols: number;
  rows: number;
  fox: Cell;
  targets: Cell[]; // einzusammeln
  targetIcon: string; // ⭐ oder 🪙
  timeLimit?: number; // Sekunden
  starter: string;
  hint: string;
  bridgeJs: string;
  bridgeCs: string;
  coins: number;
};

export const WORLD2: GameLesson[] = [
  {
    key: "w2l1",
    title: "Steuere den Fuchs",
    learn:
      "onUpdate(() => { ... }) läuft in JEDEM Bild (Frame). taste(\"rechts\") ist wahr, solange die Taste gedrückt ist.",
    goal: "Steuere den Fuchs mit den Pfeiltasten zum Stern ⭐.",
    cols: 7,
    rows: 5,
    fox: { x: 0, y: 2 },
    targets: [{ x: 6, y: 2 }],
    targetIcon: "⭐",
    starter:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.15\n  // Tipp: füge links, hoch und runter hinzu!\n})\n',
    hint: 'Nutze taste("links"), taste("hoch"), taste("runter") und ändere fuchs.x bzw. fuchs.y.',
    bridgeJs: 'if (taste("rechts")) fuchs.x += 0.15',
    bridgeCs:
      "if (Input.GetKey(KeyCode.RightArrow))\n    transform.position += Vector3.right * speed * Time.deltaTime;",
    coins: 3,
  },
  {
    key: "w2l2",
    title: "Sammle alle Münzen",
    learn: "Jetzt ein echtes Mini-Spiel: sammle alle Münzen ein, bevor die Zeit abläuft!",
    goal: "Sammle alle 🪙 mit den Pfeiltasten ein.",
    cols: 8,
    rows: 6,
    fox: { x: 0, y: 0 },
    targets: [
      { x: 7, y: 1 },
      { x: 3, y: 4 },
      { x: 6, y: 5 },
      { x: 1, y: 3 },
      { x: 5, y: 0 },
    ],
    targetIcon: "🪙",
    timeLimit: 25,
    starter:
      'onUpdate(() => {\n  if (taste("rechts")) fuchs.x += 0.15\n  if (taste("links"))  fuchs.x -= 0.15\n  if (taste("hoch"))   fuchs.y -= 0.15\n  if (taste("runter")) fuchs.y += 0.15\n})\n',
    hint: "Mach den Fuchs schneller: erhöhe 0.15 auf 0.22. Plane eine clevere Route zu allen Münzen.",
    bridgeJs: 'if (taste("hoch")) fuchs.y -= 0.15',
    bridgeCs:
      "if (Input.GetKey(KeyCode.UpArrow))\n    transform.position += Vector3.up * speed * Time.deltaTime;",
    coins: 4,
  },
];

