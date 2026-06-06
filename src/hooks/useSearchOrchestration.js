import { useEffect, useMemo, useState } from 'react'
import { computeRefinementNeeded } from '../constants/pathRefinement'
import {
  buildTopSolutions,
  getNextRefinementQuestion,
  MOCK_BLOG_RESULTS,
  SOLUTION_POST_IT_STYLES,
} from '../constants/searchResultsData'
import { isApiConfigured } from '../services/apiClient'
import { fetchEditorialResults, orchestrateSearch } from '../services/searchService'
import { getRefinementFrame } from '../utils/searchSessionStorage'

const IMAGE_BY_HINT = {
  rsa: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=640&h=420&fit=crop',
  home_care:
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=640&h=420&fit=crop',
  community:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&h=420&fit=crop',
}

const TYPE_BADGES = {
  structure: 'PERCORSO · Struttura',
  service: 'PERCORSO · Servizio',
  editorial: 'PERCORSO · Approfondimento',
}

function buildRefinementHistory(session) {
  const trail = session?.refinementTrail ?? []
  const cursor = session?.refinementCursor ?? 0

  return trail
    .slice(0, cursor + 1)
    .filter((frame) => frame?.questionId)
    .map((frame) => ({
      questionId: frame.questionId,
      answerLabel: frame.label,
    }))
}

function solutionsToPaths(solutions, selections, query) {
  return solutions.map((solution, index) => {
    const pathType = solution.kind === 'structure' ? 'structure' : 'service'

    return {
      id: solution.id,
      type: pathType,
      rank: solution.rank ?? index + 1,
      label: solution.postIt?.tagline ?? SOLUTION_POST_IT_STYLES[index]?.tagline,
      title: solution.name,
      subtitle: solution.type,
      summary: solution.summary,
      whyRecommended: solution.location
        ? `Consigliato per la zona ${solution.location}${solution.compatibility ? ` (${solution.compatibility}% compatibilità stimata)` : ''}.`
        : 'Percorso orientativo basato sulle informazioni che ci hai dato finora.',
      refinementNeeded: computeRefinementNeeded(selections, query, pathType),
      imageHint: solution.kind === 'structure' ? 'rsa' : 'home_care',
      image: solution.image,
      postIt: solution.postIt ?? SOLUTION_POST_IT_STYLES[index],
      isBest: solution.isBest ?? index === 0,
      location: solution.location,
      compatibility: solution.compatibility,
      kind: solution.kind,
    }
  })
}

function decoratePath(path, index) {
  const postIt = SOLUTION_POST_IT_STYLES[index] ?? SOLUTION_POST_IT_STYLES[0]
  const pathType = path.type ?? 'service'

  return {
    ...path,
    name: path.title,
    pathType,
    type: path.subtitle || TYPE_BADGES[pathType] || TYPE_BADGES.service,
    typeBadge: path.subtitle || TYPE_BADGES[pathType] || TYPE_BADGES.service,
    image: path.image ?? IMAGE_BY_HINT[path.imageHint] ?? IMAGE_BY_HINT.home_care,
    postIt: path.postIt ?? {
      ...postIt,
      tagline: path.label ?? postIt.tagline,
    },
    isBest: path.rank === 1,
    kind:
      pathType === 'structure'
        ? 'structure'
        : pathType === 'editorial'
          ? 'editorial'
          : 'solution',
  }
}

function buildLocalFallback(session, selections) {
  const query = session?.query ?? ''
  const solutions = buildTopSolutions({ ...session, selections })
  const paths = solutionsToPaths(solutions, selections, query).map(decoratePath)

  return {
    pageTitle: query ? `Risultati per ${query}` : '',
    supported: true,
    paths,
    editorial: MOCK_BLOG_RESULTS.slice(0, 3).map((item) =>
      enrichEditorialItem({
        id: item.id,
        title: item.title,
        summary: item.description,
        url: item.url,
        relevanceReason: item.category ? `Categoria: ${item.category}` : '',
      }),
    ),
    nando: {
      microPrompt: 'Affina la ricerca con Nando',
      actions: [{ id: 'explain_why', label: 'Scopri perché ti abbiamo consigliato' }],
      question: getNextRefinementQuestion({ ...session, selections }),
    },
    source: 'fallback',
  }
}

function mapApiPaths(paths) {
  return (paths ?? []).map((path, index) => decoratePath(path, index))
}

const DEFAULT_EDITORIAL_IMAGES = {
  article:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
  story:
    'https://images.unsplash.com/photo-1581578731544-c64695cc6952?w=600&h=400&fit=crop',
  interview:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
}

