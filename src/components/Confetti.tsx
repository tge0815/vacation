const COLORS = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

// Kurzes CSS-Konfetti als Belohnung. Rein deterministisch (kein State, kein
// Math.random) — die Animation läuft einmal ab (forwards) und bleibt danach
// unsichtbar, solange der Belohnungs-Screen offen ist.
export function Confetti({ pieces = 80 }: { pieces?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {Array.from({ length: pieces }, (_, i) => {
        const left = (i * 61) % 100;
        const delay = ((i * 37) % 70) / 100;
        const duration = 1.8 + ((i * 53) % 120) / 100;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}vw`,
              backgroundColor: COLORS[i % COLORS.length],
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
