/** Post-it visual styles for top-3 solution cards (aligned with homepage bento). */
export const SOLUTION_POST_IT_STYLES = [
  {
    tagline: 'Scelta consigliata',
    accentColor: 'text-[#B45309]',
    postItBg: 'bg-[#FFF4B8]',
    postItBorder: 'border-amber-900/8',
    postItShadow: '3px 5px 0 rgba(180, 83, 9, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(180, 83, 9, 0.16)',
    watermark: 'text-amber-900/10',
    rotate: -1.8,
  },
  {
    tagline: 'Alternativa valida',
    accentColor: 'text-[#6D5B9E]',
    postItBg: 'bg-[#E8E0F5]',
    postItBorder: 'border-violet-900/8',
    postItShadow: '3px 5px 0 rgba(109, 91, 158, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(109, 91, 158, 0.16)',
    watermark: 'text-violet-900/10',
    rotate: 1.6,
  },
  {
    tagline: 'Da valutare',
    accentColor: 'text-[#BE185D]',
    postItBg: 'bg-[#FDE4EC]',
    postItBorder: 'border-rose-900/8',
    postItShadow: '3px 5px 0 rgba(190, 24, 93, 0.12)',
    postItShadowHover: '5px 8px 0 rgba(190, 24, 93, 0.14)',
    watermark: 'text-rose-900/10',
    rotate: -1.2,
  },
]

const LOCATION_HINTS = [
  'milano',
  'monza',
  'torino',
  'roma',
  'bergamo',
  'brescia',
  'lombardia',
  'piemonte',
]

const ALL_SOLUTIONS = {
  rsa_girasole: {
    id: 'sol-rsa-girasole',
    kind: 'structure',
    name: 'Residenza Il Girasole',
    type: 'RSA · Assistenza media',
    summary:
      'Ambiente caldo, giardino accessibile, equipe infermieristica dedicata.',
    compatibility: 94,
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=640&h=420&fit=crop',
  },
  rsa_serena: {
    id: 'sol-rsa-serena',
    kind: 'structure',
    name: 'Casa Serena',
    type: 'RSA · Alta intensità',
    summary: 'Specializzata in demenze, percorsi riabilitativi e attività cognitive.',
    compatibility: 89,
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127fbfe?w=640&h=420&fit=crop',
  },
  home_care: {
    id: 'sol-home-care',
    kind: 'solution',
    name: 'Assistenza domiciliare',
    type: 'Percorso · Casa',
    summary:
      'Badante o infermiere a domicilio, con agenzia certificata. Restare a casa con supporto.',
    image:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=640&h=420&fit=crop',
  },
  agency: {
    id: 'sol-agency',
    kind: 'solution',
    name: 'Badante via agenzia certificata',
    type: 'Percorso · Sicurezza',
    summary: 'Evita truffe: contratti chiari, sostituti e verifica documenti.',
    image:
      'https://images.unsplash.com/photo-1581578731544-c64695cc6952?w=640&h=420&fit=crop',
  },
  casa_famiglia: {
    id: 'sol-casa-famiglia',
    kind: 'structure',
    name: 'Villa dei Nonni',
    type: 'Casa famiglia',
    summary: 'Comunità familiare, massimo 12 ospiti, rapporto umano costante.',
    compatibility: 87,
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&h=420&fit=crop',
  },
  day_center: {
    id: 'sol-day-center',
    kind: 'solution',
    name: 'Centro diurno',
    type: 'Percorso · Equilibrio',
    summary: 'Assistenza di giorno, rientro a casa la sera. Soluzione intermedia ideale.',
    image:
      'https://images.unsplash.com/photo-1516307365426-bea591950c5b?w=640&h=420&fit=crop',
  },
}

export function queryHasLocationHint(query) {
  const q = String(query ?? '').toLowerCase()
  return LOCATION_HINTS.some((hint) => q.includes(hint))
}

function zoneLabel(selections) {
  const zone = selections?.refinement_zone ?? 'milano'
  if (zone === 'milano') return 'Milano'
  if (zone === 'lombardia') return 'Lombardia'
  return 'la tua zona'
}

