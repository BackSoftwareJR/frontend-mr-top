import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../../utils/performanceTier'
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

const HomeNavDesktop = lazy(() => import('./HomeNavDesktop'))
const HeroSectionDesktop = lazy(() => import('./HeroSectionDesktop'))

function HomeNavLinks() {
  return (
    <>
      <Link
        to="/"
        className="flex min-w-0 items-center gap-1 overflow-visible sm:gap-1.5"
      >
        <WenandoMark className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
        <WenandoLogo size="nav" className="min-w-0 overflow-visible" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/dashboard"
          className="hidden text-xs font-semibold text-slate-500 transition-colors hover:text-[#E07A5F] sm:block"
        >
          Area B2B
        </Link>
        <MagneticButton to="/wizard" variant="outline-coral" className="!px-4 !py-2 !text-sm sm:!px-5 sm:!py-2.5">
          Inizia ora →
        </MagneticButton>
      </div>
    </>
  )
}

function HomeNav() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex min-h-[56px] w-full max-w-5xl items-center justify-between gap-3 overflow-visible rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-2xl sm:px-4 sm:py-1.5">
          <HomeNavLinks />
        </nav>
      </header>
    )
  }

  return (
    <Suspense
      fallback={
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
          <nav className="flex min-h-[56px] w-full max-w-5xl items-center justify-between gap-3 overflow-visible rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-2xl sm:px-4 sm:py-1.5">
            <HomeNavLinks />
          </nav>
        </header>
      }
    >
      <HomeNavDesktop />
    </Suspense>
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

function HeroSectionStatic() {
  const heroDotRef = useRef(null)

  return (
    <section
      id="hero"
      className="relative flex min-h-0 flex-col items-center justify-center overflow-x-clip px-6 pb-20 pt-28 text-center sm:min-h-[88vh] sm:pb-24 sm:pt-32 md:min-h-[85vh]"
    >
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <div className="relative z-10 mb-8 flex flex-col items-center gap-3 md:hidden">
        <WenandoMark
          className="h-24 w-24"
          width={96}
          height={96}
          fetchPriority="high"
        />
        <WenandoLogo size="lg" align="center" />
      </div>

      <MulticolorHeading
        as="h1"
        words="La guida sicura per chi ami."
        className="relative z-10 mb-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl"
        startIndex={0}
        neutralWords={[0, 3, 4]}
        trigger="mount"
        trailingAnchorRef={heroDotRef}
        trailingAnchorProps={{
          'data-scroll-anchor': 'hero-dot',
          'data-scroll-label': 'Inizio percorso',
        }}
      />

      <p className="hero-fade-in relative z-10 mb-10 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 sm:mb-12 sm:text-xl md:text-2xl">
        Non un catalogo di strutture — un&apos;analisi personalizzata della{' '}
        <span className="font-semibold text-[#E07A5F]">vostra</span> situazione,
        con l&apos;empatia di chi vi ascolta davvero.
      </p>

      <div
        className="hero-fade-in-delay relative z-10 mt-2 flex justify-center"
        data-scroll-anchor="hero-cta"
        data-scroll-label="CTA Hero"
      >
        <MagneticButton to="/wizard" variant="outline-coral" readingLineCta>
          Inizia ora →
        </MagneticButton>
      </div>
    </section>
  )
}

export default function HeroSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <HeroSectionStatic />
  }

  return (
    <Suspense fallback={<HeroSectionStatic />}>
      <HeroSectionDesktop />
    </Suspense>
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