function findMockMeta(item) {
  const byId = MOCK_BLOG_RESULTS.find((mock) => mock.id === item.id)
  if (byId) return byId

  const needle = String(item.title ?? '').toLowerCase().slice(0, 24)
  if (!needle) return null

  return MOCK_BLOG_RESULTS.find((mock) => {
    const haystack = mock.title.toLowerCase()
    return haystack.startsWith(needle.slice(0, 18)) || haystack.includes(needle.slice(0, 12))
  })
}

function enrichEditorialItem(item) {
  const mock = findMockMeta(item)
  const type = mock?.type ?? item.type ?? 'article'

  return {
    ...item,
    description: item.summary ?? item.description ?? mock?.description ?? '',
    summary: item.summary ?? item.description ?? mock?.description ?? '',
    url: item.url && item.url !== '#' ? item.url : mock?.url ?? item.url ?? '#',
    image: mock?.image ?? item.image ?? DEFAULT_EDITORIAL_IMAGES[type] ?? DEFAULT_EDITORIAL_IMAGES.article,
    type,
    category: mock?.category ?? item.category ?? 'Editoriale',
    readMinutes: mock?.readMinutes ?? item.readMinutes ?? 5,
    relevanceReason: item.relevanceReason ?? mock?.relevanceReason ?? '',
  }
}

function mergeEditorial(orchestratorItems, apiItems) {
  const seen = new Set()
  const merged = []

  const add = (item) => {
    if (!item?.title) return
    const key = item.id ?? item.title
    if (seen.has(key)) return
    seen.add(key)
    merged.push(enrichEditorialItem(item))
  }

  ;(orchestratorItems ?? []).forEach(add)
  ;(apiItems ?? []).forEach(add)

  return merged
}

export function useSearchOrchestration(session) {
  const query = session?.query ?? ''
  const defaultTitle = query ? `Risultati per ${query}` : ''

  const requestContext = useMemo(() => {
    if (!session) return null

    const { frame: currentFrame } = getRefinementFrame(session)

    return {
      sessionId: session.id,
      supported: session.supported,
      query,
      selections: currentFrame?.selections ?? session.selections ?? {},
      customNotes: currentFrame?.customNotes ?? session.customNotes ?? '',
      refinementHistory: buildRefinementHistory(session),
      refinementCursor: session.refinementCursor ?? 0,
    }
  }, [session, query])

  const localFallback = useMemo(
    () =>
      session
        ? buildLocalFallback(session, requestContext?.selections ?? {})
        : null,
    [session, requestContext?.selections],
  )

  const [fetchState, setFetchState] = useState({
    loading: false,
    error: null,
    data: null,
  })

  useEffect(() => {
    if (!requestContext?.supported || !requestContext.query) {
      return undefined
    }

    let cancelled = false

    void (async () => {
      setFetchState({ loading: true, error: null, data: null })

      try {
        if (!isApiConfigured()) {
          const local = buildLocalFallback(session, requestContext.selections)
          if (!cancelled) {
            setFetchState({ loading: false, error: null, data: local })
          }
          return
        }

        const [result, apiEditorial] = await Promise.all([
          orchestrateSearch({
            query: requestContext.query,
            selections: requestContext.selections,
            customNotes: requestContext.customNotes,
            refinementHistory: requestContext.refinementHistory,
          }),
          fetchEditorialResults({
            q: requestContext.query,
            sector: 'elder_care',
            limit: 6,
          }),
        ])

        if (!cancelled) {
          setFetchState({
            loading: false,
            error: null,
            data: {
              pageTitle: result.pageTitle,
              supported: result.supported,
              paths: mapApiPaths(result.paths),
              editorial: mergeEditorial(result.editorial, apiEditorial),
              nando: result.nando,
              source: result.source,
            },
          })
        }
      } catch (err) {
        if (!cancelled) {
          setFetchState({
            loading: false,
            error: err,
            data: buildLocalFallback(session, requestContext.selections),
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [requestContext, session])

  if (!session) {
    return {
      loading: false,
      error: null,
      pageTitle: '',
      paths: [],
      editorial: [],
      nando: null,
      supported: true,
      source: null,
    }
  }

  if (!session.supported) {
    return {
      loading: false,
      error: null,
      pageTitle: defaultTitle,
      paths: [],
      editorial: MOCK_BLOG_RESULTS.slice(0, 3).map((item) =>
        enrichEditorialItem({
          id: item.id,
          title: item.title,
          summary: item.description,
          url: item.url,
          relevanceReason: '',
        }),
      ),
      nando: null,
      supported: false,
      source: 'fallback',
    }
  }

  const resolved = fetchState.data ?? localFallback

  return {
    loading: fetchState.loading,
    error: fetchState.error,
    pageTitle: resolved?.pageTitle || defaultTitle,
    paths: resolved?.paths ?? [],
    editorial: resolved?.editorial ?? [],
    nando: resolved?.nando ?? null,
    supported: resolved?.supported ?? true,
    source: resolved?.source ?? null,
  }
}
