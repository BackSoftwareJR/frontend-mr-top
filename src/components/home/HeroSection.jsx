import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import MagneticButton from '../ui/MagneticButton'
import MulticolorHeading from '../ui/MulticolorHeading'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'
import BentoSteps from './BentoSteps'
import StatsSection from './StatsSection'
import PersonalizedAnalysisSection from './PersonalizedAnalysisSection'
import TestimonialsSection from './TestimonialsSection'
import TrustPartnersSection from './TrustPartnersSection'
import FAQSection from './FAQSection'
import CTASection from './CTASection'
import AuroraBackground from '../layout/AuroraBackground'
import SectionBlob from '../ui/SectionBlob'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-x-clip px-6 pb-16 pt-32 text-center sm:min-h-screen sm:pb-20">
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <MulticolorHeading
        as="h1"
        words="La guida sicura per chi ami."
        className="relative z-10 mb-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        startIndex={0}
        neutralWords={[0, 3, 4]}
        trigger="mount"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl md:text-2xl"
      >
        Non un catalogo di strutture — un&apos;analisi personalizzata della{' '}
        <span className="font-semibold text-[#E07A5F]">vostra</span> situazione,
        con l&apos;empatia di chi vi ascolta davvero.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10"
      >
        <MagneticButton to="/wizard">Inizia l&apos;analisi gratuita</MagneticButton>
      </motion.div>

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
        <BentoSteps />
        <StatsSection />
        <PersonalizedAnalysisSection />
        <TestimonialsSection />
        <TrustPartnersSection />
        <FAQSection />
        <CTASection />
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
      <nav className="flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-2xl">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <WenandoMark className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
          <WenandoLogo size="nav" className="min-w-0" />
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
        © 2026 Wenando — Con cura, per chi ami.
      </p>
    </footer>
  )
}
