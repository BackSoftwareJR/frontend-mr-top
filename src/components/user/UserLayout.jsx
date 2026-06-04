import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Home, Search, HeartHandshake, User } from 'lucide-react'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'
import { useIsMobile } from '../../utils/performanceTier'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const GLASS =
  'border border-white/50 bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-xl'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/area-personale/home' },
  { icon: Search, label: 'Ricerche', to: '/area-personale/ricerche' },
  { icon: HeartHandshake, label: 'Aiuto', to: '/area-personale/aiuto' },
  { icon: User, label: 'Profilo', to: '/area-personale/profilo' },
]

const DESKTOP_LINKS = [
  { label: 'Home', to: '/area-personale/home' },
  { label: 'Ricerche', to: '/area-personale/ricerche' },
  { label: 'Aiuto', to: '/area-personale/aiuto' },
  { label: 'Profilo', to: '/area-personale/profilo' },
]

const hoverTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: spring,
}

function AmbientBackground({ reducedMotion }) {
  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-64 w-64 rounded-full bg-rose-100/30 blur-3xl" />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl"
        animate={{ x: [0, -32, 0], y: [0, 20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-16 left-1/3 h-64 w-64 rounded-full bg-rose-100/30 blur-3xl"
        animate={{ x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function DesktopNavLink({ link }) {
  return (
    <NavLink to={link.to} className="relative">
      {({ isActive }) => (
        <motion.span
          {...hoverTap}
          className={`relative inline-flex min-h-[3rem] items-center rounded-[2rem] px-5 py-2.5 text-base font-medium transition-colors ${
            isActive ? 'text-teal-800' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="user-desktop-nav-pill"
              className="absolute inset-0 rounded-[2rem] bg-teal-800/[0.08]"
              transition={spring}
            />
          )}
          <span className="relative z-10">{link.label}</span>
        </motion.span>
      )}
    </NavLink>
  )
}

function DesktopFloatingNavbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-5 pt-5 sm:px-8 sm:pt-6">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className={`pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-[2.5rem] px-4 py-2.5 sm:px-5 sm:py-3 ${GLASS}`}
      >
        <NavLink
          to="/area-personale/home"
          aria-label="Area personale Wenando"
          className="shrink-0"
        >
          <motion.span
            {...hoverTap}
            className="flex min-h-[3.25rem] items-center gap-3 rounded-[2rem] px-2 py-1"
          >
            <WenandoMark className="h-10 w-10 shrink-0" />
            <WenandoLogo size="nav" className="hidden sm:block" />
          </motion.span>
        </NavLink>

        <nav
          className="flex items-center gap-0.5 rounded-[2.5rem] border border-white/40 bg-white/40 p-1 backdrop-blur-xl"
          aria-label="Navigazione area personale"
        >
          {DESKTOP_LINKS.map((link) => (
            <DesktopNavLink key={link.to} link={link} />
          ))}
        </nav>
      </motion.header>
    </div>
  )
}

function BottomNavItem({ item }) {
  const Icon = item.icon

  return (
    <NavLink to={item.to} className="relative flex flex-1 justify-center">
      {({ isActive }) => (
        <motion.span
          {...hoverTap}
          className={`relative flex min-h-[4rem] min-w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-[2rem] px-3 py-2 ${
            isActive ? 'text-teal-800' : 'text-slate-500'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="user-mobile-tab-pill"
              className="absolute inset-x-1 inset-y-1 rounded-[1.75rem] bg-teal-800/[0.09]"
              transition={spring}
            />
          )}
          <Icon
            className="relative z-10 h-7 w-7"
            strokeWidth={isActive ? 2.25 : 1.85}
          />
          <span className="relative z-10 text-xs font-semibold tracking-tight">
            {item.label}
          </span>
        </motion.span>
      )}
    </NavLink>
  )
}

function BottomNavigationBar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/60 bg-white/80 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl"
      style={{ boxShadow: '0 -12px 40px rgba(15, 23, 42, 0.04)' }}
      aria-label="Navigazione area personale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-4">
        {NAV_ITEMS.map((item) => (
          <BottomNavItem key={item.to} item={item} />
        ))}
      </div>
    </motion.nav>
  )
}

export default function UserLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  const pageTransition = prefersReducedMotion ? { duration: 0 } : spring

  const pageInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 }

  const pageAnimate = { opacity: 1, y: 0 }
  const pageExit = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: -12 }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-lg text-slate-800 antialiased">
      <AmbientBackground reducedMotion={prefersReducedMotion} />

      {!isMobile && <DesktopFloatingNavbar />}

      <main
        className={`relative z-10 mx-auto max-w-2xl px-5 sm:px-8 ${
          isMobile
            ? 'pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6'
            : 'pb-12 pt-[calc(5.5rem+env(safe-area-inset-top))]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={pageInitial}
            animate={pageAnimate}
            exit={pageExit}
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {isMobile && <BottomNavigationBar />}
    </div>
  )
}
