import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Filter, Loader2, Pencil, Plus, Search, X } from 'lucide-react'
import {
  EDITORIAL_CONTENT_STATUSES,
  EDITORIAL_CONTENT_TYPES,
  generatePreviewToken,
  listContents,
} from '../../../services/adminEditorialService'
import { fetchEditorialRubrics } from '../../../services/editorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import { getSeoScoreBadgeClass } from '../../../components/admin/editorial/seoUtils'
import { adminGlassCard } from '../../../components/admin/adminStyles'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialContentStatusPill from '../../../components/editorial/EditorialContentStatusPill'
import EditorialListSkeleton from '../../../components/editorial/EditorialListSkeleton'
import EditorialEmptyState from '../../../components/editorial/EditorialEmptyState'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'
import {
  adminFilterChip,
  adminFilterChipActive,
  adminFilterChipInactive,
  adminFilterInput,
  adminFilterSelect,
} from '../../../components/editorial/editorialFilterStyles'

function SeoScoreBadge({ score }) {
  if (score == null) {
    return <span className="text-xs text-zinc-600">—</span>
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${getSeoScoreBadgeClass(score)}`}
    >
      {score}
    </span>
  )
}

export default function EditorialListPage() {
  const [contents, setContents] = useState([])
  const [rubrics, setRubrics] = useState([])
  const [filters, setFilters] = useState({ status: '', type: '', rubricId: '', q: '' })
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured()
      ? null
      : 'Configura VITE_API_URL e accedi come admin per gestire i contenuti editoriali.',
  )
  const [retryCount, setRetryCount] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(null)

  const activeFilterCount = useMemo(
    () => [filters.status, filters.type, filters.rubricId, filters.q.trim()].filter(Boolean).length,
    [filters],
  )

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type
    if (filters.rubricId) params.rubricId = Number(filters.rubricId)
    if (filters.q.trim()) params.q = filters.q.trim()

    listContents(params)
      .then((result) => {
        if (!cancelled) setContents(result.contents)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare i contenuti editoriali.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters, retryCount])

  useEffect(() => {
    if (!isApiConfigured()) return

    fetchEditorialRubrics()
      .then(setRubrics)
      .catch(() => setRubrics([]))
  }, [])

  const handlePreview = async (uuid) => {
    setPreviewLoading(uuid)
    try {
      const { previewUrl } = await generatePreviewToken(uuid)
      if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Impossibile generare l’anteprima.',
      )
    } finally {
      setPreviewLoading(null)
    }
  }

  const clearFilters = () => {
    setFilters({ status: '', type: '', rubricId: '', q: '' })
  }

  return (
    <EditorialPageMotion className="mx-auto max-w-6xl space-y-6">
      <EditorialPageHeader
        variant="admin"
        title="Editoriale"
        subtitle="Gestisci articoli, storie e contenuti magazine Wenando"
        actions={
          <Link
            to="/admin/editorial/new"
            className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuovo contenuto
          </Link>
        }
      />

      <EditorialSubNav />

      <div className={`${adminGlassCard} space-y-4 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Filter className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Filtri
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-accent-coral/15 px-2 py-0.5 text-xs font-semibold text-accent-coral">
                {activeFilterCount}
              </span>
            ) : null}
          </div>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 rounded-md px-1"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Azzera filtri
            </button>
          ) : null}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Cerca per titolo…"
            className={`${adminFilterInput} pl-9 pr-3`}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Stato</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, status: '' }))}
              className={`${adminFilterChip} ${!filters.status ? adminFilterChipActive : adminFilterChipInactive}`}
            >
              Tutti
            </button>
            {EDITORIAL_CONTENT_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, status: s.value }))}
                className={`${adminFilterChip} ${filters.status === s.value ? adminFilterChipActive : adminFilterChipInactive}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="editorial-filter-type" className="mb-1.5 block text-xs font-medium text-zinc-500">
              Tipo contenuto
            </label>
            <select
              id="editorial-filter-type"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className={adminFilterSelect}
            >
              <option value="">Tutti i tipi</option>
              {EDITORIAL_CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="editorial-filter-rubric" className="mb-1.5 block text-xs font-medium text-zinc-500">
              Rubrica
            </label>
            <select
              id="editorial-filter-rubric"
              value={filters.rubricId}
              onChange={(e) => setFilters((f) => ({ ...f, rubricId: e.target.value }))}
              className={adminFilterSelect}
            >
              <option value="">Tutte le rubriche</option>
              {rubrics.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadError && !loading ? (
        <AdminLoadError
          message={loadError}
          onRetry={() => {
            setLoading(true)
            setLoadError(null)
            setRetryCount((n) => n + 1)
          }}
        />
      ) : null}

      {loading ? (
        <EditorialListSkeleton variant="admin" rows={7} />
      ) : loadError ? null : contents.length === 0 ? (
        <EditorialEmptyState
          variant="admin"
          title="Nessun contenuto trovato"
          description={
            activeFilterCount > 0
              ? 'Prova a modificare i filtri o crea un nuovo articolo.'
              : 'Inizia creando il primo contenuto per Wenando Magazine.'
          }
          actionLabel="Nuovo contenuto"
          actionTo="/admin/editorial/new"
        />
      ) : (
        <div className={`${adminGlassCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/30 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium">Titolo</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Rubrica</th>
                  <th className="px-4 py-3 font-medium">Stato</th>
                  <th className="px-4 py-3 font-medium">SEO</th>
                  <th className="px-4 py-3 font-medium">Aggiornato</th>
                  <th className="px-4 py-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((item) => (
                  <tr
                    key={item.uuid}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="max-w-[220px] truncate px-4 py-3 font-medium text-white">
                      {item.title || 'Senza titolo'}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">
                      {EDITORIAL_CONTENT_TYPES.find((t) => t.value === item.contentType)?.label ??
                        item.contentType}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {item.rubric?.name ?? item.rubricSlug ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <EditorialContentStatusPill status={item.status} variant="admin" />
                    </td>
                    <td className="px-4 py-3">
                      <SeoScoreBadge score={item.seoScore} />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {item.updatedAt
                        ? new Intl.DateTimeFormat('it-IT', {
                            day: 'numeric',
                            month: 'short',
                          }).format(new Date(item.updatedAt))
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/editorial/${item.uuid}/edit`}
                          className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40"
                          title="Modifica"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handlePreview(item.uuid)}
                          disabled={previewLoading === item.uuid}
                          className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 disabled:opacity-50"
                          title="Anteprima"
                        >
                          {previewLoading === item.uuid ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </EditorialPageMotion>
  )
}
