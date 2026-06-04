import { useEffect, useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import B2BLoadError from '../../components/b2b/B2BLoadError'
import {
  b2bCard,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
} from '../../components/b2b/b2bStyles'
import { isApiConfigured } from '../../services/apiClient'
import {
  createExport,
  downloadExportBlob,
  fetchExportTypes,
} from '../../services/b2bExportService'

export default function ExportCenter() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [error, setError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL per usare l\'Export Center.',
  )
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const exports = await fetchExportTypes()
        if (!cancelled) setTypes(exports)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Errore caricamento export.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleExport(type, format) {
    setExporting(`${type}-${format}`)
    setError(null)
    try {
      const result = await createExport({ type, format })
      if (result.format === 'csv' && result.blob) {
        downloadExportBlob(result.blob, result.filename)
      } else {
        const blob = new Blob([JSON.stringify(result.rows, null, 2)], {
          type: 'application/json',
        })
        downloadExportBlob(blob, result.filename ?? `wenando-${type}.json`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export non riuscito.')
    } finally {
      setExporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-coral" />
      </div>
    )
  }

  if (error && types.length === 0) {
    return <B2BLoadError message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className={b2bPageTitle}>Export Center</h1>
        <p className={b2bPageSubtitle}>
          Esporta i dati strutturali della tua azienda (lead, CRM, transazioni, appuntamenti, profilo).
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {types.map((item) => (
          <div key={item.type} className={`${b2bCard} p-5`}>
            <div className="mb-3 flex items-start gap-3">
              <FileSpreadsheet className="mt-0.5 h-5 w-5 text-accent-coral" />
              <div>
                <h2 className="text-sm font-semibold text-charcoal">{item.label}</h2>
                <p className="text-xs text-charcoal-muted">Tipo: {item.type}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(item.formats ?? ['csv']).map((format) => (
                <button
                  key={format}
                  type="button"
                  disabled={exporting !== null}
                  onClick={() => handleExport(item.type, format)}
                  className={`inline-flex items-center gap-1.5 ${b2bPrimaryBtn} text-xs`}
                >
                  {exporting === `${item.type}-${format}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
