export function HeroSparkArt() {
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a0e18" />
          <stop offset="100%" stopColor="#171b26" />
        </linearGradient>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="360" height="220" fill="url(#bg)" />
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={i}
          x1={20 + i * 18}
          y1={20}
          x2={20 + i * 18}
          y2={200}
          stroke="#3b494c"
          strokeOpacity="0.2"
          strokeDasharray="2 4"
        />
      ))}
      <polyline
        points="20,160 60,150 100,120 140,135 180,90 220,110 260,70 300,85 340,60"
        fill="none"
        stroke="url(#line)"
        strokeWidth="2.5"
      />
      {[
        [180, 90],
        [260, 70],
        [340, 60],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#00e5ff" />
      ))}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#94A3B8">
        <text x="20" y="210">СОБЫТИЯ</text>
        <text x="180" y="210">СЕГОДНЯ</text>
        <text x="320" y="210">СЕЙЧАС</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#00e5ff">
        <text x="20" y="30">КЛАСТЕР ВИДЕОНАБЛЮДЕНИЯ</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#bac9cc">
        <text x="20" y="46">Уверенность 0.6 → 0.94 · YOLOv8</text>
      </g>
    </svg>
  )
}
