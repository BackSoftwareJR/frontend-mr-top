import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Pencil, Plus, X } from 'lucide-react'
import B2BLoadError from '../../../components/b2b/B2BLoadError'
import B2bEditorialSubNav from '../../../components/b2b/editorial/B2bEditorialSubNav'
import { b2bCard, b2bGhostBtn, b2bPrimaryBtn } from '../../../components/b2b/b2bStyles'
import {
  B2B_EDITORIAL_CONTENT_STATUSES,
  listB2bContents,
} from '../../../services/b2bEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialContentStatusPill from '../../../components/editorial/EditorialContentStatusPill'
import EditorialListSkeleton from '../../../components/editorial/EditorialListSkeleton'
import EditorialEmptyState from '../../../components/editorial/EditorialEmptyState'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'
import {
  b2bFilterChip,
  b2bFilterChipActive,
  b2bFilterChipInactive,
} from '../../../components/editorial/editorialFilterStyles'

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

  const activeFilterCount = useMemo(() => (statusFilter ? 1 : 0), [statusFilter])

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
    <EditorialPageMotion className="mx-auto max-w-5xl space-y-6">
      <EditorialPageHeader
        variant="b2b"
        title="Editoriale"
        subtitle="Crea storie e articoli della tua struttura. I contenuti passano in revisione prima della pubblicazione."
        actions={
          <Link to="/pro/editoriale/new" className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuovo contenuto
          </Link>
        }
      />

      <B2bEditorialSubNav />

      <div className={`${b2bCard} space-y-4 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Filter className="h-4 w-4 text-charcoal-muted" aria-hidden="true" />
            Filtra per stato
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-accent-coral/10 px-2 py-0.5 text-xs font-semibold text-accent-coral">
                {activeFilterCount}
              </span>
            ) : null}
          </div>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/30 rounded-md px-1"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Azzera
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`${b2bFilterChip} ${!statusFilter ? b2bFilterChipActive : b2bFilterChipInactive}`}
          >
            Tutti
          </button>
          {B2B_EDITORIAL_CONTENT_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`${b2bFilterChip} ${statusFilter === value ? b2bFilterChipActive : b2bFilterChipInactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <EditorialListSkeleton variant="b2b" rows={5} />
      ) : loadError ? (
        <B2BLoadError message={loadError} onRetry={() => setRetryCount((c) => c + 1)} />
      ) : contents.length === 0 ? (
        <EditorialEmptyState
          variant="b2b"
          title="Nessun contenuto ancora"
          description={
            statusFilter
              ? 'Nessun contenuto con questo stato. Prova un altro filtro.'
              : 'Pubblica storie e articoli per la tua struttura su Wenando Magazine.'
          }
          actionLabel={statusFilter ? undefined : 'Crea il primo contenuto'}
          actionTo={statusFilter ? undefined : '/pro/editoriale/new'}
        />
      ) : (
        <div className={`${b2bCard} overflow-hidden`}>
          <ul className="divide-y divide-black/5">
            {contents.map((item) => (
              <li
                key={item.uuid}
                className="flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-black/[0.02] sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal">{item.title || 'Senza titolo'}</p>
                  <p className="mt-0.5 text-xs text-charcoal-muted">
                    {item.rubric?.name ?? item.rubricSlug ?? '—'} · Aggiornato{' '}
                    {formatDate(item.updatedAt)}
                  </p>
                </div>
                <EditorialContentStatusPill status={item.status} variant="b2b" />
                <Link
                  to={`/pro/editoriale/${item.uuid}/edit`}
                  className={`inline-flex items-center gap-1.5 ${b2bGhostBtn}`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Modifica
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </EditorialPageMotion>
  )
}
