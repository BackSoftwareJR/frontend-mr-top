import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useIsMobile } from './utils/performanceTier'

const Home = lazy(() => import('./pages/Home'))

const Wizard = lazy(() => import('./pages/Wizard'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DesktopRouteTransitions = lazy(() => import('./DesktopRouteTransitions'))

function AppRoutes() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const routes = (
    <Suspense fallback={null}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )

  if (isMobile) {
    return routes
  }

  return (
    <Suspense fallback={routes}>
      <DesktopRouteTransitions>{routes}</DesktopRouteTransitions>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
