import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { B2BProvider } from './context/B2BContext'
import { B2BProtectedRoute, ConsumerProtectedRoute } from './components/auth/ProtectedRoute'
import CookieBanner from './components/CookieBanner'
import { usePlausibleAnalytics } from './hooks/usePlausibleAnalytics'
import { useIsMobile } from './utils/performanceTier'

const Home = lazy(() => import('./pages/Home'))
const Wizard = lazy(() => import('./pages/Wizard'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const Accedi = lazy(() => import('./pages/Accedi'))
const UserLayout = lazy(() => import('./components/user/UserLayout'))
const UserHome = lazy(() => import('./pages/user/UserHome'))
const UserSearches = lazy(() => import('./pages/user/UserSearches'))
const UserHelp = lazy(() => import('./pages/user/UserHelp'))
const UserProfile = lazy(() => import('./pages/user/UserProfile'))
const B2BLayout = lazy(() => import('./components/b2b/B2BLayout'))
const DashboardHome = lazy(() => import('./pages/b2b/DashboardHome'))
const LeadMarketplace = lazy(() => import('./pages/b2b/LeadMarketplace'))
const SmartCRM = lazy(() => import('./pages/b2b/SmartCRM'))
const Calendario = lazy(() => import('./pages/b2b/Calendario'))
const Fatturazione = lazy(() => import('./pages/b2b/Fatturazione'))
const ProAccedi = lazy(() => import('./pages/b2b/ProAccedi'))
const B2BPortal = lazy(() => import('./pages/b2b/B2BPortal'))
const B2BRegister = lazy(() => import('./pages/b2b/Register'))
const B2BOnboarding = lazy(() => import('./pages/b2b/Onboarding'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminPortfolio = lazy(() => import('./pages/admin/AdminPortfolio'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const ManagePartners = lazy(() => import('./pages/admin/ManagePartners'))
const LeadRouter = lazy(() => import('./pages/admin/LeadRouter'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const DesktopRouteTransitions = lazy(() => import('./DesktopRouteTransitions'))
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'))
const CookiesPage = lazy(() => import('./pages/legal/CookiesPage'))
const TermsPage = lazy(() => import('./pages/legal/TermsPage'))
const TermsPartnersPage = lazy(() => import('./pages/legal/TermsPartnersPage'))

function AppShell() {
  usePlausibleAnalytics()
  return (
    <>
      <AppRoutes />
      <CookieBanner />
    </>
  )
}

function B2BShell() {
  return (
    <B2BProtectedRoute>
      <B2BProvider>
        <B2BLayout />
      </B2BProvider>
    </B2BProtectedRoute>
  )
}

function UserShell() {
  return (
    <ConsumerProtectedRoute>
      <UserLayout />
    </ConsumerProtectedRoute>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const routes = (
    <Suspense fallback={null}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/accedi" element={<Accedi />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-partners" element={<TermsPartnersPage />} />
        <Route path="/login" element={<Navigate to="/accedi" replace />} />
        <Route path="/dashboard" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<UserShell />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<UserHome />} />
          <Route path="ricerche" element={<UserSearches />} />
          <Route path="aiuto" element={<UserHelp />} />
          <Route path="profilo" element={<UserProfile />} />
        </Route>
        <Route path="/pro">
          <Route index element={<B2BPortal />} />
          <Route path="registrati" element={<B2BRegister />} />
          <Route path="accedi" element={<ProAccedi />} />
          <Route path="onboarding" element={<B2BOnboarding />} />
          <Route element={<B2BShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="marketplace" element={<LeadMarketplace />} />
            <Route path="crm" element={<SmartCRM />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="fatturazione" element={<Fatturazione />} />
          </Route>
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="partners" element={<ManagePartners />} />
          <Route path="leads" element={<LeadRouter />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
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
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
