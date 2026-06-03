import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useIsMobile } from '../../utils/performanceTier'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
}

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
}

const instantTransition = { duration: 0 }

/** Subtle (i) trigger for educational drawers — text-sm, no chunky chrome */
export function InfoHelpButton({ onClick, className = '', label = "Cos'è questo?" }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      aria-label={label}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-teal-800 ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-400">
        <Info className="h-3 w-3" strokeWidth={2.25} aria-hidden />
      </span>
      <span>Cos&apos;è questo?</span>
    </motion.button>
  )
}

export default function InfoDrawer({ open, onClose, title, children }) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const panelRef = useRef(null)
  const transition = prefersReducedMotion
    ? instantTransition
    : { type: 'spring', damping: 34, stiffness: 400 }

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !panelRef.current) return
    const focusable = panelRef.current.querySelector(FOCUSABLE_SELECTOR)
    focusable?.focus()
  }, [open])

  useEffect(() => {
    if (!open || !panelRef.current) return

    const panel = panelRef.current

    const getFocusable = () =>
      [...panel.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true',
      )

    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label="Chiudi"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={prefersReducedMotion ? instantTransition : { duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
          />

          {isMobile ? (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="info-drawer-title"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transition}
              drag={prefersReducedMotion ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 72 || info.velocity.y > 380) onClose()
              }}
              style={{ willChange: prefersReducedMotion ? undefined : 'transform' }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-hidden rounded-t-[1.75rem] border border-white/20 bg-white/70 pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-2xl backdrop-blur-xl"
            >
              <div className="flex cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing">
                <div className="h-1 w-9 rounded-full bg-slate-300/80" aria-hidden />
              </div>
              <DrawerContent title={title} onClose={onClose} prefersReducedMotion={prefersReducedMotion}>
                {children}
              </DrawerContent>
            </motion.div>
          ) : (
            <motion.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="info-drawer-title"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transition}
              style={{ willChange: prefersReducedMotion ? undefined : 'transform' }}
              className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col overflow-hidden border-l border-slate-200/50 bg-white/70 shadow-2xl backdrop-blur-xl"
            >
              <DrawerContent title={title} onClose={onClose} prefersReducedMotion={prefersReducedMotion}>
                {children}
              </DrawerContent>
            </motion.aside>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

function DrawerContent({ title, onClose, children, prefersReducedMotion }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/50 px-5 py-4 sm:px-6">
        <h2 id="info-drawer-title" className="text-base font-semibold tracking-tight text-slate-800">
          {title}
        </h2>
        <motion.button
          type="button"
          onClick={onClose}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          aria-label="Chiudi pannello"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100/80 hover:text-slate-600"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {children}
      </div>
    </div>
  )
}
