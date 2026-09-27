/** Decorative campus illustration shown when the hero photo cannot be loaded. */
export function HeroFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f0e6" />
          <stop offset="1" stopColor="#f6faf8" />
        </linearGradient>
      </defs>
      <rect width="900" height="520" fill="url(#sky)" />
      <g fill="#bfe3d3">
        <rect x="420" y="120" width="190" height="400" rx="6" />
        <rect x="640" y="60" width="260" height="460" rx="6" />
      </g>
      <g fill="#e8f5ef">
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect key={`a${r}${c}`} x={440 + c * 42} y={145 + r * 50} width="26" height="30" rx="3" />
          )),
        )}
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => (
            <rect key={`b${r}${c}`} x={665 + c * 46} y={90 + r * 52} width="28" height="32" rx="3" />
          )),
        )}
      </g>
      <g fill="#4fbf92" opacity=".55">
        <circle cx="380" cy="360" r="90" />
        <circle cx="300" cy="420" r="70" />
        <circle cx="610" cy="470" r="80" />
      </g>
      <g fill="#087f5b" opacity=".35">
        <circle cx="420" cy="430" r="60" />
        <circle cx="860" cy="470" r="70" />
      </g>
    </svg>
  );
}
