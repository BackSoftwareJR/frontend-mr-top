import { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'

export default function DesktopRouteTransitions({ children }) {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>{children}</Suspense>
    </AnimatePresence>
  )
}
