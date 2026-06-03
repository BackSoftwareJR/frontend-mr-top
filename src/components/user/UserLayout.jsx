import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Home, Search, HeartHandshake, User } from 'lucide-react'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'
import { useIsMobile } from '../../utils/performanceTier'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/user/home' },
  { icon: Search, label: 'Ricerche', to: '/user/ricerche' },
  { icon: HeartHandshake, label: 'Aiuto', to: '/user/aiuto' },
  { icon: User, label: 'Profilo', to: '/user/profilo' },
]

const DESKTOP_LINKS = [
  { label: 'Home', to: '/user/home' },
  { label: 'Ricerche', to: '/user/ricerche' },
  { label: 'Aiuto', to: '/user/aiuto' },
  { label: 'Profilo', to: '/user/profilo' },
]

function DesktopNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#FDFBF7]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5 sm:px-8">
        <NavLink
          to="/user/home"
          className="flex min-h-[3rem] items-center gap-2.5"
          aria-label="Area personale Wenando"
        >
          <WenandoMark className="h-9 w-9 shrink-0" />
          <WenandoLogo size="nav" className="hidden sm:block" />
        </NavLink>

        <nav className="flex items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/70 p-1 shadow-sm backdrop-blur-xl">
          {DESKTOP_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative"
            >
              {({ isActive }) => (
                <span
                  className={`relative inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-teal-800' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="user-desktop-nav-pill"
                      className="absolute inset-0 rounded-full bg-teal-800/[0.08]"
                      transition={spring}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function BottomNavItem({ item }) {
  const Icon = item.icon

  return (
    <NavLink to={item.to} className="relative flex flex-1 justify-center">
      {({ isActive }) => (
        <motion.span
          whileTap={{ scale: 0.97 }}
          transition={spring}
          className={`relative flex min-h-[3.5rem] min-w-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 ${
            isActive ? 'text-teal-800' : 'text-slate-500'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="user-mobile-tab-pill"
              className="absolute inset-x-1 inset-y-1 rounded-2xl bg-teal-800/[0.09]"
              transition={spring}
            />
          )}
          <Icon
            className="relative z-10 h-6 w-6"
            strokeWidth={isActive ? 2.25 : 1.85}
          />
          <span className="relative z-10 text-xs font-medium tracking-tight">
            {item.label}
          </span>
        </motion.span>
      )}
    </NavLink>
  )
}

function BottomNavigationBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.06] bg-white/80 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl"
      style={{ boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.05)' }}
      aria-label="Navigazione area personale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-3">
        {NAV_ITEMS.map((item) => (
          <BottomNavItem key={item.to} item={item} />
        ))}
      </div>
    </nav>
  )
}

export default function UserLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  const pageTransition = prefersReducedMotion
    ? { duration: 0 }
    : spring

  const pageInitial = prefersReducedMotion
    ? false
    : { opacity: 0, y: 14 }

  const pageAnimate = { opacity: 1, y: 0 }
  const pageExit = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: -10 }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-base text-slate-800 antialiased">
      {!isMobile && <DesktopNavbar />}

      <main
        className={`mx-auto max-w-2xl ${
          isMobile ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5' : 'py-10'
        } px-5 sm:px-8`}
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
