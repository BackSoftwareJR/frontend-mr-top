import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'
import {
  approveSeo,
  getSeo,
  regenerateSeo,
  rejectSeo,
} from '../../../services/adminEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import { adminGlassCard } from '../adminStyles'
import {
  buildBlockSeoChecklist,
  findLayoutBlocksWithMissingSlots,
  getSeoScoreBadgeClass,
  isSeoApproved,
  SEO_BREAKDOWN_LABELS,
  SEO_MIN_SCORE,
} from './seoUtils'

const inputClass =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

const textareaClass = `${inputClass} min-h-[72px] resize-y`

const GENERATION_STATUS_LABELS = {
  pending: 'In attesa',
  approved: 'Approvato',
  rejected: 'Rifiutato',
}

/** @param {Record<string, unknown> | null | undefined} pack */
function emptyOverridesFromPack(pack) {
  return {
    seo_title: pack?.seo_title ?? '',
    seo_description: pack?.seo_description ?? '',
    excerpt: pack?.excerpt ?? '',
    og_title: pack?.og_title ?? '',
    og_description: pack?.og_description ?? '',
    primary_keyword: pack?.primary_keyword ?? '',
    secondary_keywords: Array.isArray(pack?.secondary_keywords)
      ? pack.secondary_keywords.join(', ')
      : '',
    suggested_tags: Array.isArray(pack?.suggested_tags) ? pack.suggested_tags.join(', ') : '',
  }
}

