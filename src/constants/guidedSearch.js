/** Guided search — sector config, mock RSA flow, keyword classification. */

export const SEARCH_SESSIONS_STORAGE_KEY = 'wenando-search-sessions'

export const SUPPORTED_SECTORS = {
  elder_care: {
    id: 'elder_care',
    label: 'Assistenza anziani',
    specialties: [
      'case famiglia',
      'strutture',
      'anziani',
      'ospedaliero',
      'infermieri',
      'badanti',
      'agenzie lavoro',
      'anti-truffe',
    ],
  },
}

/** Mock keyword → sector mapping (Groq classification later). */
const ELDER_CARE_KEYWORDS = [
  'rsa',
  'residenza',
  'anzian',
  'badante',
  'caregiver',
  'assistenz',
  'nursing',
  'casa di riposo',
  'struttura',
  'nonn',
  'genitor',
  'mamma',
  'papà',
  'papa',
  'caro',
  'famiglia',
]

export function classifySearchQuery(rawQuery) {
  const query = String(rawQuery ?? '').trim().toLowerCase()
  if (!query) {
    return { supported: false, reason: 'empty' }
  }

  const matchesElderCare = ELDER_CARE_KEYWORDS.some((kw) => query.includes(kw))
  if (matchesElderCare) {
    return {
      supported: true,
      sectorId: 'elder_care',
      entryStepId: 'rsa_disambiguation',
    }
  }

  return { supported: false, reason: 'unsupported_topic' }
}

export const RSA_DISAMBIGUATION = {
  id: 'rsa_disambiguation',
  type: 'disambiguation',
  headline: 'Partiamo da qui',
  subheadline: 'Scegli l’opzione che descrive meglio la tua curiosità — puoi cambiare idea in qualsiasi momento.',
  chips: [
    {
      id: 'for_loved_one',
      label: 'Stai cercando una RSA per te o un caro?',
      icon: 'heart',
      nextStepId: 'rsa_location_hint',
    },
    {
      id: 'open_rsa',
      label: 'Vorresti aprirla?',
      icon: 'building',
      nextStepId: 'unsupported_open_rsa',
    },
    {
      id: 'what_is_rsa',
      label: 'Vorresti sapere cos’è?',
      icon: 'book',
      nextStepId: 'rsa_explainer',
    },
    {
      id: 'alternatives',
      label: 'Vuoi conoscere alternative alle RSA?',
      icon: 'shuffle',
      nextStepId: 'rsa_alternatives',
    },
    {
      id: 'costs',
      label: 'Quanto costano le RSA?',
      icon: 'euro',
      nextStepId: 'rsa_costs',
    },
  ],
}

export const EXPLORATION_STEPS = {
  rsa_disambiguation: RSA_DISAMBIGUATION,

  rsa_location_hint: {
    id: 'rsa_location_hint',
    type: 'editorial',
    headline: 'Dove vorresti cercare?',
    body: 'Indica città o zona — useremo la tua ricerca iniziale come punto di partenza. Puoi affinare dopo.',
    showQueryEcho: true,
    nextStepId: 'rsa_structures',
  },

  rsa_explainer: {
    id: 'rsa_explainer',
    type: 'editorial',
    headline: 'Cos’è una RSA',
    body: 'Una Residenza Sanitaria Assistenziale accoglie persone non autosufficienti che non possono essere assistite a domicilio. Offre assistenza sanitaria, infermieristica e sociale h24 — non è un semplice hotel per anziani.',
    editorialNote: 'Wenando ti aiuta a capire se è la scelta giusta per la vostra situazione, senza pressioni commerciali.',
    nextStepId: 'rsa_disambiguation',
    nextLabel: 'Esplora altre opzioni',
  },

  rsa_alternatives: {
    id: 'rsa_alternatives',
    type: 'editorial',
    headline: 'Alternative alle RSA',
    body: 'Assistenza domiciliare (badante o infermiere), case famiglia, centri diurni o co-housing senior possono essere valide a seconda del livello di autonomia e del budget.',
    chips: [
      { id: 'home_care', label: 'Assistenza a domicilio', nextStepId: 'unsupported_home_care' },
      { id: 'family_house', label: 'Case famiglia', nextStepId: 'rsa_structures' },
      { id: 'day_center', label: 'Centro diurno', nextStepId: 'unsupported_day_center' },
    ],
  },

  rsa_costs: {
    id: 'rsa_costs',
    type: 'editorial',
    headline: 'Quanto costa una RSA',
    body: 'In Italia la retta varia molto per regione, grado di assistenza e servizi extra. Una fascia indicativa è 2.000–3.500 € al mese, spesso con coperture parziali ASL o integrazioni familiari.',
    editorialNote: 'I costi reali dipendono dalla vostra situazione: Wenando vi aiuta a confrontare senza sorprese.',
    nextStepId: 'rsa_structures',
    nextLabel: 'Vedi strutture di esempio',
  },

  rsa_structures: {
    id: 'rsa_structures',
    type: 'structures',
    headline: 'Strutture in evidenza',
    subheadline: 'Esempi nella tua zona — i contatti restano nascosti finché non li scegli tu.',
  },

  unsupported_open_rsa: {
    id: 'unsupported_open_rsa',
    type: 'unsupported',
    topic: 'aprire una RSA',
  },

  unsupported_home_care: {
    id: 'unsupported_home_care',
    type: 'unsupported',
    topic: 'assistenza domiciliare',
  },

  unsupported_day_center: {
    id: 'unsupported_day_center',
    type: 'unsupported',
    topic: 'centri diurni',
  },

  unsupported_topic: {
    id: 'unsupported_topic',
    type: 'unsupported',
    topic: null,
  },
}

/** Mock structures for RSA exploration (real API later). */
export const MOCK_EXPLORATION_STRUCTURES = [
  {
    id: 'mock-rsa-1',
    name: 'Residenza Il Girasole',
    type: 'RSA · Assistenza media',
    location: 'Milano Nord',
    compatibility: 92,
    summary: 'Ambiente caldo, giardino accessibile, equipe infermieristica dedicata.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=450&fit=crop',
  },
  {
    id: 'mock-rsa-2',
    name: 'Casa Serena',
    type: 'RSA · Alta intensità',
    location: 'Monza',
    compatibility: 88,
    summary: 'Specializzata in demenze, percorsi riabilitativi e attività cognitive.',
    image: 'https://images.unsplash.com/photo-1581578731544-c64695cc6952?w=600&h=450&fit=crop',
  },
  {
    id: 'mock-rsa-3',
    name: 'Villa dei Nonni',
    type: 'Casa famiglia',
    location: 'Sesto San Giovanni',
    compatibility: 85,
    summary: 'Piccola comunità familiare, massimo 12 ospiti, rapporto umano costante.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=450&fit=crop',
  },
]

export function getStepById(stepId) {
  return EXPLORATION_STEPS[stepId] ?? null
}

export function buildSessionLabel(query) {
  const trimmed = String(query ?? '').trim()
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 45)}…`
}
