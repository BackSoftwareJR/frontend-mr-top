import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'

/**
 * GET /b2b/exports — list available export types (API only).
 */
export async function fetchExportTypes() {
  const response = await apiClient.get('/b2b/exports')
  const data = unwrapApiData(response)
  return Array.isArray(data.exports) ? data.exports : []
}

/**
 * POST /b2b/exports — generate export (CSV download or JSON payload).
 * @param {{ type: string, format: 'csv' | 'json' }} params
 */
export async function createExport({ type, format }) {
  if (!isApiConfigured()) {
    throw new Error('Export Center richiede API configurata.')
  }

  if (format === 'csv') {
    const response = await apiClient.post(
      '/b2b/exports',
      { type, format },
      { responseType: 'blob' },
    )

    const disposition = response.headers['content-disposition'] ?? ''
    const match = /filename="([^"]+)"/.exec(disposition)
    const filename = match?.[1] ?? `wenando-${type}-${Date.now()}.csv`

    return {
      format: 'csv',
      filename,
      blob: response.data,
    }
  }

  const response = await apiClient.post('/b2b/exports', { type, format })
  const data = unwrapApiData(response)

  return {
    format: 'json',
    filename: data.filename,
    rowCount: data.row_count ?? 0,
    rows: data.rows ?? [],
  }
}

/**
 * Trigger browser download for a CSV blob.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadExportBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
