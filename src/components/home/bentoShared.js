export const BENTO_STEPS = [
  {
    step: '01',
    tagline: 'Ascolto e cura',
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    accentColor: 'text-[#B45309]',
    postItBg: 'bg-[#FFF4B8]',
    postItBorder: 'border-amber-900/8',
    postItShadow: '3px 5px 0 rgba(180, 83, 9, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(180, 83, 9, 0.16)',
    stepWatermark: 'text-amber-900/12',
    rotate: -1.8,
  },
  {
    step: '02',
    tagline: 'Match su misura',
    title: 'Valutazione',
    description:
      'Studiamo la vostra situazione nel dettaglio — non un catalogo, ma un match pensato per voi.',
    accentColor: 'text-[#6D5B9E]',
    postItBg: 'bg-[#E8E0F5]',
    postItBorder: 'border-violet-900/8',
    postItShadow: '3px 5px 0 rgba(109, 91, 158, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(109, 91, 158, 0.16)',
    stepWatermark: 'text-violet-900/12',
    rotate: 1.6,
  },
  {
    step: '03',
    tagline: 'Proposte chiare',
    title: 'Soluzione',
    description:
      "Solo dopo l'analisi, proposte personalizzate con trasparenza su costi e servizi.",
    accentColor: 'text-[#BE185D]',
    postItBg: 'bg-[#FDE4EC]',
    postItBorder: 'border-rose-900/8',
    postItShadow: '3px 5px 0 rgba(190, 24, 93, 0.12)',
    postItShadowHover: '5px 8px 0 rgba(190, 24, 93, 0.14)',
    stepWatermark: 'text-rose-900/12',
    rotate: -1.2,
  },
]

export const bentoContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

export const bentoCardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}
