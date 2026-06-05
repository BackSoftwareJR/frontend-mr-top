import apiClient, { unwrapApiData } from './apiClient'

/**
 * @param {{ query: string, selections?: Record<string, string>, customNotes?: string, refinementHistory?: Array<{ questionId: string, answerLabel: string }> }} params
 * @returns {Promise<{ pageTitle: string, supported: boolean, question: object | null, complete: boolean, source: 'groq' | 'fallback' }>}
 */
export async function fetchNandoRefine({
  query,
  selections = {},
  customNotes = '',
  refinementHistory = [],
}) {
  const response = await apiClient.post('/b2c/nando/refine', {
    query,
    selections,
    customNotes,
    refinementHistory,
  })

  const data = unwrapApiData(response)
  const source = response.data?.meta?.source === 'groq' ? 'groq' : 'fallback'

  return {
    pageTitle: data.pageTitle,
    supported: data.supported ?? true,
    question: data.complete ? null : (data.question ?? null),
    complete: Boolean(data.complete),
    source,
  }
}
