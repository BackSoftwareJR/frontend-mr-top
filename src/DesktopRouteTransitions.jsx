import { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import RouteLoadingFallback from './components/ui/RouteLoadingFallback'

export default function DesktopRouteTransitions({ children }) {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
    </AnimatePresence>
  )
}
