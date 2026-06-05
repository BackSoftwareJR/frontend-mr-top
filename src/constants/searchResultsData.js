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

export const MOCK_BLOG_RESULTS = [
  {
    id: 'blog-1',
    type: 'article',
    title: 'Come riconoscere un’agenzia per badanti affidabile',
    description:
      'Segnali positivi, red flags e domande da fare prima di firmare un contratto.',
    category: 'Anti-truffe',
    readMinutes: 6,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
    featured: true,
  },
  {
    id: 'blog-2',
    type: 'article',
    title: 'RSA vs assistenza domiciliare: quale scegliere',
    description: 'Confronto onesto tra costi, qualità della vita e carico familiare.',
    category: 'Guida',
    readMinutes: 8,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=400&fit=crop',
  },
  {
    id: 'blog-3',
    type: 'article',
    title: 'Quanto costa davvero una badante convivente',
    description: 'Rette, contributi e costi nascosti spiegati con chiarezza.',
    category: 'Costi',
    readMinutes: 5,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1554224311-beee415c201f?w=600&h=400&fit=crop',
  },
  {
    id: 'blog-4',
    type: 'article',
    title: 'Patto di non autolesionismo: cos’è e perché conta',
    description: 'Tutela legale per chi cerca strutture: cosa chiedere e come verificare.',
    category: 'Diritti',
    readMinutes: 7,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=600&h=400&fit=crop',
  },
  {
    id: 'blog-5',
    type: 'article',
    title: 'Checklist prima di visitare una RSA',
    description: 'Cosa osservare, domande da fare e documenti da richiedere.',
    category: 'Guide',
    readMinutes: 6,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
  },
  {
    id: 'story-1',
    type: 'story',
    title: 'Laura e la mamma: trovare una RSA a Milano',
    description: 'Tempi, dubbi, emozioni — un percorso familiare raccontato con serenità.',
    category: 'Storia',
    readMinutes: 4,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1581578731544-c64695cc6952?w=600&h=400&fit=crop',
  },
  {
    id: 'story-2',
    type: 'story',
    title: 'Marco sceglie l’assistenza a domicilio per il papà',
    description: 'Perché hanno preferito casa rispetto alla struttura, e come si sono organizzati.',
    category: 'Storia',
    readMinutes: 5,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=400&fit=crop',
  },
  {
    id: 'story-3',
    type: 'story',
    title: 'Anna evita una truffa: cosa ha notato',
    description: 'I segnali che l’hanno messa in allarme prima di firmare con un’agenzia.',
    category: 'Storia',
    readMinutes: 3,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop',
  },
  {
    id: 'interview-1',
    type: 'interview',
    title: 'Intervista a un coordinatore RSA: cosa chiedere sempre',
    description: 'Dieci domande che rivelano qualità reale di una struttura.',
    category: 'Intervista',
    readMinutes: 9,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
  },
  {
    id: 'interview-2',
    type: 'interview',
    title: 'Badante convivente: parla un’assistente con 15 anni di esperienza',
    description: 'Aspettative realistiche, confini e come costruire un rapporto sano.',
    category: 'Intervista',
    readMinutes: 7,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127fbfe?w=600&h=400&fit=crop',
  },
  {
    id: 'interview-3',
    type: 'interview',
    title: 'Avvocato del consumatore: come tutelarsi dalle finte agenzie',
    description: 'Consigli pratici e strumenti legali per le famiglie.',
    category: 'Intervista',
    readMinutes: 8,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=600&h=400&fit=crop',
  },
  {
    id: 'article-6',
    type: 'article',
    title: 'Centro diurno o badante: la guida per decidere',
    description: 'Quando ha senso la soluzione intermedia e come valutarla.',
    category: 'Guida',
    readMinutes: 6,
    url: '#',
    image:
      'https://images.unsplash.com/photo-1516307365426-bea591950c5b?w=600&h=400&fit=crop',
  },
]

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
