import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../../utils/performanceTier'
import ConsumerAccediNavLink from './ConsumerAccediNavLink'
import MagneticButton from '../ui/MagneticButton'
import HomeSearchBar from './HomeSearchBar'
import MulticolorHeading from '../ui/MulticolorHeading'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'
import BentoSteps from './BentoSteps'
import PersonalizedAnalysisSection from './PersonalizedAnalysisSection'
import FAQSection from './FAQSection'
import CTASection from './CTASection'
import AuroraBackground from '../layout/AuroraBackground'
import SectionBlob from '../ui/SectionBlob'
import { HOME_CTA, HOME_HERO } from '../../constants/siteCopy'

const HomeNavDesktop = lazy(() => import('./HomeNavDesktop'))
const HeroSectionDesktop = lazy(() => import('./HeroSectionDesktop'))

const MOBILE_NAV_CTA_CLASS =
  'shrink-0 whitespace-nowrap !min-h-[40px] !rounded-full !px-3.5 !py-2 !text-[0.8125rem] !font-semibold sm:!px-4 sm:!text-sm'

function MobileHomeNavLinks() {
  return (
    <>
      <Link
        to="/"
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden pr-2"
      >
        <WenandoMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" width={48} height={48} />
        <WenandoLogo size="nav-mobile" className="min-w-0 overflow-hidden" />
      </Link>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <ConsumerAccediNavLink className="!px-3 !text-[0.8125rem] sm:!px-4 sm:!text-sm" />
        <MagneticButton
          to="/wizard"
          variant="outline-coral"
          className={MOBILE_NAV_CTA_CLASS}
        >
          {HOME_CTA.label} →
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
          {HOME_CTA.label} →
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
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link
          to="/come-funziona"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Come funziona
        </Link>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          to="/chi-siamo"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Chi siamo
        </Link>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          to="/privacy"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Privacy
        </Link>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          to="/cookies"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Cookie
        </Link>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          to="/terms"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Termini
        </Link>
      </div>
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
        © 2026 Wenando — Motore di ricerca gratuito per servizi anziani.
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
        words={HOME_HERO.title}
        className="hero-fade-in-heading relative z-10 mb-2.5 max-w-[22rem] text-[2.75rem] font-extrabold leading-[1.06] tracking-tight sm:max-w-4xl"
        startIndex={0}
        neutralWords={[1, 3, 4, 7, 9, 10]}
        trigger="mount"
        trailingAnchorRef={heroDotRef}
        trailingAnchorProps={{
          'data-scroll-anchor': 'hero-dot',
          'data-scroll-label': 'Inizio percorso',
        }}
      />

      <p className="hero-fade-in relative z-10 mb-5 max-w-[21rem] text-[1.0625rem] font-medium leading-snug text-slate-600 sm:max-w-2xl sm:text-lg">
        {HOME_HERO.subtitle}
      </p>

      <div className="hero-fade-in-delay relative z-10 flex w-full justify-center px-1">
        <HomeSearchBar />
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
        <PersonalizedAnalysisSection />
        <FAQSection />
        <CTASection />
        <HomeFooter />
      </div>
    </>
  )
}
