import { useEffect, useMemo, useState } from 'react'
import { getNextRefinementQuestion } from '../constants/searchResultsData'
import { isApiConfigured } from '../services/apiClient'
import { fetchNandoRefine } from '../services/nandoService'
import { getRefinementFrame } from '../utils/searchSessionStorage'

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

function buildLocalFallback(session, selections) {
  const query = session?.query ?? ''
  return {
    pageTitle: query ? `Risultati per ${query}` : '',
    supported: true,
    question: getNextRefinementQuestion({ ...session, selections }),
    complete: false,
    source: 'fallback',
  }
}

export function useNandoGuide(session) {
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
    () => (session ? buildLocalFallback(session, requestContext?.selections ?? {}) : null),
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

        const result = await fetchNandoRefine({
          query: requestContext.query,
          selections: requestContext.selections,
          customNotes: requestContext.customNotes,
          refinementHistory: requestContext.refinementHistory,
        })

        if (!cancelled) {
          setFetchState({ loading: false, error: null, data: result })
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
      question: null,
      supported: true,
      source: null,
    }
  }

  if (!session.supported) {
    return {
      loading: false,
      error: null,
      pageTitle: defaultTitle,
      question: null,
      supported: false,
      source: 'fallback',
    }
  }

  const resolved = fetchState.data ?? localFallback

  return {
    loading: fetchState.loading,
    error: fetchState.error,
    pageTitle: resolved?.pageTitle || defaultTitle,
    question: resolved?.question ?? null,
    supported: resolved?.supported ?? true,
    source: resolved?.source ?? null,
  }
}
