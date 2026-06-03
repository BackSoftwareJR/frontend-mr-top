import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../../utils/performanceTier'
import ConsumerAccediNavLink from './ConsumerAccediNavLink'
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

function MobileHomeNavLinks() {
  return (
    <>
      <Link
        to="/"
        className="flex min-w-0 items-center gap-2 overflow-visible"
      >
        <WenandoMark className="h-14 w-14 shrink-0" width={56} height={56} />
        <WenandoLogo size="nav-mobile" className="min-w-0 overflow-visible" />
      </Link>
      <div className="flex items-center gap-2">
        <ConsumerAccediNavLink />
        <MagneticButton
          to="/wizard"
          variant="outline-coral"
          className="!min-h-[44px] !px-5 !py-2.5 !text-sm !font-semibold"
        >
          Inizia ora →
        </MagneticButton>
      </div>
    </>
  )
}

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
        <ConsumerAccediNavLink />
        <MagneticButton
          to="/wizard"
          variant="outline-coral"
          className="!min-h-[44px] !px-5 !py-2.5 !text-sm !font-semibold"
        >
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
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex min-h-[52px] w-full max-w-5xl items-center justify-between gap-3 overflow-visible rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-2xl">
          <MobileHomeNavLinks />
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
    <footer className="border-t border-black/5 px-6 py-12 text-center">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link
          to="/admin"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Accedi Area Admin
        </Link>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          to="/pro"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Area B2B
        </Link>
      </div>
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
      className="relative flex min-h-0 flex-col items-center justify-center overflow-x-clip px-5 pb-14 pt-[4.75rem] text-center"
    >
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <div className="relative z-10 mb-3 flex justify-center">
        <WenandoMark
          className="h-[8.75rem] w-[8.75rem]"
          width={140}
          height={140}
          alt="Wenando"
          fetchPriority="high"
        />
      </div>

      <MulticolorHeading
        as="h1"
        words="La guida sicura per chi ami."
        className="hero-fade-in-heading relative z-10 mb-2.5 max-w-[22rem] text-[2.75rem] font-extrabold leading-[1.06] tracking-tight sm:max-w-4xl"
        startIndex={0}
        neutralWords={[0, 3, 4]}
        trigger="mount"
        trailingAnchorRef={heroDotRef}
        trailingAnchorProps={{
          'data-scroll-anchor': 'hero-dot',
          'data-scroll-label': 'Inizio percorso',
        }}
      />

      <p className="hero-fade-in relative z-10 mb-5 max-w-[21rem] text-[1.0625rem] font-medium leading-snug text-slate-600 sm:max-w-2xl sm:text-lg">
        Non un catalogo di strutture — un&apos;analisi personalizzata della{' '}
        <span className="font-semibold text-[#E07A5F]">vostra</span> situazione,
        con l&apos;empatia di chi vi ascolta davvero.
      </p>

      <div
        className="hero-fade-in-delay relative z-10 flex justify-center"
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