/** Rank and pick top 3 solutions based on session selections. */
export function buildTopSolutions(session) {
  const selections = session?.selections ?? {}
  const zone = zoneLabel(selections)
  const budget = selections.refinement_budget
  const care = selections.refinement_care

  const scored = [
    { key: 'rsa_girasole', score: 70 },
    { key: 'home_care', score: 65 },
    { key: 'casa_famiglia', score: 60 },
    { key: 'rsa_serena', score: 55 },
    { key: 'agency', score: 50 },
    { key: 'day_center', score: 45 },
  ]

  if (budget === 'under1500') {
    bump(scored, 'home_care', 25)
    bump(scored, 'day_center', 20)
    bump(scored, 'agency', 15)
    bump(scored, 'rsa_girasole', -15)
  } else if (budget === 'high') {
    bump(scored, 'rsa_girasole', 20)
    bump(scored, 'rsa_serena', 18)
    bump(scored, 'casa_famiglia', 10)
  } else if (budget === 'mid') {
    bump(scored, 'rsa_girasole', 10)
    bump(scored, 'home_care', 10)
  }

  if (care === 'partial') {
    bump(scored, 'home_care', 22)
    bump(scored, 'day_center', 18)
    bump(scored, 'agency', 12)
  } else if (care === 'moderate') {
    bump(scored, 'day_center', 15)
    bump(scored, 'casa_famiglia', 12)
    bump(scored, 'home_care', 8)
  } else if (care === 'intensive') {
    bump(scored, 'rsa_serena', 22)
    bump(scored, 'rsa_girasole', 18)
    bump(scored, 'casa_famiglia', 10)
  }

  scored.sort((a, b) => b.score - a.score)
  const topKeys = scored.slice(0, 3).map((s) => s.key)

  return topKeys.map((key, index) => {
    const base = ALL_SOLUTIONS[key]
    const style = SOLUTION_POST_IT_STYLES[index]
    return {
      ...base,
      location: base.kind === 'structure' ? zone : undefined,
      isBest: index === 0,
      postIt: style,
      rank: index + 1,
    }
  })
}

function bump(list, key, delta) {
  const item = list.find((s) => s.key === key)
  if (item) item.score += delta
}

export function getNextRefinementQuestion(session) {
  const selections = session?.selections ?? {}
  const query = session?.query ?? ''

  if (!selections.refinement_zone && !queryHasLocationHint(query)) {
    return {
      id: 'refinement_zone',
      question: 'In quale zona stai cercando?',
      hint: 'Un dettaglio in più ci aiuta a restringere le proposte.',
      options: [
        { id: 'milano', label: 'Milano e hinterland' },
        { id: 'lombardia', label: 'Altra zona in Lombardia' },
        { id: 'altra', label: 'Altra città o regione' },
      ],
    }
  }

  if (!selections.refinement_budget) {
    return {
      id: 'refinement_budget',
      question: 'Quale budget mensile avete in mente?',
      hint: 'Solo orientativo — nessun impegno.',
      options: [
        { id: 'under1500', label: 'Fino a 1.500 €' },
        { id: 'mid', label: '1.500 – 2.500 €' },
        { id: 'high', label: 'Oltre 2.500 €' },
      ],
    }
  }

  if (!selections.refinement_care) {
    return {
      id: 'refinement_care',
      question: 'Di che livello di assistenza ha bisogno?',
      hint: 'Non serve essere precisi al millimetro.',
      options: [
        { id: 'partial', label: 'Parziale — cammina da solo/a' },
        { id: 'moderate', label: 'Moderato — aiuto quotidiano' },
        { id: 'intensive', label: 'Intensivo — non autosufficiente' },
      ],
    }
  }

  return null
}

export function createInitialRefinementTrail(session) {
  const selections = session?.selections ?? {}
  return [
    {
      id: 'initial',
      label: 'Ricerca iniziale',
      selections: { ...selections },
      solutions: buildTopSolutions(session),
      customNotes: session?.customNotes ?? '',
    },
  ]
}

/** @deprecated import from `../fixtures/editorialMocks` for new code */
export { MOCK_BLOG_RESULTS } from '../fixtures/editorialMocks'

/** @deprecated use buildTopSolutions */
export function buildSolutionGroups(session) {
  return [
    {
      id: 'primary',
      title: 'Soluzioni consigliate',
      solutions: buildTopSolutions(session),
    },
  ]
}
