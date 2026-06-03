import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { getLatestSearch } from '../../data/mockUserSearches'
import { fetchUserHomeWithFallback } from '../../services/userService'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const glassCard =
  'rounded-[2rem] border border-white/50 bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-xl'

function getTimeGreetingEmoji() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '🌤'
  if (hour >= 12 && hour < 18) return '👋'
  if (hour >= 18 && hour < 22) return '🌙'
  return '✨'
}

function getBeneficiaryPhrase(title) {
  if (!title) return 'chi ami'
  const lower = title.toLowerCase()
  if (lower.includes('mamma') || lower.includes('madre')) return 'tua madre'
  if (lower.includes('papà') || lower.includes('papa') || lower.includes('padre')) return 'tuo papà'
  if (lower.includes('nonna')) return 'tua nonna'
  if (lower.includes('nonno')) return 'tuo nonno'
  return 'chi ami'
}

function RadarPulse({ reducedMotion }) {
  if (reducedMotion) {
    return (
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center" aria-hidden>
        <div className="h-4 w-4 rounded-full bg-teal-800 shadow-[0_0_16px_rgba(17,94,89,0.4)]" />
      </div>
    )
  }

  return (
    <div className="relative h-20 w-20 shrink-0" aria-hidden>
      <motion.div
        className="absolute inset-0 rounded-full border border-teal-800/20 bg-teal-800/[0.06]"
        animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-teal-800/25 bg-teal-800/[0.08]"
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: 0.4 }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border border-teal-800/30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.25, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: 0.8 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-4 w-4 rounded-full bg-teal-800 shadow-[0_0_16px_rgba(17,94,89,0.45)]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
      </div>
    </div>
  )
}

function GlowingStatusPill({ label, tone = 'amber' }) {
  const tones = {
    amber: 'bg-amber-400/20 text-amber-900 ring-amber-500/25 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
    emerald: 'bg-emerald-400/20 text-emerald-900 ring-emerald-500/25 shadow-[0_0_20px_rgba(52,211,153,0.22)]',
  }

  return (
    <motion.span
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${tones[tone]}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {label}
    </motion.span>
  )
}

function StatusWidget({ reducedMotion, latest }) {
  const hoverTap = reducedMotion
    ? {}
    : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }

  if (latest?.status === 'processing') {
    const beneficiary = getBeneficiaryPhrase(latest.title)

    return (
      <motion.div
        {...hoverTap}
        transition={spring}
        className={`${glassCard} overflow-hidden p-7 sm:p-9`}
        role="status"
        aria-live="polite"
      >
        <div className="mb-6">
          <GlowingStatusPill label="Ricerca in corso" tone="amber" />
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <RadarPulse reducedMotion={reducedMotion} />

          <div className="min-w-0 flex-1 space-y-4">
            <p className="text-xl font-medium leading-snug text-slate-800 sm:text-2xl">
              Stiamo analizzando le migliori opzioni a{' '}
              <span className="font-semibold text-teal-900">{latest.location}</span> per{' '}
              {beneficiary}.
            </p>
            <p className="flex items-start gap-2.5 text-lg leading-relaxed text-slate-600">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-800/70" strokeWidth={2} />
              Le tue risposte sono al sicuro con noi.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (latest?.status === 'completed') {
    const beneficiary = getBeneficiaryPhrase(latest.title)

    return (
      <motion.div
        {...hoverTap}
        transition={spring}
        className={`${glassCard} overflow-hidden p-7 sm:p-9`}
      >
        <div className="mb-6">
          <GlowingStatusPill label="Risultati pronti" tone="emerald" />
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-100/80 to-white/60 ring-1 ring-emerald-200/50">
            <Sparkles className="h-9 w-9 text-emerald-700/90" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <p className="text-xl font-medium leading-snug text-slate-800 sm:text-2xl">
              Abbiamo trovato{' '}
              <span className="font-semibold text-teal-900">{latest.matchCount}</span> strutture
              ideali a <span className="font-semibold">{latest.location}</span> per {beneficiary}.
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              Selezionate con cura in base alle tue risposte.
            </p>
            <motion.div whileHover={reducedMotion ? undefined : { scale: 1.02 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
              <Link
                to="/user/ricerche"
                className="inline-flex min-h-[3rem] items-center gap-2 text-lg font-medium text-teal-800 transition-colors hover:text-teal-900"
              >
                Vedi le ricerche
                <ArrowRight className="h-5 w-5" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      {...hoverTap}
      transition={spring}
      className={`${glassCard} p-7 sm:p-9`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-stone-100/90 to-white/60 ring-1 ring-stone-200/50">
          <Sparkles className="h-9 w-9 text-teal-800/50" strokeWidth={1.75} />
        </div>
        <div className="space-y-3">
          <p className="text-xl font-medium leading-snug text-slate-800 sm:text-2xl">
            Benvenuto nel tuo spazio personale.
          </p>
          <p className="text-lg leading-relaxed text-slate-600">
            Avvia una nuova ricerca per trovare la soluzione più adatta a chi ami.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function UserHome() {
  const [displayName, setDisplayName] = useState('amico')
  const [latestSearch, setLatestSearch] = useState(() => getLatestSearch())
  const greetingEmoji = getTimeGreetingEmoji()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    fetchUserHomeWithFallback().then((data) => {
      if (cancelled) return
      if (data.displayName) setDisplayName(data.displayName.split(' ')[0])
      if (data.latestSearch) setLatestSearch(data.latestSearch)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const pageInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 }
  const itemInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-teal-800/[0.04] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-12 top-32 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-24 left-1/3 h-40 w-40 rounded-full bg-teal-100/40 blur-3xl" aria-hidden />

      <motion.div
        className="relative space-y-10 sm:space-y-12"
        initial={pageInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <motion.header
          initial={itemInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: prefersReducedMotion ? 0 : 0.05 }}
        >
          <p className="mb-3 text-3xl sm:text-4xl" aria-hidden>
            {greetingEmoji}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
            Ciao, {displayName}.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">
            Ecco com&apos;è andata con le tue ricerche.
          </p>
        </motion.header>

        <motion.div
          initial={itemInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: prefersReducedMotion ? 0 : 0.12 }}
        >
          <StatusWidget reducedMotion={prefersReducedMotion} latest={latestSearch} />
        </motion.div>

        <motion.div
          initial={itemInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: prefersReducedMotion ? 0 : 0.2 }}
          className="pt-2"
        >
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={spring}
            className="inline-block"
          >
            <Link
              to="/wizard"
              className="inline-flex min-h-[3.75rem] items-center gap-3 rounded-[1.75rem] bg-teal-800 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_32px_rgba(17,94,89,0.35)] transition-[box-shadow,background-color] hover:bg-teal-900 hover:shadow-[0_12px_40px_rgba(17,94,89,0.42)]"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Avvia una nuova ricerca
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
