import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { MORPH_SPRING } from '../../data/readingPathSchema'
import MagneticButton from '../ui/MagneticButton'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'

const NAV_SCROLL_RANGE = [0, 140]

function useNavMorph() {
  const { scrollY } = useScroll()

  const borderRadius = useSpring(
    useTransform(scrollY, NAV_SCROLL_RANGE, [2, 9999]),
    MORPH_SPRING,
  )
  const headerTop = useSpring(
    useTransform(scrollY, NAV_SCROLL_RANGE, [0, 24]),
    MORPH_SPRING,
  )
  const headerPadX = useSpring(
    useTransform(scrollY, NAV_SCROLL_RANGE, [0, 16]),
    MORPH_SPRING,
  )
  const navMaxWidth = useSpring(
    useTransform(scrollY, NAV_SCROLL_RANGE, [2000, 1024]),
    MORPH_SPRING,
  )

  return { borderRadius, headerTop, headerPadX, navMaxWidth }
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

export default function HomeNavDesktop() {
  const { borderRadius, headerTop, headerPadX, navMaxWidth } = useNavMorph()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        top: headerTop,
        paddingLeft: headerPadX,
        paddingRight: headerPadX,
      }}
      className="fixed left-0 right-0 z-50 flex justify-center"
    >
      <motion.nav
        style={{ borderRadius, maxWidth: navMaxWidth }}
        className="flex min-h-[56px] w-full items-center justify-between gap-3 overflow-visible border border-slate-200/80 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-2xl sm:px-4 sm:py-1.5"
      >
        <HomeNavLinks />
      </motion.nav>
    </motion.header>
  )
}
