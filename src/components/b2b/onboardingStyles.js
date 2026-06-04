/**
 * Wenando Pro B2B onboarding — allineato alla home (warm-cream, coral, glass, rounded)
 */

export const obPageBg = 'relative min-h-screen bg-warm-cream'

export const obGlassPanel =
  'rounded-3xl border border-black/5 bg-white/75 shadow-lg backdrop-blur-2xl'

export const obGlassCard =
  'rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-6'

export const obGlassCardSm =
  'rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl'

export const obPrimaryBtn =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-coral px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-coral-dark glow-coral focus:outline-none focus:ring-2 focus:ring-accent-coral/30 disabled:cursor-not-allowed disabled:opacity-50'

export const obSecondaryBtn =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold text-charcoal backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10'

export const obInput =
  'w-full rounded-2xl border border-black/5 bg-white/90 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-muted/50 transition-shadow focus:border-accent-coral/40 focus:outline-none focus:ring-2 focus:ring-accent-coral/20'

export const obLabel = 'mb-1.5 block text-xs font-medium text-charcoal-muted'

export const obLink =
  'font-medium text-accent-coral transition-colors hover:text-accent-coral-dark'

export const obCard = obGlassCard

export const obDropZone =
  'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-white/50 px-6 py-10 text-center backdrop-blur-sm transition-all hover:border-accent-coral/40 hover:bg-accent-coral/5'

export const obDropZoneActive = 'border-accent-coral/50 bg-accent-coral/10 shadow-sm'

export const obBadge =
  'inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium text-charcoal-muted shadow-sm backdrop-blur-md'

export const obHeading =
  'text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl'

export const obSubheading = 'mt-2 text-sm leading-relaxed text-charcoal-muted'

export const obProgressTrack = 'h-2 overflow-hidden rounded-full bg-black/5'

export const obProgressFill =
  'h-full rounded-full bg-gradient-to-r from-accent-coral via-accent-violet to-accent-teal transition-all duration-500 ease-out'

export const STEP_ACCENTS = [
  {
    active: 'border-accent-coral/25 bg-accent-coral/10',
    dot: 'bg-accent-coral text-white ring-4 ring-accent-coral/20',
    label: 'text-accent-coral-dark',
  },
  {
    active: 'border-accent-violet/25 bg-accent-violet/10',
    dot: 'bg-accent-violet-dark text-white ring-4 ring-accent-violet/20',
    label: 'text-accent-violet-dark',
  },
  {
    active: 'border-accent-amber/30 bg-accent-amber/10',
    dot: 'bg-accent-amber-dark text-white ring-4 ring-accent-amber/25',
    label: 'text-accent-amber-dark',
  },
  {
    active: 'border-accent-teal/30 bg-accent-teal/10',
    dot: 'bg-accent-teal-dark text-white ring-4 ring-accent-teal/20',
    label: 'text-accent-teal-dark',
  },
  {
    active: 'border-accent-coral/25 bg-accent-coral/10',
    dot: 'bg-accent-coral text-white ring-4 ring-accent-coral/20',
    label: 'text-accent-coral-dark',
  },
]
