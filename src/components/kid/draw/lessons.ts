// Manga-Zeichenkurs: geführte Lektionen. Jede Lektion zeichnet eine
// Hilfslinien-/Vorlagen-Skizze aufs Canvas, über die das Kind zeichnet.
// Rein visuelle Anleitung – nichts wird automatisch bewertet.

export type DrawLesson = {
  key: string;
  title: string;
  goal: string; // eine Zeile Übersicht
  explain: string; // kindgerechte Einführung
  steps: string[]; // Schritt-für-Schritt
  tips?: string[];
  coins: number;
  // Zeichnet die Vorlage/Hilfslinien in Grau (Canvas ist quadratisch, W=H).
  guide: (ctx: CanvasRenderingContext2D, W: number, H: number) => void;
};

export type DrawWorld = { n: number; title: string; keys: string[] };

// ---- kleine Zeichen-Helfer für die Vorlagen (alles in Grau/Strichel) ----
const INK = "#b9b3c4"; // sichtbare Hilfslinie
const FAINT = "#d9d5e2"; // ganz zarte Konstruktionslinie

function line(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = INK, w = 2, dash = false) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = w;
  c.setLineDash(dash ? [6, 7] : []);
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  c.restore();
}
function circle(c: CanvasRenderingContext2D, x: number, y: number, r: number, color = INK, w = 2, dash = false) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = w;
  c.setLineDash(dash ? [6, 7] : []);
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}
function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color = INK, w = 2, dash = false) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = w;
  c.setLineDash(dash ? [6, 7] : []);
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}
function label(c: CanvasRenderingContext2D, text: string, x: number, y: number) {
  c.save();
  c.fillStyle = "#a49db4";
  c.font = "600 13px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText(text, x, y);
  c.restore();
}

// Ein Manga-Auge (Konstruktion) zentriert um (cx,cy) mit Breite ~w.
function mangaEye(c: CanvasRenderingContext2D, cx: number, cy: number, w: number, faint = false) {
  const col = faint ? FAINT : INK;
  const lw = faint ? 1.5 : 2;
  const hw = w / 2;
  // obere Lidlinie (dick, geschwungen)
  c.save();
  c.strokeStyle = col;
  c.lineWidth = lw + 1.5;
  c.beginPath();
  c.moveTo(cx - hw, cy - 2);
  c.quadraticCurveTo(cx, cy - w * 0.55, cx + hw, cy - w * 0.2);
  c.stroke();
  // untere Lidlinie (dünn)
  c.lineWidth = lw;
  c.beginPath();
  c.moveTo(cx - hw + 4, cy + 4);
  c.quadraticCurveTo(cx, cy + w * 0.28, cx + hw - 3, cy + 2);
  c.stroke();
  c.restore();
  // Iris (großer Kreis, oben leicht abgeschnitten)
  ellipse(c, cx, cy + 2, hw * 0.62, w * 0.42, col, lw);
  // Pupille
  circle(c, cx, cy + 4, hw * 0.24, col, lw);
  // Glanzpunkt
  circle(c, cx - hw * 0.22, cy - w * 0.12, hw * 0.16, col, lw);
}

