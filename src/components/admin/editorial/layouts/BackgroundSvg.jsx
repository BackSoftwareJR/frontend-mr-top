export function CoralWaveBg({ className = '' }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 800 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#E07A5F" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill="url(#coralGrad)" />
      <path
        d="M0,220 C200,120 400,280 800,180 L800,320 L0,320 Z"
        fill="#E07A5F"
        fillOpacity="0.08"
      />
      <path
        d="M0,260 C250,180 550,300 800,240 L800,320 L0,320 Z"
        fill="#E07A5F"
        fillOpacity="0.05"
      />
    </svg>
  )
}

export function DotPatternBg({ className = '' }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full opacity-40 ${className}`} aria-hidden>
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#E07A5F" fillOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}
