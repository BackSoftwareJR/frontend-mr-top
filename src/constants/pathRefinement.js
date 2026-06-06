import { queryHasLocationHint } from './searchResultsData'

/** @typedef {'zone' | 'autonomy' | 'budget' | 'timing'} RefinementKey */

export const REFINEMENT_CHIP_META = {
  zone: {
    key: 'zone',
    label: 'Zona',
    questionId: 'refinement_zone',
  },
  autonomy: {
    key: 'autonomy',
    label: 'Scopri il livello',
    questionId: 'refinement_care',
    opensModal: true,
  },
  budget: {
    key: 'budget',
    label: 'Budget',
    questionId: 'refinement_budget',
  },
  timing: {
    key: 'timing',
    label: 'Tempistiche',
    questionId: 'refinement_timing',
  },
}

export const ZONE_FALLBACK_OPTIONS = [
  { id: 'milano', label: 'Milano e hinterland' },
  { id: 'lombardia', label: 'Altra zona in Lombardia' },
  { id: 'altra', label: 'Altra città o regione' },
]

const STRUCTURE_QUESTIONS = {
  zone: {
    id: 'refinement_zone',
    question: 'In quale zona stai cercando?',
    hint: 'Cerca una città o scegli una delle opzioni rapide.',
    useGeoAutocomplete: true,
    options: ZONE_FALLBACK_OPTIONS,
  },
  budget: {
    id: 'refinement_budget',
    question: 'Quale budget mensile avete in mente?',
    hint: 'Solo orientativo — nessun impegno.',
    options: [
      { id: 'under1500', label: 'Fino a 1.500 €' },
      { id: 'mid', label: '1.500 – 2.500 €' },
      { id: 'high', label: 'Oltre 2.500 €' },
    ],
  },
  timing: {
    id: 'refinement_timing',
    question: 'Entro quando vorreste trovare una soluzione?',
    hint: 'Ci aiuta a capire l’urgenza del percorso.',
    options: [
      { id: 'urgent', label: 'Entro 2 settimane' },
      { id: 'soon', label: 'Entro 1–2 mesi' },
      { id: 'flexible', label: 'Senza fretta — sto esplorando' },
    ],
  },
}

const EDITORIAL_QUESTIONS = {
  timing: {
    id: 'refinement_timing',
    question: 'Quanto tempo hai per approfondire?',
    hint: 'Nessuna fretta — scegli il ritmo che preferisci.',
    options: [
      { id: 'quick', label: 'Voglio capire subito l’essenziale' },
      { id: 'deep', label: 'Ho tempo per leggere con calma' },
      { id: 'compare', label: 'Voglio confrontare più punti di vista' },
    ],
  },
  budget: {
    id: 'refinement_editorial_budget',
    question: 'Su quale aspetto economico vuoi concentrarti?',
    hint: 'Ti proponiamo contenuti mirati.',
    options: [
      { id: 'costs', label: 'Costi reali e nascosti' },
      { id: 'subsidies', label: 'Contributi e agevolazioni' },
      { id: 'compare_costs', label: 'Confronto tra opzioni' },
    ],
  },
  zone: {
    id: 'refinement_editorial_zone',
    question: 'Ti interessa un territorio in particolare?',
    hint: 'Filtra gli approfondimenti per zona, se vuoi.',
    useGeoAutocomplete: true,
    options: ZONE_FALLBACK_OPTIONS,
  },
}

/** Maps wizard autonomy values to refinement_care scoring keys. */
export const AUTONOMY_TO_CARE = {
  autosufficiente: 'partial',
  parziale: 'moderate',
  'non-autosufficiente': 'intensive',
}

const CARE_LABELS = {
  partial: 'Autosufficiente',
  moderate: 'Parziale',
  intensive: 'Non autosufficiente',
}

const BUDGET_LABELS = {
  under1500: 'Fino a 1.500 €',
  mid: '1.500 – 2.500 €',
  high: 'Oltre 2.500 €',
}

/**
 * @param {{ pathType?: string, type?: string, kind?: string } | null | undefined} path
 */
