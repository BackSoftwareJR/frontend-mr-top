/**
 * Wenando Pro — iOS-style design tokens (site palette + glass)
 * warm-cream · accent-coral · accent-violet · charcoal
 */

export const proColors = {
  coral: '#e07a5f',
  coralDark: '#c96a52',
  violet: '#9b8ec4',
  violetDark: '#7c6ba8',
  warmWhite: '#fafaf8',
  warmCream: '#f8f7f4',
  charcoal: '#1e293b',
  charcoalMuted: '#64748b',
}

export const proGlassCard =
  'rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-6'

export const proGlassCardSm =
  'rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl'

export const proGlassPanel =
  'rounded-2xl border border-black/5 bg-white/80 shadow-lg backdrop-blur-2xl'

export const proGlassStrong =
  'rounded-2xl border border-black/5 bg-white/90 shadow-md backdrop-blur-2xl'

export const proPageBg = 'min-h-full bg-warm-cream'

export const proPageTitle = 'text-lg font-semibold tracking-tight text-charcoal sm:text-xl'

export const proPageSubtitle = 'mt-0.5 text-sm text-charcoal-muted'

export const proPrimaryBtn =
  'rounded-full bg-accent-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-coral-dark glow-coral disabled:cursor-not-allowed disabled:opacity-50'

export const proPrimaryBtnSm =
  'rounded-full bg-accent-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-coral-dark disabled:cursor-not-allowed disabled:opacity-50'

export const proGhostBtn =
  'rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-semibold text-charcoal backdrop-blur-sm transition-colors hover:bg-white/90'

export const proSecondaryBtn =
  'rounded-full border border-black/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-white hover:border-black/15'

export const proInput =
  'w-full rounded-xl border border-black/5 bg-white/90 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-muted/60'

export const proInputFocus =
  'focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral/40'

export const proLink =
  'font-medium text-accent-coral transition-colors hover:text-accent-coral-dark'

export const proIconAccent = 'text-accent-coral'

export const proIconViolet = 'text-accent-violet-dark'

export const proNavActive =
  'bg-accent-coral/12 text-accent-coral-dark ring-1 ring-accent-coral/20'

export const proNavInactive =
  'text-charcoal-muted hover:bg-black/5 hover:text-charcoal'

export const proSidebar =
  'flex shrink-0 flex-col border-r border-black/5 bg-white/75 backdrop-blur-2xl transition-all duration-300'

export const proTopbar =
  'sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-black/5 bg-white/70 px-3 py-3 backdrop-blur-xl sm:gap-4 sm:px-6'

export const proWalletPill =
  'flex items-center gap-2 rounded-full border border-black/5 bg-white/80 py-1.5 pl-3 pr-1.5 text-sm shadow-sm backdrop-blur-md'

export const proDropdown =
  'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/5 bg-white/90 py-1 shadow-lg backdrop-blur-2xl'

export const proSegmented =
  'inline-flex rounded-full border border-black/5 bg-warm-cream/80 p-0.5'

export const proSegmentedActive = 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-charcoal shadow-sm'

export const proSegmentedInactive =
  'rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-muted transition-colors hover:text-charcoal'

export const proStatusPaid =
  'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60'

export const proStatusPending =
  'inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/70'

export const proLowBalanceBanner =
  'mb-4 flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 backdrop-blur-md'

export const proEmptyState =
  'flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-16 text-center backdrop-blur-sm'

export const proSheetModal =
  'relative w-full rounded-t-3xl border border-black/5 bg-white/95 shadow-2xl backdrop-blur-2xl sm:rounded-3xl'

export const proToastSuccess =
  'rounded-2xl border border-emerald-200/60 bg-white/90 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg backdrop-blur-xl'

export const proToastError =
  'rounded-2xl border border-red-200/60 bg-white/90 px-4 py-3 text-sm font-medium text-red-700 shadow-lg backdrop-blur-xl'

export const proToastInfo =
  'rounded-2xl border border-black/5 bg-white/90 px-4 py-3 text-sm font-medium text-charcoal shadow-lg backdrop-blur-xl'

export const proHeroStat =
  'rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl'

export const proListGroup =
  'divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white/70 backdrop-blur-xl'

export const proListItem = 'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02]'
