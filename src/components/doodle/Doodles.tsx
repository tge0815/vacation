// Handgezeichnete Kritzel-Deko als Inline-SVG. Rein dekorativ (aria-hidden).
type P = { className?: string; size?: number };

export function Flame({ className = "", size = 60 }: P) {
  return (
    <svg className={className} width={size} height={(size * 80) / 60} viewBox="0 0 60 80" fill="none" aria-hidden="true">
      <path
        d="M30 4c8 14-6 18-2 30 3 9 14 8 16-2 6 10-2 30-14 30S8 78 8 60c0-14 12-16 12-30 0-10 6-18 10-26z"
        fill="#d94fd0"
        stroke="#26242b"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Rainbow({ className = "", size = 96 }: P) {
  return (
    <svg className={className} width={size} height={(size * 60) / 100} viewBox="0 0 100 60" fill="none" aria-hidden="true">
      <path d="M8 58a42 42 0 0 1 84 0" stroke="#f6d84f" strokeWidth="7" fill="none" />
      <path d="M18 58a32 32 0 0 1 64 0" stroke="#d94fd0" strokeWidth="7" fill="none" />
      <path d="M28 58a22 22 0 0 1 44 0" stroke="#7ec8c0" strokeWidth="7" fill="none" />
      <path
        d="M8 58a42 42 0 0 1 84 0M18 58a32 32 0 0 1 64 0M28 58a22 22 0 0 1 44 0"
        stroke="#26242b"
        strokeWidth="1.4"
        fill="none"
        opacity=".45"
      />
    </svg>
  );
}

export function Squiggle({ className = "", size = 84 }: P) {
  return (
    <svg className={className} width={size} height={(size * 70) / 90} viewBox="0 0 90 70" fill="none" aria-hidden="true">
      <path d="M8 60c6-30 34-22 40-30-8 2-12 0-14-4" stroke="#d9b8f0" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50 26l-8 4 2-10" stroke="#d9b8f0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Star({ className = "", size = 34 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3c2 9 6 13 15 15-9 2-13 6-15 15-2-9-6-13-15-15 9-2 13-6 15-15z"
        fill="#f6d84f"
        stroke="#26242b"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wellen-Trenner (z. B. vor dunklem Footer). `fill` = Zielfarbe der Welle.
export function Wave({ className = "", fill = "#26242b" }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 540 40" preserveAspectRatio="none" width="100%" height="40" aria-hidden="true">
      <path d="M0 20 C90 0 180 40 270 22 C360 4 450 34 540 16 L540 40 L0 40 Z" fill={fill} />
    </svg>
  );
}
