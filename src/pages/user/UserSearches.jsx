import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Ticket,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import SearchTitleInlineEdit from '../../components/user/SearchTitleInlineEdit'
import UserLoadError from '../../components/user/UserLoadError'
import { ApiError, isApiConfigured } from '../../services/apiClient'
import { fetchUserSearchesWithFallback } from '../../services/userService'
import { searchDetailPath } from '../../utils/userSearchPaths'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring, staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring },
}

const STATUS_CONFIG = {
  completed: {
    label: 'Risultati Pronti',
    icon: CheckCircle2,
    badgeClass:
      'bg-emerald-500/[0.1] text-emerald-800 ring-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    dotClass: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    lineClass: 'from-emerald-400/40',
  },
  processing: {
    label: 'In elaborazione',
    icon: Loader2,
    badgeClass: 'bg-amber-500/[0.1] text-amber-900 ring-amber-500/20',
    dotClass: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]',
    lineClass: 'from-amber-300/30',
  },
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.processing
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  const Icon = config.icon
  const isProcessing = status === 'processing'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.15 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide ring-1 ${config.badgeClass}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`}
        strokeWidth={2.25}
        aria-hidden
      />
      {config.label}
    </motion.span>
  )
}


function TicketCard({ search, onOpen, onRename, index, isLast, pageOffset = 0 }) {
  const prefersReducedMotion = useReducedMotion()
  const config = getStatusConfig(search.status)
  const isReady = search.status === 'completed'
  const ctaLabel =
    search.matchCount > 0
      ? `Vedi le ${search.matchCount} Strutture`
      : 'Vedi i risultati'

  const handleOpen = () => onOpen(search)

  return (
    <motion.li variants={itemVariants} className="relative flex gap-5 sm:gap-6">
      {/* Timeline rail */}
      <div className="relative flex w-8 shrink-0 flex-col items-center pt-6">
        <motion.div
          initial={prefersReducedMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: index * 0.08 + 0.1 }}
          className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full ${config.dotClass}`}
        >
          {isReady && (
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400/40"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
        {!isLast && (
          <div
            className={`absolute top-8 h-[calc(100%+0.5rem)] w-px bg-gradient-to-b ${config.lineClass} to-transparent`}
            aria-hidden
          />
        )}
      </div>

      {/* Ticket card */}
      <motion.div
        className="min-w-0 flex-1 pb-8"
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        transition={spring}
      >
        <GlassCard
          hover={!isReady}
          className={`relative overflow-hidden rounded-[2rem] border bg-white/70 p-0 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-shadow ${
            isReady
              ? 'border-emerald-400/50 shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_8px_32px_rgba(16,185,129,0.12),0_0_40px_rgba(16,185,129,0.08)]'
              : 'border-black/[0.06]'
          }`}
        >
          {/* Ticket perforation accent */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 hidden h-6 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.04] bg-[#FDFBF7] sm:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-1/2 hidden h-6 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.04] bg-[#FDFBF7] sm:block"
            aria-hidden
          />

          <div className="relative p-5 sm:p-6">
            {/* Ticket header strip */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isReady
                      ? 'bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 ring-1 ring-emerald-200/50'
                      : 'bg-gradient-to-br from-amber-100/70 to-amber-50/50 ring-1 ring-amber-200/40'
                  }`}
                >
                  {isReady ? (
                    <Sparkles className="h-4 w-4 text-emerald-600/90" strokeWidth={2} />
                  ) : (
                    <Search className="h-4 w-4 text-amber-600/90" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Ricerca #{pageOffset + index + 1}
                  </p>
                  <div className="mt-1">
                    <SearchTitleInlineEdit
                      search={search}
                      fallbackLabel={`Ricerca #${pageOffset + index + 1}`}
                      onRenamed={(updated) => onRename(search.id, updated)}
                    />
                  </div>
                </div>
              </div>
              <Ticket
                className={`h-5 w-5 shrink-0 ${isReady ? 'text-emerald-400/60' : 'text-slate-300/80'}`}
                strokeWidth={1.75}
                aria-hidden
              />
            </div>

            {/* Meta row */}
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                {search.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                {search.location}
              </span>
            </div>

            {/* Dashed ticket divider */}
            <div
              className="mb-4 border-t border-dashed border-black/[0.08]"
              aria-hidden
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <StatusBadge status={search.status} />

              {isReady ? (
                <motion.button
                  type="button"
                  onClick={handleOpen}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  transition={spring}
                  className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35),0_0_24px_rgba(16,185,129,0.15)] transition-shadow hover:shadow-[0_6px_28px_rgba(16,185,129,0.45),0_0_32px_rgba(16,185,129,0.2)] sm:w-auto"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleOpen}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  transition={spring}
                  className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-[2rem] border border-black/[0.08] bg-white/60 px-5 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-stone-50/80 sm:w-auto"
                >
                  <Clock className="h-4 w-4 text-amber-600/80" strokeWidth={2} aria-hidden />
                  Torna alla home
                </motion.button>
              )}
            </div>
          </div>

          {isReady && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
              animate={prefersReducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          )}
        </GlassCard>
      </motion.div>
    </motion.li>
  )
}

