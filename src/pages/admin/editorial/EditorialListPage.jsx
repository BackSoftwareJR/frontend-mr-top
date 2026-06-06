import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Loader2, Pencil, Plus, Search } from 'lucide-react'
import {
  EDITORIAL_CONTENT_STATUSES,
  EDITORIAL_CONTENT_TYPES,
  EDITORIAL_STATUS_COLORS,
  generatePreviewToken,
  listContents,
} from '../../services/adminEditorialService'
import { fetchEditorialRubrics } from '../../services/editorialService'
import { ApiError, isApiConfigured } from '../../services/apiClient'
import AdminLoadError from '../../components/admin/AdminLoadError'
import EditorialSubNav from '../../components/admin/editorial/EditorialSubNav'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

function StatusBadge({ status }) {
  const label = EDITORIAL_CONTENT_STATUSES.find((s) => s.value === status)?.label ?? status

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
        EDITORIAL_STATUS_COLORS[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
      }`}
    >
      {label}
    </span>
  )
}

function SeoScoreBadge({ score }) {
  if (score == null) {
    return <span className="text-xs text-zinc-600">—</span>
  }

  const color =
    score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'

  return <span className={`text-sm font-semibold tabular-nums ${color}`}>{score}</span>
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={adminPageTitle}>Editoriale</h1>
          <p className={adminPageSubtitle}>
            Gestisci articoli, storie e contenuti magazine Wenando
          </p>
        </div>
        <Link
          to="/admin/editorial/new"
          className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25"
        >
          <Plus className="h-4 w-4" />
          Nuovo contenuto
        </Link>
      </div>

      <EditorialSubNav />

      <div className={`${adminGlassCard} p-4`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Cerca per titolo…"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white focus:border-accent-coral/40 focus:outline-none"
          >
            <option value="">Tutti gli stati</option>
            {EDITORIAL_CONTENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white focus:border-accent-coral/40 focus:outline-none"
          >
            <option value="">Tutti i tipi</option>
            {EDITORIAL_CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filters.rubricId}
            onChange={(e) => setFilters((f) => ({ ...f, rubricId: e.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white focus:border-accent-coral/40 focus:outline-none"
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
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
        </div>
      ) : loadError ? null : (
        <div className={`${adminGlassCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
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
                {contents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      Nessun contenuto trovato
                    </td>
                  </tr>
                ) : (
                  contents.map((item) => (
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
                        <StatusBadge status={item.status} />
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
                            className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral"
                            title="Modifica"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handlePreview(item.uuid)}
                            disabled={previewLoading === item.uuid}
                            className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral disabled:opacity-50"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
