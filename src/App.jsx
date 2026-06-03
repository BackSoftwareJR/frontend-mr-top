import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import Home from './pages/Home'
import { useIsMobile } from './utils/performanceTier'

const Wizard = lazy(() => import('./pages/Wizard'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function MotionRoot({ children }) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    )
  }
  return children
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionRoot>
        <AnimatedRoutes />
      </MotionRoot>
    </BrowserRouter>
  )
}