/** @param {string} raw */
function parseKeywordList(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function RejectNoteModal({ open, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('')

  if (!open) return null

  const handleClose = () => {
    setNote('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Chiudi"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-seo-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-xl"
      >
        <h4 id="reject-seo-title" className="text-sm font-semibold text-white">
          Rifiuta generazione SEO
        </h4>
        <p className="mt-1 text-xs text-zinc-500">
          Opzionale: indica cosa migliorare prima di rigenerare.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Es. titolo troppo generico, manca keyword principale…"
          className={`${textareaClass} mt-3`}
          rows={4}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(note.trim() || null)
              setNote('')
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Conferma rifiuto
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
      {children}
      {hint ? <span className="ml-1 font-normal normal-case text-zinc-600">({hint})</span> : null}
    </label>
  )
}

function TagList({ tags }) {
  if (!tags?.length) {
    return <span className="text-xs text-zinc-600">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-300"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

/**
 * @param {{
 *   uuid: string,
 *   contentSeoPack?: Record<string, unknown> | null,
 *   bodyBlocks?: Array<{ type: string, data?: Record<string, unknown> }>,
 *   contentType?: string,
 *   rubricSlug?: string,
 *   onApproved?: (content: Record<string, unknown>) => void,
 * }} props
 */
export default function SeoReviewPanel({
  uuid,
  contentSeoPack,
  bodyBlocks = [],
  contentType = 'article',
  rubricSlug,
  onApproved,
}) {
  const [seoData, setSeoData] = useState(null)
  const [loading, setLoading] = useState(Boolean(uuid && isApiConfigured()))
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [overrides, setOverrides] = useState(emptyOverridesFromPack(null))

  const latest = seoData?.latest ?? null
  const historyCount = seoData?.history?.length ?? 0
  const basePack = useMemo(() => latest?.seoPack ?? {}, [latest?.seoPack])
  const score = latest?.score ?? basePack.seo_score ?? null
  const generationStatus = latest?.status ?? null
  const contentApproved = isSeoApproved(contentSeoPack ?? seoData?.contentSeoPack)

  const mergedPack = useMemo(
    () => ({
      ...basePack,
      seo_title: overrides.seo_title,
      seo_description: overrides.seo_description,
      excerpt: overrides.excerpt,
      og_title: overrides.og_title,
      og_description: overrides.og_description,
      primary_keyword: overrides.primary_keyword,
      secondary_keywords: parseKeywordList(overrides.secondary_keywords),
      suggested_tags: parseKeywordList(overrides.suggested_tags),
    }),
    [basePack, overrides],
  )

  const faqItems = basePack?.json_ld_hints?.faq_items
  const breakdown = basePack?.seo_score_breakdown ?? {}
  const canReview = generationStatus === 'pending' && !contentApproved
  const scoreTooLow = score != null && score < SEO_MIN_SCORE

  const blockChecklist = useMemo(
    () => buildBlockSeoChecklist(bodyBlocks, { contentType, rubricSlug }),
    [bodyBlocks, contentType, rubricSlug],
  )
  const layoutIssues = useMemo(() => findLayoutBlocksWithMissingSlots(bodyBlocks), [bodyBlocks])
  const faqCheck = blockChecklist.find((item) => item.id === 'faq')
  const showFaqBanner = faqCheck?.warn

  const loadSeo = useCallback(async () => {
    if (!uuid || !isApiConfigured()) return

    setLoading(true)
    setError(null)

    try {
      const data = await getSeo(uuid)
      setSeoData(data)
      const pack = data.latest?.seoPack ?? null
      setOverrides(emptyOverridesFromPack(pack))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossibile caricare i dati SEO.')
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    if (!uuid || !isApiConfigured()) return undefined

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getSeo(uuid)
        if (cancelled) return
        setSeoData(data)
        const pack = data.latest?.seoPack ?? null
        setOverrides(emptyOverridesFromPack(pack))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Impossibile caricare i dati SEO.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [uuid])

  const handleRegenerate = async () => {
    setRegenerating(true)
    setActionError(null)

    try {
      const result = await regenerateSeo(uuid)
      const generation = result.generation
      setSeoData((prev) => ({
        ...prev,
        latest: generation,
        history: generation
          ? [generation, ...(prev?.history ?? []).filter((g) => g.id !== generation.id)]
          : prev?.history ?? [],
      }))
      setOverrides(emptyOverridesFromPack(generation?.seoPack))
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Errore durante la rigenerazione SEO.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!latest?.id) return

    setApproving(true)
    setActionError(null)

    try {
      const manualOverrides = {}
      const fields = [
        'seo_title',
        'seo_description',
        'excerpt',
        'og_title',
        'og_description',
        'primary_keyword',
      ]

      for (const field of fields) {
        const original = basePack[field] ?? ''
        const edited = overrides[field] ?? ''
        if (String(edited) !== String(original)) {
          manualOverrides[field] = edited
        }
      }

      const origSecondary = (basePack.secondary_keywords ?? []).join(', ')
      const origTags = (basePack.suggested_tags ?? []).join(', ')
      if (overrides.secondary_keywords !== origSecondary) {
        manualOverrides.secondary_keywords = parseKeywordList(overrides.secondary_keywords)
      }
      if (overrides.suggested_tags !== origTags) {
        manualOverrides.suggested_tags = parseKeywordList(overrides.suggested_tags)
      }

      const result = await approveSeo(uuid, {
        generationId: latest.id,
        manualOverrides: Object.keys(manualOverrides).length > 0 ? manualOverrides : undefined,
        seoPack: mergedPack,
      })

      if (result.content) {
        onApproved?.(result.content)
      }

      loadSeo()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Errore durante l’approvazione SEO.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async (note) => {
    if (!latest?.id) return

    setRejecting(true)
    setActionError(null)

    try {
      const result = await rejectSeo(uuid, { note, generationId: latest.id })
      setSeoData((prev) => ({
        ...prev,
        latest: result.generation ?? prev?.latest,
      }))
      setRejectModalOpen(false)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Errore durante il rifiuto SEO.')
    } finally {
      setRejecting(false)
    }
  }

  const setOverride = (field, value) => {
    setOverrides((prev) => ({ ...prev, [field]: value }))
  }

  if (!uuid) {
    return (
      <div className={`${adminGlassCard} p-4`}>
        <h3 className="text-sm font-semibold text-white">SEO</h3>
        <p className="mt-3 text-xs text-zinc-500">Salva la bozza per generare e approvare il pacchetto SEO.</p>
      </div>
    )
  }

  return (
    <>
      <div className={`${adminGlassCard} p-4`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">SEO</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              {historyCount > 0
                ? `${historyCount} generazion${historyCount === 1 ? 'e' : 'i'}`
                : 'Nessuna generazione'}
              {seoData?.groqConfigured === false ? ' · fallback locale' : ''}
            </p>
          </div>
          {score != null ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${getSeoScoreBadgeClass(score)}`}
            >
              {score}
            </span>
          ) : null}
        </div>

        {showFaqBanner ? (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <p>
              Manca una sezione FAQ compilata. Per guide e articoli SEO, aggiungi il layout
              &quot;Domande frequenti&quot; prima di inviare in revisione.
            </p>
          </div>
        ) : null}

        {bodyBlocks.length > 0 ? (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Checklist contenuto
            </p>
            <ul className="mt-2 space-y-1.5">
              {blockChecklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-xs">
                  {item.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                  <span className={item.ok ? 'text-zinc-300' : 'text-amber-300'}>
                    {item.label}
                    <span className="ml-1 text-zinc-500">— {item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {layoutIssues.length > 0 ? (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-400">
              Slot layout da completare
            </p>
            <ul className="mt-2 space-y-2">
              {layoutIssues.map((issue) => (
                <li key={issue.templateId} className="text-xs text-amber-200/90">
                  <span className="font-medium text-amber-100">{issue.templateLabel}</span>
                  <span className="text-amber-300/70">
                    {' '}
                    — {issue.missing.slice(0, 3).join(', ')}
                    {issue.missing.length > 3 ? ` +${issue.missing.length - 3}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {contentApproved ? (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            SEO approvato — pronto per la pubblicazione
          </div>
        ) : generationStatus ? (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Stato generazione: {GENERATION_STATUS_LABELS[generationStatus] ?? generationStatus}
            {scoreTooLow ? ` · punteggio minimo ${SEO_MIN_SCORE}` : ''}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-white/10 bg-zinc-950/40 px-3 py-4 text-center text-xs text-zinc-600">
            Invia in revisione o rigenera per creare un pacchetto SEO
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-accent-coral" />
          </div>
        ) : error ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-red-400">{error}</p>
            <button
              type="button"
              onClick={loadSeo}
              className="text-xs text-accent-coral hover:underline"
            >
              Riprova
            </button>
          </div>
        ) : latest ? (
          <div className="mt-4 space-y-3">
            <div>
              <FieldLabel htmlFor="seo-title">SEO title</FieldLabel>
              <input
                id="seo-title"
                type="text"
                value={overrides.seo_title}
                onChange={(e) => setOverride('seo_title', e.target.value)}
                disabled={!canReview}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="seo-description">SEO description</FieldLabel>
              <textarea
                id="seo-description"
                value={overrides.seo_description}
                onChange={(e) => setOverride('seo_description', e.target.value)}
                disabled={!canReview}
                className={textareaClass}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel htmlFor="seo-excerpt" hint="GEO / citazione AI">
                Excerpt
              </FieldLabel>
              <textarea
                id="seo-excerpt"
                value={overrides.excerpt}
                onChange={(e) => setOverride('excerpt', e.target.value)}
                disabled={!canReview}
                className={textareaClass}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel htmlFor="og-title">OG title</FieldLabel>
              <input
                id="og-title"
                type="text"
                value={overrides.og_title}
                onChange={(e) => setOverride('og_title', e.target.value)}
                disabled={!canReview}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="og-description">OG description</FieldLabel>
              <textarea
                id="og-description"
                value={overrides.og_description}
                onChange={(e) => setOverride('og_description', e.target.value)}
                disabled={!canReview}
                className={textareaClass}
                rows={2}
              />
            </div>

            <div>
              <FieldLabel htmlFor="primary-keyword">Keyword principale</FieldLabel>
              <input
                id="primary-keyword"
                type="text"
                value={overrides.primary_keyword}
                onChange={(e) => setOverride('primary_keyword', e.target.value)}
                disabled={!canReview}
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="secondary-keywords">Keyword secondarie</FieldLabel>
              <input
                id="secondary-keywords"
                type="text"
                value={overrides.secondary_keywords}
                onChange={(e) => setOverride('secondary_keywords', e.target.value)}
                disabled={!canReview}
                placeholder="Separate da virgola"
                className={inputClass}
              />
              {!canReview && mergedPack.secondary_keywords?.length ? (
                <div className="mt-1.5">
                  <TagList tags={mergedPack.secondary_keywords} />
                </div>
              ) : null}
            </div>

            <div>
              <FieldLabel htmlFor="suggested-tags">Tag suggeriti</FieldLabel>
              {canReview ? (
                <input
                  id="suggested-tags"
                  type="text"
                  value={overrides.suggested_tags}
                  onChange={(e) => setOverride('suggested_tags', e.target.value)}
                  placeholder="Separate da virgola"
                  className={inputClass}
                />
              ) : (
                <TagList tags={mergedPack.suggested_tags} />
              )}
            </div>

            {Array.isArray(faqItems) && faqItems.length > 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  FAQ schema ({faqItems.length})
                </p>
                <ul className="mt-2 space-y-1.5">
                  {faqItems.slice(0, 4).map((item, index) => (
                    <li key={index} className="text-xs text-zinc-400">
                      <span className="text-zinc-300">{item.question ?? item.q ?? '—'}</span>
                    </li>
                  ))}
                  {faqItems.length > 4 ? (
                    <li className="text-[11px] text-zinc-600">+{faqItems.length - 4} altre</li>
                  ) : null}
                </ul>
              </div>
            ) : basePack?.json_ld_hints?.schema_type ? (
              <p className="text-[11px] text-zinc-600">
                Schema: {basePack.json_ld_hints.schema_type}
              </p>
            ) : null}

            {Object.keys(breakdown).length > 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  Breakdown punteggio
                </p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(breakdown).map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{SEO_BREAKDOWN_LABELS[key] ?? key}</span>
                      <span className="font-medium tabular-nums text-zinc-300">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {actionError ? (
              <p className="text-xs text-red-400">{actionError}</p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating || approving || rejecting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                {regenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Rigenera
              </button>
              {canReview ? (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={regenerating || approving || rejecting || scoreTooLow}
                    title={scoreTooLow ? `Punteggio minimo ${SEO_MIN_SCORE} richiesto` : undefined}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    {approving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Approva
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={regenerating || approving || rejecting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rifiuta
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <RejectNoteModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        loading={rejecting}
      />
    </>
  )
}