function EmptyState() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div variants={itemVariants}>
      <GlassCard
        hover={false}
        className="rounded-[2rem] border-black/[0.06] bg-white/70 p-8 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-10"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-800/[0.06] ring-1 ring-teal-800/10">
          <Search className="h-6 w-6 text-teal-800/50" strokeWidth={2} />
        </div>
        <p className="text-lg font-semibold text-slate-800">Nessuna ricerca ancora</p>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Avvia il questionario per trovare la struttura più adatta.
        </p>
        <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }} transition={spring}>
          <Link
            to="/wizard"
            className="mt-6 inline-flex min-h-[3rem] items-center gap-2 rounded-[2rem] bg-teal-800 px-6 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(17,94,89,0.22)] transition-colors hover:bg-teal-900"
          >
            Nuova Ricerca
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}

export default function UserSearches() {
  const navigate = useNavigate()
  const [searches, setSearches] = useState([])
  const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0, lastPage: 1 })
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) {
        setLoading(true)
        setLoadError(null)
      }
      try {
        const { searches: data, meta } = await fetchUserSearchesWithFallback(pagination.page)
        if (cancelled) return
        setSearches(data)
        setPagination(meta)
      } catch (err) {
        if (!cancelled && isApiConfigured()) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare le ricerche. Verifica la connessione e riprova.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pagination.page, retryCount])

  const motionVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : pageVariants

  const childVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : itemVariants

  const handleOpen = (search) => {
    navigate(searchDetailPath(search))
  }

  const handleRename = (searchId, updatedSearch) => {
    setSearches((current) =>
      current.map((item) => (item.id === searchId ? { ...item, ...updatedSearch } : item)),
    )
  }

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.lastPage || nextPage === pagination.page) return
    setPagination((current) => ({ ...current, page: nextPage }))
  }

  const pageOffset = (pagination.page - 1) * pagination.perPage
  const showPagination = pagination.lastPage > 1

  return (
    <motion.div
      className="space-y-8"
      variants={motionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={childVariants}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800/[0.07] ring-1 ring-teal-800/10">
            <Search className="h-5 w-5 text-teal-800/70" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
              Le Mie Ricerche
            </h1>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              Il percorso delle tue analisi, passo dopo passo.
            </p>
          </div>
        </div>
      </motion.header>

      {loadError && !loading ? (
        <UserLoadError message={loadError} onRetry={() => setRetryCount((n) => n + 1)} />
      ) : loading ? (
        <p className="text-center text-sm text-slate-500">Caricamento ricerche…</p>
      ) : searches.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.ol
          variants={motionVariants}
          className="relative m-0 list-none p-0"
          aria-label="Timeline delle ricerche"
        >
          {searches.map((search, index) => (
            <TicketCard
              key={search.id}
              search={search}
              onOpen={handleOpen}
              onRename={handleRename}
              index={index}
              pageOffset={pageOffset}
              isLast={index === searches.length - 1}
            />
          ))}
        </motion.ol>
      )}

      {showPagination && (
        <motion.nav
          variants={childVariants}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
          aria-label="Paginazione ricerche"
        >
          <p className="text-sm text-slate-500">
            Pagina {pagination.page} di {pagination.lastPage}
            {' · '}
            {pagination.total}{' '}
            {pagination.total === 1 ? 'ricerca' : 'ricerche'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-[2rem] border border-black/[0.08] bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-stone-50/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              Precedente
            </button>
            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.lastPage || loading}
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-[2rem] border border-black/[0.08] bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-stone-50/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Successiva
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </motion.nav>
      )}

      {searches.length > 0 && !showPagination && (
        <motion.p
          variants={childVariants}
          className="px-1 text-center text-sm text-slate-500"
        >
          {pagination.total}{' '}
          {pagination.total === 1 ? 'ricerca nel tuo archivio' : 'ricerche nel tuo archivio'}
        </motion.p>
      )}
    </motion.div>
  )
}
