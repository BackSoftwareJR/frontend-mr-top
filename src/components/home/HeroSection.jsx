import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeartHandshake, Sparkles } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import BentoSteps from './BentoSteps'
import StructuresCarousel from './StructuresCarousel'
import TestimonialsSection from './TestimonialsSection'
import StatsSection from './StatsSection'
import TrustPartnersSection from './TrustPartnersSection'
import FAQSection from './FAQSection'
import AuroraBackground from '../layout/AuroraBackground'

const HEADLINE_WORDS = [
  { text: 'La', color: 'text-slate-800' },
  { text: 'guida', color: 'text-[#E07A5F]' },
  { text: 'sicura', color: 'text-[#9B8EC4]' },
  { text: 'per', color: 'text-slate-800' },
  { text: 'chi', color: 'text-slate-800' },
  { text: 'ami.', color: 'text-[#5CB8A8]' },
]

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.08 + 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E07A5F]/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl"
      >
        <HeartHandshake className="h-4 w-4 text-[#E07A5F]" strokeWidth={2} />
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          CareAdvisor
        </span>
        <Sparkles className="h-3.5 w-3.5 text-[#E9A84A]" strokeWidth={2} />
      </motion.div>

      <motion.h1
        className="mb-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        initial="hidden"
        animate="visible"
      >
        {HEADLINE_WORDS.map((word, i) => (
          <motion.span
            key={`${word.text}-${i}`}
            custom={i}
            variants={wordVariants}
            className={`inline-block mr-[0.25em] ${word.color}`}
          >
            {word.text}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-12 max-w-2xl text-lg font-medium text-slate-600 sm:text-xl md:text-2xl"
      >
        L&apos;intelligenza di un algoritmo, l&apos;empatia di un concierge.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <MagneticButton to="/wizard">Inizia l&apos;analisi gratuita</MagneticButton>
      </motion.div>

      <BentoSteps />
    </section>
  )
}

export function HomePageContent() {
  return (
    <>
      <AuroraBackground />
      <div className="relative z-10">
        <HomeNav />
        <HeroSection />
        <StatsSection />
        <StructuresCarousel />
        <TestimonialsSection />
        <TrustPartnersSection />
        <FAQSection />
        <HomeFooter />
      </div>
    </>
  )
}

function HomeNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-2xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#E9A84A]">
            <HeartHandshake className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-slate-800">CareAdvisor</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden text-xs font-semibold text-slate-500 transition-colors hover:text-[#E07A5F] sm:block"
          >
            Area B2B
          </Link>
          <MagneticButton to="/wizard" className="!px-5 !py-2.5 !text-sm">
            Inizia ora
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  )
}

function HomeFooter() {
  return (
    <footer className="border-t border-slate-200/60 px-6 py-12 text-center">
      <p className="text-sm text-slate-500">
        © 2026 CareAdvisor — Con cura, per chi ami.
      </p>
    </footer>
  )
}