export const DRAW_LESSONS: DrawLesson[] = [
  // ---------- Welt 1: Aufwärmen ----------
  {
    key: "d_lines",
    title: "Striche & Kreise",
    goal: "Die Hand locker machen",
    explain:
      "Jede Zeichnung besteht aus Strichen und Rundungen. Zeichne locker aus dem Arm – nicht verkrampft! Fahre die grauen Linien nach. Wackelt es? Macht nichts, das wird mit Übung ruhiger.",
    steps: [
      "Fahre die geraden Linien mit einem Schwung nach – nicht kritzeln.",
      "Ziehe die Kreise in einer Bewegung, ohne abzusetzen.",
      "Zeichne jede Form 2–3 Mal übereinander, bis sie runder wird.",
    ],
    tips: ["Zeichne aus dem ganzen Arm, nicht nur mit den Fingern.", "Lieber schnell und schwungvoll als langsam und zittrig."],
    coins: 3,
    guide: (c, W, H) => {
      for (let i = 0; i < 4; i++) {
        const x = W * (0.12 + i * 0.06);
        line(c, x, H * 0.1, x, H * 0.45, FAINT, 2, true);
      }
      line(c, W * 0.5, H * 0.12, W * 0.9, H * 0.42, FAINT, 2, true);
      line(c, W * 0.5, H * 0.42, W * 0.9, H * 0.12, FAINT, 2, true);
      circle(c, W * 0.28, H * 0.72, W * 0.13, FAINT, 2, true);
      circle(c, W * 0.62, H * 0.72, W * 0.09, FAINT, 2, true);
      ellipse(c, W * 0.84, H * 0.72, W * 0.1, W * 0.05, FAINT, 2, true);
      label(c, "gerade Striche", W * 0.28, H * 0.05);
      label(c, "Kreise & Ovale", W * 0.5, H * 0.94);
    },
  },
  {
    key: "d_shapes",
    title: "Grundformen",
    goal: "Oval, Zylinder & Würfel",
    explain:
      "Alles lässt sich aus einfachen Formen bauen: Ein Kopf ist ein Ball, ein Arm ein Zylinder. Wer die Grundformen kann, kann später ALLES zeichnen. Fahre die Formen nach.",
    steps: [
      "Zeichne das Oval nach – erst die Rundung, dann prüfen ob beide Seiten gleich sind.",
      "Beim Zylinder: oben ein Oval, unten ein Oval, mit zwei Linien verbinden.",
      "Der Würfel: ein Quadrat, ein zweites versetzt dahinter, Ecken verbinden.",
    ],
    coins: 3,
    guide: (c, W, H) => {
      ellipse(c, W * 0.24, H * 0.28, W * 0.14, W * 0.09, FAINT, 2, true);
      // Zylinder
      ellipse(c, W * 0.6, H * 0.2, W * 0.1, W * 0.04, FAINT, 2, true);
      ellipse(c, W * 0.6, H * 0.45, W * 0.1, W * 0.04, FAINT, 2, true);
      line(c, W * 0.5, H * 0.2, W * 0.5, H * 0.45, FAINT, 2, true);
      line(c, W * 0.7, H * 0.2, W * 0.7, H * 0.45, FAINT, 2, true);
      // Würfel
      const x = W * 0.3, y = H * 0.62, s = W * 0.2, o = W * 0.07;
      c.save();
      c.strokeStyle = FAINT;
      c.lineWidth = 2;
      c.setLineDash([6, 7]);
      c.strokeRect(x, y, s, s);
      c.strokeRect(x + o, y - o, s, s);
      line(c, x, y, x + o, y - o, FAINT, 2, true);
      line(c, x + s, y, x + s + o, y - o, FAINT, 2, true);
      line(c, x, y + s, x + o, y + s - o, FAINT, 2, true);
      line(c, x + s, y + s, x + s + o, y + s - o, FAINT, 2, true);
      c.restore();
      label(c, "Oval", W * 0.24, H * 0.44);
      label(c, "Zylinder", W * 0.6, H * 0.56);
      label(c, "Würfel", W * 0.45, H * 0.92);
    },
  },
  // ---------- Welt 2: Manga-Augen ----------
  {
    key: "d_eye",
    title: "Das große Manga-Auge",
    goal: "Das wichtigste Manga-Merkmal",
    explain:
      "Manga-Augen sind groß und ausdrucksstark. Der Trick: eine dicke obere Lidlinie, eine große runde Iris, eine dunkle Pupille – und ein heller Glanzpunkt, der das Auge lebendig macht. Zeichne die Vorlage nach.",
    steps: [
      "Zieh die obere Lidlinie DICK und geschwungen – sie ist am kräftigsten.",
      "Setze die untere Lidlinie dünn darunter.",
      "Male die große runde Iris hinein.",
      "Pupille dunkel ausmalen – aber den kleinen Glanzpunkt weiß lassen!",
    ],
    tips: ["Der weiße Glanzpunkt macht das Auge lebendig – nie übermalen.", "Oben dick, unten dünn – das ist der Manga-Look."],
    coins: 3,
    guide: (c, W, H) => {
      mangaEye(c, W * 0.5, H * 0.45, W * 0.5);
      label(c, "obere Lidlinie = dick", W * 0.5, H * 0.12);
      label(c, "Glanzpunkt weiß lassen!", W * 0.5, H * 0.86);
    },
  },
  {
    key: "d_eyes",
    title: "Ein Augenpaar",
    goal: "Der richtige Abstand",
    explain:
      "Zwei Augen sehen nur gut aus, wenn der Abstand stimmt: Zwischen die Augen passt genau EIN weiteres Auge. Zeichne beide Augen über die Vorlage und achte auf den gleichen Abstand.",
    steps: [
      "Zeichne das linke Auge wie gelernt.",
      "Lass genau eine Augenbreite Platz.",
      "Zeichne das rechte Auge spiegelbildlich – gleich groß!",
      "Setze zwei Augenbrauen darüber.",
    ],
    tips: ["Beide Augen sollten auf einer Höhe liegen – die graue Linie hilft."],
    coins: 3,
    guide: (c, W, H) => {
      line(c, W * 0.06, H * 0.45, W * 0.94, H * 0.45, FAINT, 2, true);
      mangaEye(c, W * 0.28, H * 0.45, W * 0.28);
      mangaEye(c, W * 0.72, H * 0.45, W * 0.28);
      // Abstand-Markierung
      ellipse(c, W * 0.5, H * 0.45, W * 0.1, W * 0.06, FAINT, 1.5, true);
      label(c, "1 Auge Abstand", W * 0.5, H * 0.66);
    },
  },
  // ---------- Welt 3: Kopf & Gesicht ----------
  {
    key: "d_head",
    title: "Kopf mit Hilfslinien",
    goal: "Die Grundform des Kopfes",
    explain:
      "Ein Manga-Kopf ist ein Kreis mit einem spitzeren Kinn. Zwei Hilfslinien (eine senkrecht, eine waagerecht) zeigen später, wo Augen, Nase und Mund hinkommen. Fahre die Form nach.",
    steps: [
      "Zeichne den Kreis für den Schädel.",
      "Setze links und rechts die Wangenlinien an, die sich beim Kinn treffen.",
      "Ziehe die senkrechte Mittellinie (Gesichtsmitte).",
      "Ziehe die waagerechte Augenlinie etwa in der Mitte.",
    ],
    tips: ["Die Augenlinie liegt bei Manga oft etwas UNTER der Kreismitte – das macht große Augen."],
    coins: 3,
    guide: (c, W, H) => {
      const cx = W * 0.5, cy = H * 0.38, r = W * 0.26;
      circle(c, cx, cy, r, INK, 2);
      // Kinn
      line(c, cx - r, cy + r * 0.2, cx, cy + r * 1.7, INK, 2);
      line(c, cx + r, cy + r * 0.2, cx, cy + r * 1.7, INK, 2);
      // Hilfslinien
      line(c, cx, cy - r, cx, cy + r * 1.7, FAINT, 2, true);
      line(c, cx - r, cy + r * 0.35, cx + r, cy + r * 0.35, FAINT, 2, true);
      label(c, "Augenlinie", W * 0.5, cy + r * 0.35 - 8);
      label(c, "Mittellinie", cx + 46, cy - r + 4);
    },
  },
  {
    key: "d_face",
    title: "Gesicht: Augen, Nase, Mund",
    goal: "Alles an den richtigen Platz",
    explain:
      "Jetzt kommt Leben rein! Die Hilfslinien vom Kopf zeigen dir, wo alles hingehört: Augen auf die Augenlinie, Nase auf halbem Weg zum Kinn, der Mund darunter. Zeichne die Gesichtszüge auf die Markierungen.",
    steps: [
      "Setze die beiden Augen auf die Augenlinie (Abstand: ein Auge).",
      "Zeichne die Nase als kleinen Strich/Punkt auf der Mittellinie.",
      "Male den Mund als kurze Linie darunter.",
      "Zwei Augenbrauen dazu – sie zeigen die Stimmung.",
    ],
    coins: 3,
    guide: (c, W, H) => {
      const cx = W * 0.5, cy = H * 0.36, r = W * 0.26;
      circle(c, cx, cy, r, FAINT, 2, true);
      line(c, cx - r, cy + r * 0.2, cx, cy + r * 1.7, FAINT, 2, true);
      line(c, cx + r, cy + r * 0.2, cx, cy + r * 1.7, FAINT, 2, true);
      line(c, cx, cy - r, cx, cy + r * 1.7, FAINT, 1.5, true);
      const eyeY = cy + r * 0.4;
      line(c, cx - r, eyeY, cx + r, eyeY, FAINT, 1.5, true);
      mangaEye(c, cx - r * 0.5, eyeY, W * 0.2, true);
      mangaEye(c, cx + r * 0.5, eyeY, W * 0.2, true);
      // Nase & Mund Markierung
      const noseY = cy + r * 1.0;
      line(c, cx - 4, noseY, cx + 6, noseY + 8, FAINT, 2, true);
      line(c, cx - W * 0.06, cy + r * 1.35, cx + W * 0.06, cy + r * 1.35, FAINT, 2, true);
      label(c, "Nase", cx + 34, noseY);
      label(c, "Mund", cx + 40, cy + r * 1.35);
    },
  },
  {
    key: "d_hair",
    title: "Haare & Frisur",
    goal: "Strähnen statt Einzelhaare",
    explain:
      "Haare zeichnet man in STRÄHNEN, nicht Haar für Haar. Die Haare starten etwas über dem Kreis (nicht am Rand!) und fallen in Büscheln nach unten. Folge den grauen Pfeilen als Wuchsrichtung.",
    steps: [
      "Zeichne den Haaransatz ein Stück ÜBER dem Kopfkreis.",
      "Teile die Haare in große Strähnen/Büschel auf.",
      "Ziehe jede Strähne mit einem Schwung nach unten, spitz zulaufend.",
      "Ein paar kürzere Strähnen für den Pony vorne.",
    ],
    tips: ["Weniger, aber größere Strähnen sehen besser aus als viele dünne."],
    coins: 3,
    guide: (c, W, H) => {
      const cx = W * 0.5, cy = H * 0.42, r = W * 0.26;
      circle(c, cx, cy, r, FAINT, 2, true);
      // Haaransatz über dem Kreis
      c.save();
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.setLineDash([6, 7]);
      c.beginPath();
      c.arc(cx, cy, r * 1.12, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
      c.restore();
      // Wuchsrichtungs-Pfeile (Strähnen)
      const strands = [-0.6, -0.25, 0.1, 0.45, 0.75];
      strands.forEach((t) => {
        const sx = cx + Math.cos(Math.PI * (1.5 + t)) * r * 0.9;
        const sy = cy + Math.sin(Math.PI * (1.5 + t)) * r * 0.9;
        line(c, sx, sy, sx + t * 40, sy + r * 1.1, FAINT, 2, true);
      });
      label(c, "Haaransatz über dem Kopf", cx, cy - r * 1.35);
    },
  },
  // ---------- Welt 4: Figuren & Ausdruck ----------
  {
    key: "d_chibi",
    title: "Chibi-Figur",
    goal: "Süß: großer Kopf, kleiner Körper",
    explain:
      "Chibis sind die knuffigen Mini-Figuren im Manga. Der Trick: Der Kopf ist RIESIG (fast so groß wie der ganze Körper), Arme und Beine sind kurz und rund. Die ganze Figur ist nur etwa 2 Köpfe hoch.",
    steps: [
      "Zeichne den großen Kopfkreis (er ist der Star!).",
      "Darunter ein kleiner runder Körper – etwa ein Kopf hoch.",
      "Kurze, wurstige Arme und Beine dran.",
      "Großes Gesicht mit Riesen-Augen hinein.",
    ],
    tips: ["Je größer der Kopf im Vergleich zum Körper, desto süßer der Chibi."],
    coins: 3,
    guide: (c, W, H) => {
      const cx = W * 0.5;
      circle(c, cx, H * 0.28, W * 0.2, INK, 2); // Kopf
      ellipse(c, cx, H * 0.58, W * 0.11, W * 0.13, FAINT, 2, true); // Körper
      // Arme
      line(c, cx - W * 0.1, H * 0.52, cx - W * 0.2, H * 0.62, FAINT, 2, true);
      line(c, cx + W * 0.1, H * 0.52, cx + W * 0.2, H * 0.62, FAINT, 2, true);
      // Beine
      line(c, cx - W * 0.05, H * 0.7, cx - W * 0.07, H * 0.82, FAINT, 2, true);
      line(c, cx + W * 0.05, H * 0.7, cx + W * 0.07, H * 0.82, FAINT, 2, true);
      label(c, "RIESEN-Kopf", cx, H * 0.05);
      label(c, "Mini-Körper", cx + W * 0.28, H * 0.58);
    },
  },
  {
    key: "d_expressions",
    title: "Gefühle zeigen",
    goal: "Freude, Wut, Staunen",
    explain:
      "Gefühle entstehen vor allem durch Augen und Augenbrauen! Zeichne die drei Gesichter nach und schau, wie kleine Änderungen die Stimmung komplett verändern.",
    steps: [
      "Fröhlich: Augen zu Bögen nach oben, großes Lächeln.",
      "Wütend: Augenbrauen schräg nach innen, kleiner Mund.",
      "Staunen: Augen weit auf, kleiner runder Mund (O).",
    ],
    tips: ["Die Augenbrauen machen den größten Unterschied bei Gefühlen."],
    coins: 3,
    guide: (c, W, H) => {
      const ys = H * 0.4;
      [0.2, 0.5, 0.8].forEach((fx) => circle(c, W * fx, ys, W * 0.12, FAINT, 2, true));
      label(c, "froh", W * 0.2, ys + W * 0.2);
      label(c, "wütend", W * 0.5, ys + W * 0.2);
      label(c, "staunend", W * 0.8, ys + W * 0.2);
    },
  },
  {
    key: "d_project",
    title: "Deine eigene Manga-Figur",
    goal: "Alles zusammen – frei!",
    explain:
      "Jetzt bist du dran: Erfinde deine eigene Figur! Nutze alles, was du gelernt hast – Kopf mit Hilfslinien, große Augen, Frisur, Ausdruck. Die grauen Linien geben nur die Mitte vor, den Rest bestimmst DU.",
    steps: [
      "Überlege: fröhlich, cool, frech? Das bestimmt Augen & Mund.",
      "Beginne mit Kopfkreis und Hilfslinien.",
      "Setze Augen, Nase, Mund – dann die Frisur.",
      "Zum Schluss alles mit kräftigeren Linien nachziehen.",
    ],
    tips: ["Kein Stress – jede Zeichnung ist Übung. Deine Figur muss nicht perfekt sein!"],
    coins: 5,
    guide: (c, W, H) => {
      line(c, W * 0.5, H * 0.08, W * 0.5, H * 0.92, FAINT, 1.5, true);
      line(c, W * 0.1, H * 0.4, W * 0.9, H * 0.4, FAINT, 1.5, true);
      circle(c, W * 0.5, H * 0.34, W * 0.24, FAINT, 1.5, true);
      label(c, "deine Bühne – leg los!", W * 0.5, H * 0.96);
    },
  },
];

export const DRAW_WORLDS: DrawWorld[] = [
  { n: 1, title: "Welt 1 · Aufwärmen", keys: ["d_lines", "d_shapes"] },
  { n: 2, title: "Welt 2 · Manga-Augen", keys: ["d_eye", "d_eyes"] },
  { n: 3, title: "Welt 3 · Kopf & Gesicht", keys: ["d_head", "d_face", "d_hair"] },
  { n: 4, title: "Welt 4 · Figuren & Ausdruck", keys: ["d_chibi", "d_expressions", "d_project"] },
];

export function findDraw(key: string): DrawLesson | undefined {
  return DRAW_LESSONS.find((l) => l.key === key);
}

export function drawMeta(key: string): { title: string; goal: string; coins: number } | undefined {
  const l = findDraw(key);
  return l ? { title: l.title, goal: l.goal, coins: l.coins } : undefined;
}

// Reihenfolge über alle Welten (für "nächste Lektion").
export const DRAW_ORDER: string[] = DRAW_WORLDS.flatMap((w) => w.keys);
