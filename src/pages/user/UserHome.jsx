import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import { getLatestSearch, getUserDisplayName } from '../../data/mockUserSearches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.02 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: spring },
}

function StatusWidget() {
  const latest = getLatestSearch()

  if (latest?.status === 'processing') {
    return (
      <GlassCard
        hover={false}
        className="overflow-hidden rounded-3xl border-black/[0.06] bg-gradient-to-br from-amber-50/90 via-white/75 to-white/80 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100/80 to-amber-50/60 ring-1 ring-amber-200/40">
            <Sparkles className="h-5 w-5 text-amber-600/90" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-medium leading-snug text-slate-800">
              Stiamo analizzando le tue risposte per la ricerca a{' '}
              <span className="font-semibold">{latest.location}</span>…
            </p>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              Ti avviseremo entro 48 ore con le strutture più adatte.
            </p>
          </div>
        </div>
      </GlassCard>
    )
  }

  if (latest?.status === 'completed') {
    return (
      <GlassCard
        hover={false}
        className="overflow-hidden rounded-3xl border-black/[0.06] bg-gradient-to-br from-emerald-50/80 via-white/75 to-white/80 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100/70 to-emerald-50/50 ring-1 ring-emerald-200/40">
            <Sparkles className="h-5 w-5 text-emerald-600/90" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-medium leading-snug text-slate-800">
              La tua ricerca a <span className="font-semibold">{latest.location}</span> è pronta.
            </p>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              {latest.matchCount} strutture selezionate in base alle tue risposte.
            </p>
            <Link
              to="/user/ricerche"
              className="mt-4 inline-flex min-h-[3rem] items-center text-sm font-medium text-teal-800 transition-colors hover:text-teal-900"
            >
              Vedi le ricerche →
            </Link>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard
      hover={false}
      className="rounded-3xl border-black/[0.06] bg-gradient-to-br from-stone-50/90 via-white/75 to-white/80 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <p className="text-base font-medium leading-snug text-slate-800">
        Benvenuto nel tuo spazio personale.
      </p>
      <p className="mt-2 text-base leading-relaxed text-slate-600">
        Avvia una nuova ricerca per trovare la soluzione più adatta a chi ami.
      </p>
    </GlassCard>
  )
}

export default function UserHome() {
  const name = getUserDisplayName()
  const prefersReducedMotion = useReducedMotion()
  const motionVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : stagger
  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : fadeUp

  return (
    <motion.div
      className="space-y-8"
      variants={motionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Ciao, {name}.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Ecco com&apos;è andata con le tue ricerche.
        </p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <StatusWidget />
      </motion.div>

      <motion.div variants={itemVariants} className="pt-1">
        <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }} transition={spring}>
          <Link
            to="/wizard"
            className="inline-flex min-h-[3rem] items-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(17,94,89,0.22)] transition-[box-shadow,background-color] hover:bg-teal-900 hover:shadow-[0_6px_24px_rgba(17,94,89,0.28)]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nuova Ricerca
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
