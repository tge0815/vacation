// Erzeugt die PWA-/Apple-Icons aus dem Fuchs-Maskottchen (statische Variante,
// voller Hintergrund). Aufruf:  node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "icons");
mkdirSync(OUT, { recursive: true });

// Fuchs-Maskottchen (statisch, ohne Animation) – zentriert im 220er-Feld.
const mascot = `
  <g filter="url(#soft)">
    <path d="M64 96 L80 54 L104 92 Z" fill="url(#fox)"/>
    <path d="M156 96 L140 54 L116 92 Z" fill="url(#fox)"/>
    <path d="M74 90 L82 66 L95 88 Z" fill="#7c2d12" opacity="0.85"/>
    <path d="M146 90 L138 66 L125 88 Z" fill="#7c2d12" opacity="0.85"/>
    <path d="M66 104 C66 82 154 82 154 104 C154 140 132 168 110 176 C88 168 66 140 66 104 Z" fill="url(#fox)"/>
    <path d="M82 122 C82 112 138 112 138 122 C138 150 122 168 110 174 C98 168 82 150 82 122 Z" fill="#fff7ed"/>
    <circle cx="80" cy="134" r="8" fill="#fb7185" opacity="0.5"/>
    <circle cx="140" cy="134" r="8" fill="#fb7185" opacity="0.5"/>
    <ellipse cx="92" cy="118" rx="7.5" ry="9" fill="#1f2937"/>
    <ellipse cx="128" cy="118" rx="7.5" ry="9" fill="#1f2937"/>
    <circle cx="94.5" cy="114.5" r="2.6" fill="#fff"/>
    <circle cx="130.5" cy="114.5" r="2.6" fill="#fff"/>
    <path d="M110 138 m-6 0 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0" fill="#1f2937"/>
    <path d="M110 143 v6 M110 149 C104 155 97 154 94 150 M110 149 C116 155 123 154 126 150" stroke="#9a3412" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M110 58 L156 76 L110 94 L64 76 Z" fill="url(#cap)"/>
    <path d="M86 86 L86 100 C86 108 134 108 134 100 L134 86 L110 96 Z" fill="url(#cap)"/>
    <circle cx="110" cy="76" r="4" fill="#c7d2fe"/>
    <path d="M110 76 L150 78 L150 100" stroke="#fbbf24" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="150" cy="104" r="5" fill="#fbbf24"/>
  </g>`;

const sparkles = `
  <g fill="#fde68a">
    <path d="M42 66c2 7 2 7 9 9-7 2-7 2-9 9-2-7-2-7-9-9 7-2 7-2 9-9z"/>
    <path d="M180 60c1.6 5.6 1.6 5.6 7.2 7.2-5.6 1.6-5.6 1.6-7.2 7.2-1.6-5.6-1.6-5.6-7.2-7.2 5.6-1.6 5.6-1.6 7.2-7.2z"/>
    <path d="M184 140c1.3 4.5 1.3 4.5 5.8 5.8-4.5 1.3-4.5 1.3-5.8 5.8-1.3-4.5-1.3-4.5-5.8-5.8 4.5-1.3 4.5-1.3 5.8-5.8z"/>
    <path d="M36 150c1.3 4.5 1.3 4.5 5.8 5.8-4.5 1.3-4.5 1.3-5.8 5.8-1.3-4.5-1.3-4.5-5.8-5.8 4.5-1.3 4.5-1.3 5.8-5.8z"/>
  </g>`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="46%" r="42%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fox" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#3730a3"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.22"/>
    </filter>
  </defs>`;

// content = optionale Skalierung des Maskottchens (für maskable mehr Rand).
function svg({ scale = 1 } = {}) {
  const inner =
    scale === 1
      ? sparkles + mascot
      : `<g transform="translate(110 112) scale(${scale}) translate(-110 -112)">${sparkles}${mascot}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 220 220">
    ${defs}
    <rect width="220" height="220" fill="url(#bg)"/>
    <circle cx="110" cy="104" r="92" fill="url(#glow)"/>
    ${inner}
  </svg>`;
}

const any = Buffer.from(svg({ scale: 1 }));
const maskable = Buffer.from(svg({ scale: 0.78 })); // Sicherheitsrand für Launcher-Masken

async function render(buf, size, file, flatten = false) {
  let img = sharp(buf).resize(size, size);
  if (flatten) img = img.flatten({ background: "#38bdf8" });
  await img.png().toFile(join(OUT, file));
  console.log("✓", file, size + "px");
}

await render(any, 512, "icon-512.png");
await render(any, 192, "icon-192.png");
await render(any, 180, "apple-touch-icon.png", true); // iOS: keine Transparenz
await render(maskable, 512, "icon-maskable-512.png");
console.log("Fertig.");
