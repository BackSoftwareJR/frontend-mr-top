import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import AppErrorBoundary from './components/errors/AppErrorBoundary'
import RouteLoadingFallback from './components/ui/RouteLoadingFallback'
import { lazyRoute } from './utils/lazyRoute'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import { B2BProvider } from './context/B2BContext'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import { B2BProtectedRoute, ConsumerProtectedRoute } from './components/auth/ProtectedRoute'
import { usePlausibleAnalytics } from './hooks/usePlausibleAnalytics'
import { useMobileRouteWarmup } from './hooks/useMobileRouteWarmup'
import { useIsMobile } from './utils/performanceTier'
import DeferredCookieBanner from './components/DeferredCookieBanner'

const Wizard = lazyRoute(() => import('./pages/Wizard'))
const ExplorePage = lazyRoute(() => import('./pages/ExplorePage'))
const ResultsPage = lazyRoute(() => import('./pages/ResultsPage'))
const Accedi = lazyRoute(() => import('./pages/Accedi'))
const UserLayout = lazyRoute(() => import('./components/user/UserLayout'))
const UserHome = lazyRoute(() => import('./pages/user/UserHome'))
const UserSearches = lazyRoute(() => import('./pages/user/UserSearches'))
const UserSearchDetail = lazyRoute(() => import('./pages/user/UserSearchDetail'))
const UserHelp = lazyRoute(() => import('./pages/user/UserHelp'))
const UserProfile = lazyRoute(() => import('./pages/user/UserProfile'))
const B2BLayout = lazyRoute(() => import('./components/b2b/B2BLayout'))
const DashboardHome = lazyRoute(() => import('./pages/b2b/DashboardHome'))
const LeadMarketplace = lazyRoute(() => import('./pages/b2b/LeadMarketplace'))
const SmartCRM = lazyRoute(() => import('./pages/b2b/SmartCRM'))
const Calendario = lazyRoute(() => import('./pages/b2b/Calendario'))
const ExportCenter = lazyRoute(() => import('./pages/b2b/ExportCenter'))
const Fatturazione = lazyRoute(() => import('./pages/b2b/Fatturazione'))
const CompanyProfile = lazyRoute(() => import('./pages/b2b/CompanyProfile'))
const Copertura = lazyRoute(() => import('./pages/b2b/Copertura'))
const B2bEditorialListPage = lazyRoute(() => import('./pages/b2b/editorial/EditorialListPage'))
const B2bEditorialAnalyticsPage = lazyRoute(() => import('./pages/b2b/editorial/EditorialAnalyticsPage'))
const B2bEditorialEditorPage = lazyRoute(() => import('./pages/b2b/editorial/EditorialEditorPage'))
const ProAccedi = lazyRoute(() => import('./pages/b2b/ProAccedi'))
const B2BPortal = lazyRoute(() => import('./pages/b2b/B2BPortal'))
const B2BRegister = lazyRoute(() => import('./pages/b2b/Register'))
const B2BOnboarding = lazyRoute(() => import('./pages/b2b/Onboarding'))
const AdminLayout = lazyRoute(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazyRoute(() => import('./pages/admin/AdminLogin'))
const AdminHome = lazyRoute(() => import('./pages/admin/AdminHome'))
const AdminPortfolio = lazyRoute(() => import('./pages/admin/AdminPortfolio'))
const AdminTransactions = lazyRoute(() => import('./pages/admin/AdminTransactions'))
const AdminPendingTransfers = lazyRoute(() => import('./pages/admin/AdminPendingTransfers'))
const ManagePartners = lazyRoute(() => import('./pages/admin/ManagePartners'))
const LeadRouter = lazyRoute(() => import('./pages/admin/LeadRouter'))
const AdminAdvisorBookings = lazyRoute(() => import('./pages/admin/AdminAdvisorBookings'))
const AdminSettings = lazyRoute(() => import('./pages/admin/AdminSettings'))
const EditorialListPage = lazyRoute(() => import('./pages/admin/editorial/EditorialListPage'))
const EditorialEditorPage = lazyRoute(() => import('./pages/admin/editorial/EditorialEditorPage'))
const EditorialReviewPage = lazyRoute(() => import('./pages/admin/editorial/EditorialReviewPage'))
const EditorialIndexingPage = lazyRoute(() => import('./pages/admin/editorial/EditorialIndexingPage'))
const EditorialMetricsPage = lazyRoute(() => import('./pages/admin/editorial/EditorialMetricsPage'))
const ImpersonateBootstrap = lazyRoute(() => import('./pages/b2b/ImpersonateBootstrap'))
const DesktopRouteTransitions = lazyRoute(() => import('./DesktopRouteTransitions'))
const PrivacyPage = lazyRoute(() => import('./pages/legal/PrivacyPage'))
const CookiesPage = lazyRoute(() => import('./pages/legal/CookiesPage'))
const TermsPage = lazyRoute(() => import('./pages/legal/TermsPage'))
const TermsPartnersPage = lazyRoute(() => import('./pages/legal/TermsPartnersPage'))
const ComeFunzionaPage = lazyRoute(() => import('./pages/ComeFunzionaPage'))
const ChiSiamoPage = lazyRoute(() => import('./pages/ChiSiamoPage'))
const MagazineHome = lazyRoute(() => import('./pages/MagazineHome'))
const NotFoundPage = lazyRoute(() => import('./pages/errors/NotFoundPage'))
const ErrorStatusPage = lazyRoute(() => import('./pages/errors/ErrorStatusPage'))

function AppShell() {
  usePlausibleAnalytics()
  useMobileRouteWarmup()
  return (
    <AppErrorBoundary>
      <AppRoutes />
      <DeferredCookieBanner />
    </AppErrorBoundary>
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

/** Legacy `/user/*` paths → canonical `/area-personale/*`. */
function UserLegacyRedirect() {
  const { pathname, search, hash } = useLocation()
  const suffix = pathname.replace(/^\/user\/?/, '') || ''
  const target = suffix ? `/area-personale/${suffix}` : '/area-personale'
  return <Navigate to={`${target}${search}${hash}`} replace />
}

function AppRoutes() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const routes = (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes location={location} key={isMobile ? undefined : location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/esplora" element={<ExplorePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/accedi" element={<Accedi />} />
        <Route path="/come-funziona" element={<ComeFunzionaPage />} />
        <Route path="/chi-siamo" element={<ChiSiamoPage />} />
        <Route path="/magazine" element={<MagazineHome />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-partners" element={<TermsPartnersPage />} />
        <Route path="/login" element={<Navigate to="/accedi" replace />} />
        <Route path="/dashboard" element={<Navigate to="/area-personale" replace />} />
        <Route path="/user/*" element={<UserLegacyRedirect />} />
        <Route path="/area-personale" element={<UserShell />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<UserHome />} />
          <Route path="ricerche" element={<UserSearches />} />
          <Route path="ricerche/:ref" element={<UserSearchDetail />} />
          <Route path="aiuto" element={<UserHelp />} />
          <Route path="profilo" element={<UserProfile />} />
        </Route>
        <Route path="/pro">
          <Route index element={<B2BPortal />} />
          <Route path="registrati" element={<B2BRegister />} />
          <Route path="accedi" element={<ProAccedi />} />
          <Route path="impersonate" element={<ImpersonateBootstrap />} />
          <Route path="onboarding" element={<B2BOnboarding />} />
          <Route element={<B2BShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="marketplace" element={<LeadMarketplace />} />
            <Route path="crm" element={<SmartCRM />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="exports" element={<ExportCenter />} />
            <Route path="fatturazione" element={<Fatturazione />} />
            <Route path="copertura" element={<Copertura />} />
            <Route path="profilo" element={<CompanyProfile />} />
            <Route path="editoriale" element={<B2bEditorialListPage />} />
            <Route path="editoriale/analytics" element={<B2bEditorialAnalyticsPage />} />
            <Route path="editoriale/new" element={<B2bEditorialEditorPage />} />
            <Route path="editoriale/:uuid/edit" element={<B2bEditorialEditorPage />} />
          </Route>
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="wallet/pending" element={<AdminPendingTransfers />} />
          <Route path="partners" element={<ManagePartners />} />
          <Route path="leads" element={<LeadRouter />} />
          <Route path="advisor-bookings" element={<AdminAdvisorBookings />} />
          <Route path="editorial" element={<EditorialListPage />} />
          <Route path="editorial/new" element={<EditorialEditorPage />} />
          <Route path="editorial/review" element={<EditorialReviewPage />} />
          <Route path="editorial/indexing" element={<EditorialIndexingPage />} />
          <Route path="editorial/metrics" element={<EditorialMetricsPage />} />
          <Route path="editorial/:uuid/edit" element={<EditorialEditorPage />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/errore/:code" element={<ErrorStatusPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
