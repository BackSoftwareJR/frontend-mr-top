import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Pencil, Plus } from 'lucide-react'
import B2BLoadError from '../../../components/b2b/B2BLoadError'
import {
  b2bCard,
  b2bGhostBtn,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
} from '../../../components/b2b/b2bStyles'
import {
  B2B_EDITORIAL_CONTENT_STATUSES,
  B2B_EDITORIAL_STATUS_COLORS,
  listB2bContents,
} from '../../../services/b2bEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'

function StatusBadge({ status }) {
  const label = B2B_EDITORIAL_CONTENT_STATUSES.find((s) => s.value === status)?.label ?? status

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
        B2B_EDITORIAL_STATUS_COLORS[status] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
      }`}
    >
      {label}
    </span>
  )
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EditorialListPage() {
  const [contents, setContents] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come partner.',
  )
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    const params = {}
    if (statusFilter) params.status = statusFilter

    listB2bContents(params)
      .then((result) => {
        if (!cancelled) setContents(result.contents)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : 'Impossibile caricare i contenuti editoriali.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, retryCount])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={b2bPageTitle}>Editoriale</h1>
          <p className={b2bPageSubtitle}>
            Crea storie e articoli della tua struttura. I contenuti passano in revisione prima della
            pubblicazione.
          </p>
        </div>
        <Link to="/pro/editoriale/new" className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}>
          <Plus className="h-4 w-4" />
          Nuovo contenuto
        </Link>
      </div>

      <div className={`${b2bCard} flex flex-wrap items-center gap-3 p-4`}>
        <label htmlFor="b2b-editorial-status" className="text-sm font-medium text-charcoal-muted">
          Stato
        </label>
        <select
          id="b2b-editorial-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-black/5 bg-white/80 px-3 py-2 text-sm text-charcoal focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20"
        >
          <option value="">Tutti</option>
          {B2B_EDITORIAL_CONTENT_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={`${b2bCard} flex items-center justify-center py-16`}>
          <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
        </div>
      ) : loadError ? (
        <B2BLoadError message={loadError} onRetry={() => setRetryCount((c) => c + 1)} />
      ) : contents.length === 0 ? (
        <div className={`${b2bCard} px-6 py-12 text-center`}>
          <p className="text-sm text-charcoal-muted">Nessun contenuto ancora.</p>
          <Link to="/pro/editoriale/new" className={`mt-4 inline-flex ${b2bPrimaryBtn}`}>
            Crea il primo contenuto
          </Link>
        </div>
      ) : (
        <div className={`${b2bCard} overflow-hidden`}>
          <ul className="divide-y divide-black/5">
            {contents.map((item) => (
              <li key={item.uuid} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal">{item.title || 'Senza titolo'}</p>
                  <p className="mt-0.5 text-xs text-charcoal-muted">
                    {item.rubric?.name ?? item.rubricSlug ?? '—'} · Aggiornato{' '}
                    {formatDate(item.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={item.status} />
                <Link
                  to={`/pro/editoriale/${item.uuid}/edit`}
                  className={`inline-flex items-center gap-1.5 ${b2bGhostBtn}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifica
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
