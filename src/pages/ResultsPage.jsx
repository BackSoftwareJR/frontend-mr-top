import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, X as XIcon } from 'lucide-react'
import AuroraBackground from '../components/layout/AuroraBackground'
import SectionBlob from '../components/ui/SectionBlob'
import GlassCard from '../components/ui/GlassCard'
import MatchCard from '../components/results/MatchCard'
import MatchDetailsDrawer from '../components/results/MatchDetailsDrawer'
import AdvisorCard from '../components/results/AdvisorCard'
import BookingSheet from '../components/results/BookingSheet'
import { WenandoMark } from '../components/ui/WenandoLogo'
import {
  getDiagnosis,
  careComparison,
  autonomyLabels,
} from '../data/autonomyInfo'
import { getMatchesForLocation, mockAdvisor } from '../data/mockMatches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
}

function ComparisonTable({ primaryColumn }) {
  const { domiciliare, rsa } = careComparison
  const highlightDomiciliare = primaryColumn === 'domiciliare'
  const highlightRsa = primaryColumn === 'rsa'

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/40" role="region" aria-label="Confronto assistenza domiciliare e RSA">
      <div className="grid grid-cols-2 border-b border-slate-200/50" role="row">
        <div
          role="columnheader"
          className={`px-4 py-3.5 sm:px-5 ${
            highlightDomiciliare ? 'bg-teal-800/[0.04]' : 'bg-slate-50/60'
          }`}
        >
          <span className="text-xs font-semibold tracking-wide text-teal-800">
            {domiciliare.label}
          </span>
          {highlightDomiciliare && (
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-teal-800/70">
              Consigliato
            </span>
          )}
        </div>
        <div
          role="columnheader"
          className={`border-l border-slate-200/50 px-4 py-3.5 sm:px-5 ${
            highlightRsa ? 'bg-teal-800/[0.04]' : 'bg-slate-50/60'
          }`}
        >
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            {rsa.label}
          </span>
          {highlightRsa && (
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-teal-800/70">
              Consigliato
            </span>
          )}
        </div>
      </div>

      <ComparisonBlock
        label="Vantaggi"
        left={domiciliare.pros}
        right={rsa.pros}
        positive
      />
      <ComparisonBlock
        label="Da considerare"
        left={domiciliare.cons}
        right={rsa.cons}
      />
    </div>
  )
}

function ComparisonBlock({ label, left, right, positive = false }) {
  const Icon = positive ? Check : XIcon
  const iconClass = positive ? 'text-emerald-500' : 'text-slate-400'

  return (
    <div className="border-t border-slate-200/50">
      <div className="bg-slate-50/40 px-4 py-2 sm:px-5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <ComparisonCell items={left} Icon={Icon} iconClass={iconClass} />
        <ComparisonCell items={right} Icon={Icon} iconClass={iconClass} bordered />
      </div>
    </div>
  )
}

function ComparisonCell({ items, Icon, iconClass, bordered = false }) {
  return (
    <ul
      className={`space-y-2.5 px-4 py-4 sm:px-5 ${
        bordered ? 'border-l border-slate-200/50' : ''
      }`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconClass}`} strokeWidth={2.5} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const answers = location.state?.answers
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  if (!answers?.autonomy) {
    return <Navigate to="/wizard" replace />
  }

  const diagnosis = getDiagnosis(answers.autonomy)
  const autonomyLabel = autonomyLabels[answers.autonomy] || answers.autonomy
  const locationLabel = answers.location?.label || 'la tua zona'
  const matches = getMatchesForLocation(locationLabel)
  const primaryColumn =
    diagnosis.primary === 'RSA' ? 'rsa' : 'domiciliare'
  const userName = answers.contact?.nome || ''

  const openDetails = (match) => {
    setSelectedMatch(match)
    setDetailsOpen(true)
  }

  const closeDetails = () => {
    setDetailsOpen(false)
  }

  const motionContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants

  const motionSectionVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : sectionVariants

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#FDFBF7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link
            to="/user/ricerche"
            className="inline-flex min-h-[3rem] items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Le tue ricerche</span>
          </Link>
          <Link to="/user/home" aria-label="Area personale Wenando" className="shrink-0">
            <WenandoMark className="h-8 w-8" />
          </Link>
          <Link
            to="/wizard"
            className="inline-flex min-h-[3rem] items-center px-1 text-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
          >
            Modifica
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : spring}
          className="mb-14 sm:mb-16"
        >
          <p className="mb-2 text-sm font-medium tracking-wide text-teal-800">
            Piano personalizzato · {locationLabel}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-[2rem] sm:leading-tight">
            Ecco il piano per te.
          </h1>
        </motion.div>

        <motion.div
          variants={motionContainerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="space-y-16 sm:space-y-20"
        >
          {/* Section A: Educational Diagnosis */}
          <motion.section variants={motionSectionVariants}>
            <GlassCard
              hover={false}
              className="border-white/20 bg-white/70 p-6 shadow-none sm:p-9"
            >
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-800">
                La nostra analisi
              </div>
              <h2 className="mb-4 max-w-2xl text-lg font-semibold leading-snug text-slate-800 sm:text-xl">
                Per un&apos;autonomia {autonomyLabel.toLowerCase()}, consigliamo{' '}
                <span className="text-teal-800">{diagnosis.recommendation}</span>.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                {diagnosis.summary}
              </p>

              <ComparisonTable primaryColumn={primaryColumn} />

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-teal-800/20 bg-teal-800/[0.06] px-3 py-1 text-xs font-medium text-teal-800">
                  Consigliato: {diagnosis.primary}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1 text-xs font-medium text-slate-500">
                  Alternativa: {diagnosis.secondary}
                </span>
              </div>
            </GlassCard>
          </motion.section>

          {/* Section B: Matches */}
          <motion.section variants={motionSectionVariants}>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                  Le migliori opzioni
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Selezionate in base alle tue risposte
                </p>
              </div>
              <span className="hidden shrink-0 text-xs font-medium text-slate-400 sm:block">
                Top {matches.length}
              </span>
            </div>

            <div
              className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
              role="list"
              aria-label={`${matches.length} opzioni consigliate`}
            >
              {matches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  onDetails={openDetails}
                />
              ))}
            </div>
          </motion.section>

          {/* Section C: Peer Consultant */}
          <motion.section variants={motionSectionVariants}>
            <div className="mb-7">
              <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                Un consulente che capisce
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Parla con qualcuno che ha già affrontato questa scelta.
              </p>
            </div>

            <AdvisorCard
              advisor={mockAdvisor}
              onBookCall={() => setBookingOpen(true)}
            />
          </motion.section>
        </motion.div>
      </main>

      <MatchDetailsDrawer
        match={selectedMatch}
        open={detailsOpen}
        onClose={closeDetails}
      />

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultName={userName}
        advisorName={mockAdvisor.name}
      />
    </div>
  )
}
