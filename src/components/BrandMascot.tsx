// Fröhliches Maskottchen für den Kinder-Login: ein Fuchs mit Doktorhut
// (passt zum 🦊-Standard-Avatar) mit funkelnden Sternchen. Reines Inline-SVG,
// scharf in jeder Größe, funktioniert in Hell/Dunkel, keine externen Dateien.
// Sanfte Schwebe-/Funkel-Animation – bei "reduzierte Bewegung" abgeschaltet.

export function BrandMascot({
  size = 160,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lern-Fuchs mit Doktorhut"
      className={className}
    >
      <defs>
        <radialGradient id="bmBlob" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="55%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </radialGradient>
        <linearGradient id="bmFox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="bmCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        <filter id="bmSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1e293b" floodOpacity="0.18" />
        </filter>
        <style>{`
          @keyframes bmFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes bmTwinkle { 0%,100% { opacity: .35; transform: scale(.7); } 50% { opacity: 1; transform: scale(1); } }
          .bm-float { animation: bmFloat 3.2s ease-in-out infinite; transform-origin: 110px 120px; }
          .bm-star { animation: bmTwinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .bm-star.s2 { animation-delay: .5s; }
          .bm-star.s3 { animation-delay: 1s; }
          .bm-star.s4 { animation-delay: 1.5s; }
          @media (prefers-reduced-motion: reduce) {
            .bm-float, .bm-star { animation: none; }
          }
        `}</style>
      </defs>

      {/* Hintergrund-Blob */}
      <circle cx="110" cy="112" r="96" fill="url(#bmBlob)" opacity="0.9" />
      <circle cx="110" cy="112" r="96" fill="url(#bmBlob)" opacity="0.35" />

      {/* Sternchen */}
      <g fill="#fde68a">
        <path
          className="bm-star s1"
          d="M40 66c2 7 2 7 9 9-7 2-7 2-9 9-2-7-2-7-9-9 7-2 7-2 9-9z"
        />
        <path
          className="bm-star s2"
          d="M182 58c1.6 5.6 1.6 5.6 7.2 7.2-5.6 1.6-5.6 1.6-7.2 7.2-1.6-5.6-1.6-5.6-7.2-7.2 5.6-1.6 5.6-1.6 7.2-7.2z"
        />
        <path
          className="bm-star s3"
          d="M186 138c1.3 4.5 1.3 4.5 5.8 5.8-4.5 1.3-4.5 1.3-5.8 5.8-1.3-4.5-1.3-4.5-5.8-5.8 4.5-1.3 4.5-1.3 5.8-5.8z"
        />
        <path
          className="bm-star s4"
          d="M36 148c1.3 4.5 1.3 4.5 5.8 5.8-4.5 1.3-4.5 1.3-5.8 5.8-1.3-4.5-1.3-4.5-5.8-5.8 4.5-1.3 4.5-1.3 5.8-5.8z"
        />
      </g>

      {/* Fuchs (schwebend) */}
      <g className="bm-float" filter="url(#bmSoft)">
        {/* Ohren */}
        <path d="M64 96 L80 54 L104 92 Z" fill="url(#bmFox)" />
        <path d="M156 96 L140 54 L116 92 Z" fill="url(#bmFox)" />
        <path d="M74 90 L82 66 L95 88 Z" fill="#7c2d12" opacity="0.85" />
        <path d="M146 90 L138 66 L125 88 Z" fill="#7c2d12" opacity="0.85" />

        {/* Kopf */}
        <path
          d="M66 104 C66 82 154 82 154 104 C154 140 132 168 110 176 C88 168 66 140 66 104 Z"
          fill="url(#bmFox)"
        />
        {/* helle Schnauze/Wangen */}
        <path
          d="M82 122 C82 112 138 112 138 122 C138 150 122 168 110 174 C98 168 82 150 82 122 Z"
          fill="#fff7ed"
        />

        {/* Wangen-Röte */}
        <circle cx="80" cy="134" r="8" fill="#fb7185" opacity="0.5" />
        <circle cx="140" cy="134" r="8" fill="#fb7185" opacity="0.5" />

        {/* Augen */}
        <ellipse cx="92" cy="118" rx="7.5" ry="9" fill="#1f2937" />
        <ellipse cx="128" cy="118" rx="7.5" ry="9" fill="#1f2937" />
        <circle cx="94.5" cy="114.5" r="2.6" fill="#fff" />
        <circle cx="130.5" cy="114.5" r="2.6" fill="#fff" />

        {/* Nase + Mund */}
        <path d="M110 138 m-6 0 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0" fill="#1f2937" />
        <path
          d="M110 143 v6 M110 149 C104 155 97 154 94 150 M110 149 C116 155 123 154 126 150"
          stroke="#9a3412"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Doktorhut */}
        <path d="M110 58 L156 76 L110 94 L64 76 Z" fill="url(#bmCap)" />
        <path d="M86 86 L86 100 C86 108 134 108 134 100 L134 86 L110 96 Z" fill="url(#bmCap)" />
        <circle cx="110" cy="76" r="4" fill="#c7d2fe" />
        {/* Quaste */}
        <path d="M110 76 L150 78 L150 100" stroke="#fbbf24" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="150" cy="104" r="5" fill="#fbbf24" />
      </g>
    </svg>
  );
}
