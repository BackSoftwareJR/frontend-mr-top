import { useEffect, useMemo, useState } from 'react'
import { MOCK_BLOG_RESULTS } from '../fixtures/editorialMocks'
import {
  fetchEditorialContents,
  fetchEditorialForQuery,
  isEditorialApiEnabled,
} from '../services/editorialService'

const FIXTURE_STATE = {
  articles: MOCK_BLOG_RESULTS,
  loading: false,
  error: null,
  source: 'fixture',
}

/**
 * Query-aware editorial rail for /esplora: prefers internal search when session has a query.
 * @param {{ query?: string } | null | undefined} session
 * @param {{ type?: string, rubric?: string, featured?: boolean, limit?: number, page?: number }} [filters]
 * @returns {{ articles: Array<object>, loading: boolean, error: Error | null, source: 'query' | 'api' | 'fixture' }}
 */
export function useQueryAwareEditorial(session, filters = {}) {
  const apiEnabled = isEditorialApiEnabled()
  const query = session?.query?.trim() ?? ''
  const { type, rubric, featured, limit, page } = filters

  const parsedFilters = useMemo(
    () => ({ type, rubric, featured, limit, page }),
    [type, rubric, featured, limit, page],
  )

  const [state, setState] = useState(() =>
    apiEnabled
      ? { articles: MOCK_BLOG_RESULTS, loading: true, error: null, source: 'fixture' }
      : FIXTURE_STATE,
  )

  useEffect(() => {
    if (!apiEnabled) {
      return undefined
    }

    let cancelled = false

    void (async () => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }))

      try {
        if (query) {
          const queryResults = await fetchEditorialForQuery(query, {
            limit: parsedFilters.limit ?? 50,
            type: parsedFilters.type,
            rubric: parsedFilters.rubric,
          })

          if (!cancelled && queryResults.length > 0) {
            setState({
              articles: queryResults,
              loading: false,
              error: null,
              source: 'query',
            })
            return
          }
        }

        const contents = await fetchEditorialContents(parsedFilters)

        if (!cancelled) {
          setState({
            articles: contents.length > 0 ? contents : MOCK_BLOG_RESULTS,
            loading: false,
            error: null,
            source: contents.length > 0 ? 'api' : 'fixture',
          })
        }
      } catch (error) {
        console.warn('[Wenando] Editorial CMS API unavailable — using fixtures:', error)

        if (!cancelled) {
          setState({
            articles: MOCK_BLOG_RESULTS,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
            source: 'fixture',
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiEnabled, query, parsedFilters])

  if (!apiEnabled) {
    return FIXTURE_STATE
  }

  return state
}

/**
 * @param {{ type?: string, rubric?: string, featured?: boolean, limit?: number, page?: number }} [filters]
 * @returns {{ articles: Array<object>, loading: boolean, error: Error | null, source: 'api' | 'fixture' }}
 */
export function useEditorialContents(filters = {}) {
  const apiEnabled = isEditorialApiEnabled()
  const { type, rubric, featured, limit, page } = filters

  const parsedFilters = useMemo(
    () => ({ type, rubric, featured, limit, page }),
    [type, rubric, featured, limit, page],
  )

  const [state, setState] = useState(() =>
    apiEnabled
      ? { articles: MOCK_BLOG_RESULTS, loading: true, error: null, source: 'fixture' }
      : FIXTURE_STATE,
  )

  useEffect(() => {
    if (!apiEnabled) {
      return undefined
    }

    let cancelled = false

    void (async () => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }))

      try {
        const contents = await fetchEditorialContents(parsedFilters)

        if (!cancelled) {
          setState({
            articles: contents.length > 0 ? contents : MOCK_BLOG_RESULTS,
            loading: false,
            error: null,
            source: contents.length > 0 ? 'api' : 'fixture',
          })
        }
      } catch (error) {
        console.warn('[Wenando] Editorial CMS API unavailable — using fixtures:', error)

        if (!cancelled) {
          setState({
            articles: MOCK_BLOG_RESULTS,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
            source: 'fixture',
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiEnabled, parsedFilters])

  if (!apiEnabled) {
    return FIXTURE_STATE
  }

  return state
}