export function isStructurePath(path) {
  if (!path) return false
  const type = path.pathType ?? path.type ?? path.kind ?? ''
  return type === 'structure'
}

/**
 * Structure contact is available once zone and autonomy refinements are answered.
 * @param {Record<string, string>} selections
 * @param {string} [query]
 */
export function canRequestStructureContact(selections = {}, query = '') {
  return (
    isRefinementAnswered('zone', selections, query) &&
    isRefinementAnswered('autonomy', selections, query)
  )
}

/**
 * @param {Record<string, string>} selections
 */
export function getCareLabelFromSelections(selections = {}) {
  return CARE_LABELS[selections.refinement_care] ?? null
}

/**
 * @param {Record<string, string>} selections
 */
export function getBudgetLabelFromSelections(selections = {}) {
  return BUDGET_LABELS[selections.refinement_budget] ?? null
}

/**
 * @param {RefinementKey} key
 * @param {Record<string, string>} selections
 * @param {string} [query]
 */
export function isRefinementAnswered(key, selections = {}, query = '') {
  switch (key) {
    case 'zone':
      return Boolean(selections.refinement_zone) || queryHasLocationHint(query)
    case 'autonomy':
      return Boolean(selections.refinement_care || selections.refinement_autonomy)
    case 'budget':
      return Boolean(selections.refinement_budget || selections.refinement_editorial_budget)
    case 'timing':
      return Boolean(selections.refinement_timing)
    default:
      return false
  }
}

/**
 * Pending refinement keys for the active path, in display order.
 * @param {{ refinementNeeded?: RefinementKey[], pathType?: string, type?: string } | null} path
 * @param {Record<string, string>} selections
 * @param {string} [query]
 * @returns {RefinementKey[]}
 */
export function getPendingRefinementKeys(path, selections = {}, query = '') {
  if (!path) return []

  const pathType = path.pathType ?? path.type ?? 'service'
  let needed = Array.isArray(path.refinementNeeded) ? [...path.refinementNeeded] : []

  if (!needed.length) {
    needed =
      pathType === 'editorial'
        ? ['timing', 'budget']
        : ['zone', 'autonomy', 'budget']
  }

  if (pathType === 'editorial') {
    needed = needed.filter((key) => key !== 'autonomy')
    if (!needed.includes('timing') && !isRefinementAnswered('timing', selections, query)) {
      needed.unshift('timing')
    }
  }

  return needed.filter((key) => REFINEMENT_CHIP_META[key] && !isRefinementAnswered(key, selections, query))
}

/**
 * @param {RefinementKey} key
 * @param {string} [pathType]
 */
export function getRefinementQuestion(key, pathType = 'service') {
  const isEditorial = pathType === 'editorial'
  const pool = isEditorial ? EDITORIAL_QUESTIONS : STRUCTURE_QUESTIONS

  if (pool[key]) return pool[key]

  if (key === 'autonomy') {
    return null
  }

  return STRUCTURE_QUESTIONS[key] ?? null
}

/**
 * @param {RefinementKey[]} pendingKeys
 * @returns {{ id: string, label: string }[]}
 */
export function buildRefinementChipActions(pendingKeys) {
  return pendingKeys
    .filter((key) => REFINEMENT_CHIP_META[key])
    .map((key) => ({
      id: `refine_${key}`,
      label: REFINEMENT_CHIP_META[key].label,
      refinementKey: key,
    }))
}

/**
 * Compute refinementNeeded for local fallback paths.
 * @param {Record<string, string>} selections
 * @param {string} query
 * @param {'structure' | 'service' | 'editorial'} [pathType]
 * @returns {RefinementKey[]}
 */
export function computeRefinementNeeded(selections, query, pathType = 'service') {
  const needed = []

  if (!isRefinementAnswered('zone', selections, query)) needed.push('zone')
  if (!isRefinementAnswered('budget', selections, query) && pathType !== 'editorial') {
    needed.push('budget')
  }
  if (!isRefinementAnswered('autonomy', selections, query) && pathType !== 'editorial') {
    needed.push('autonomy')
  }
  if (pathType === 'editorial' && !isRefinementAnswered('timing', selections, query)) {
    needed.push('timing')
  }

  return needed
}
