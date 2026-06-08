/** Shared stats data and SVG marks for StatsSection static/desktop splits */

export function StatMark({ variant, className = '' }) {
  const shared = `block ${className}`
  switch (variant) {
    case 'famiglie':
      return (
        <svg
          className={shared}
          width="28"
          height="8"
          viewBox="0 0 28 8"
          fill="none"
          aria-hidden
        >
          <circle cx="4" cy="4" r="3" fill="currentColor" opacity="0.55" />
          <circle cx="14" cy="4" r="3" fill="currentColor" opacity="0.85" />
          <circle cx="24" cy="4" r="3" fill="currentColor" opacity="0.4" />
        </svg>
      )
    case 'risposta':
      return (
        <svg
          className={shared}
          width="32"
          height="8"
          viewBox="0 0 32 8"
          fill="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="4"
            x2="24"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle cx="28" cy="4" r="3" fill="currentColor" />
        </svg>
      )
    case 'strutture':
      return (
        <svg
          className={shared}
          width="24"
          height="10"
          viewBox="0 0 24 10"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 1L3 4v4.5c0 .8 3.6 2.5 9 2.5s9-1.7 9-2.5V4L12 1z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path
            d="M9 7.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'soddisfazione':
      return (
        <svg
          className={shared}
          width="36"
          height="8"
          viewBox="0 0 36 8"
          fill="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="4"
            x2="12"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle cx="18" cy="4" r="2.5" fill="currentColor" opacity="0.65" />
          <line
            x1="24"
            y1="4"
            x2="36"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      )
    default:
      return null
  }
}

export const STATS = [
  {
    anchor: 'stats-famiglie',
    mark: 'famiglie',
    value: '500+',
    label: 'Ricerche guidate',
    accentVar: '--color-accent-coral',
    cardTint: 'bg-[color:var(--color-accent-coral)]/[0.035]',
    border: 'border-[color:var(--color-accent-coral)]/10',
    markColor: 'text-[color:var(--color-accent-coral)]',
    valueColor: 'text-[color:var(--color-accent-coral)]',
    labelColor: 'text-[color:var(--color-accent-coral)]/75',
  },
  {
    anchor: 'stats-risposta',
    mark: 'risposta',
    value: '48h',
    label: 'Risposta media',
    accentVar: '--color-accent-amber',
    cardTint: 'bg-[color:var(--color-accent-amber)]/[0.04]',
    border: 'border-[color:var(--color-accent-amber)]/10',
    markColor: 'text-[color:var(--color-accent-amber)]',
    valueColor: 'text-[color:var(--color-accent-amber-dark)]',
    labelColor: 'text-[color:var(--color-accent-amber-dark)]/80',
  },
  {
    anchor: 'stats-strutture',
    mark: 'strutture',
    value: '120+',
    label: 'Strutture e servizi',
    accentVar: '--color-accent-violet',
    cardTint: 'bg-[color:var(--color-accent-violet)]/[0.04]',
    border: 'border-[color:var(--color-accent-violet)]/10',
    markColor: 'text-[color:var(--color-accent-violet)]',
    valueColor: 'text-[color:var(--color-accent-violet-dark)]',
    labelColor: 'text-[color:var(--color-accent-violet-dark)]/75',
  },
  {
    anchor: 'stats-soddisfazione',
    mark: 'soddisfazione',
    value: '4.9',
    label: 'Soddisfazione media',
    accentVar: '--color-accent-rose',
    cardTint: 'bg-[color:var(--color-accent-rose)]/[0.035]',
    border: 'border-[color:var(--color-accent-rose)]/10',
    markColor: 'text-[color:var(--color-accent-rose)]',
    valueColor: 'text-[color:var(--color-accent-rose-dark)]',
    labelColor: 'text-[color:var(--color-accent-rose-dark)]/75',
  },
]

export const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export const statsItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}
