import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  CreditCard,
  Download,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  Table2,
  Wallet,
  X,
} from 'lucide-react'
import { WenandoMark } from '../ui/WenandoLogo'
import { useAuth } from '../../context/AuthContext'
import { useB2B } from '../../context/B2BContext'
import {
  b2bDropdown,
  b2bLink,
  b2bNavActive,
  b2bNavInactive,
  b2bPrimaryBtnSm,
  b2bTopbar,
  b2bWalletPill,
} from './b2bStyles'
import { proSidebar } from './proDesignTokens'
import B2BRechargeModal from './B2BRechargeModal'
import B2BToast from './B2BToast'
import ImpersonationBanner from './ImpersonationBanner'

const LOW_BALANCE_THRESHOLD = 30

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/pro/dashboard' },
  { icon: ShoppingBag, label: 'Marketplace Lead', to: '/pro/marketplace' },
  { icon: Table2, label: 'Il Mio CRM', to: '/pro/crm' },
  { icon: Calendar, label: 'Calendario', to: '/pro/calendario' },
  { icon: CreditCard, label: 'Fatturazione', to: '/pro/fatturazione' },
  { icon: Download, label: 'Export Center', to: '/pro/exports' },
]

const SETTINGS_ITEMS = [
  { icon: Settings, label: 'Profilo Azienda', to: '/pro/profilo' },
  { icon: MapPinned, label: 'Zona di copertura', to: '/pro/copertura' },
]

const ROUTE_LABELS = {
  '/pro/dashboard': 'Dashboard',
  '/pro/marketplace': 'Marketplace Lead',
  '/pro/crm': 'Il Mio CRM',
  '/pro/calendario': 'Calendario',
  '/pro/fatturazione': 'Fatturazione',
  '/pro/exports': 'Export Center',
  '/pro/profilo': 'Profilo Azienda',
  '/pro/copertura': 'Zona di copertura',
}

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive ? b2bNavActive : b2bNavInactive
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

function NotificationDropdown({ open, onToggle, onClose }) {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useB2B()
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full p-2.5 text-charcoal-muted transition-colors hover:bg-black/5 hover:text-charcoal"
        aria-label="Notifiche"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-coral text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={b2bDropdown}>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-charcoal">Notifiche</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllNotificationsRead} className={b2bLink + ' text-xs'}>
                Segna tutte lette
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <button
                  type="button"
                  onClick={() => markNotificationRead(notif.id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-black/[0.03] ${
                    !notif.read ? 'bg-accent-coral/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-coral" />
                    )}
                    <div className={!notif.read ? '' : 'pl-3.5'}>
                      <p className="text-sm font-medium text-charcoal">{notif.title}</p>
                      <p className="text-xs text-charcoal-muted">{notif.message}</p>
                      <p className="mt-0.5 text-[10px] text-charcoal-muted/70">{notif.time}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function UserMenuDropdown({ open, onToggle, onClose }) {
  const navigate = useNavigate()
  const goToProfile = () => {
    onClose()
    navigate('/pro/profilo')
  }
  const { logout, userName } = useAuth()
  const { companyName } = useB2B()
  const ref = useRef(null)
  const displayName = userName || companyName || 'Partner'

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 py-1 pl-1 pr-3 text-sm shadow-sm backdrop-blur-md transition-colors hover:bg-white"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-coral to-accent-violet text-xs font-semibold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-[120px] truncate font-medium text-charcoal md:inline">
          {displayName}
        </span>
      </button>

      {open && (
        <div className={`${b2bDropdown} w-56`}>
          <div className="border-b border-black/5 px-4 py-3">
            <p className="text-sm font-semibold text-charcoal">{displayName}</p>
            <p className="text-xs text-charcoal-muted">Partner Wenando Pro</p>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-charcoal-muted transition-colors hover:bg-black/[0.03]"
            onClick={goToProfile}
          >
            <Settings className="h-3.5 w-3.5" />
            Profilo Azienda
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-charcoal-muted transition-colors hover:bg-black/[0.03]"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Esci
          </button>
        </div>
      )}
    </div>
  )
}

function SidebarShell({ collapsed, onToggleCollapse, onNavigate, className = '' }) {
  return (
    <aside
      className={`${proSidebar} ${collapsed ? 'w-[72px]' : 'w-60'} ${className}`}
    >
      <div
        className={`flex items-center border-b border-black/5 ${collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-4 py-4'}`}
      >
        <WenandoMark className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">Wenando Pro</p>
            <p className="text-xs text-charcoal-muted">Area Partner</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {!collapsed && (
          <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-charcoal-muted/80">
            Impostazioni
          </p>
        )}
        {SETTINGS_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-black/5 p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-charcoal-muted transition-colors hover:bg-black/5 hover:text-charcoal ${collapsed ? 'justify-center' : ''}`}
          aria-label={collapsed ? 'Espandi menu' : 'Comprimi menu'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Comprimi</span>
            </>
          )}
        </button>
        {!collapsed && (
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center justify-center rounded-xl border border-black/5 bg-white/60 px-3 py-2 text-xs font-medium text-charcoal-muted transition-colors hover:bg-white hover:text-charcoal"
          >
            Torna al sito
          </Link>
        )}
      </div>
    </aside>
  )
}

export default function B2BLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { walletBalance, formatCurrency, openRechargeModal } = useB2B()

  const currentLabel = ROUTE_LABELS[location.pathname] || 'Wenando Pro'
  const lowBalance = walletBalance < LOW_BALANCE_THRESHOLD

  return (
    <div className="flex min-h-screen bg-warm-cream">
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-orb aurora-orb--coral" />
        <span className="aurora-orb aurora-orb--violet" />
      </div>

      <SidebarShell
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        className="relative z-20 hidden lg:flex"
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Chiudi menu"
          />
          <div className="relative flex h-full w-60">
            <SidebarShell
              collapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
              className="h-full shadow-xl"
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute -right-11 top-4 rounded-full border border-black/5 bg-white/90 p-2.5 shadow-md backdrop-blur-md"
              aria-label="Chiudi menu"
            >
              <X className="h-5 w-5 text-charcoal-muted" />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className={b2bTopbar}>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-black/5 lg:hidden"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="min-w-0 text-sm text-charcoal-muted" aria-label="Breadcrumb">
              <Link to="/pro/dashboard" className={`hidden font-medium sm:inline ${b2bLink}`}>
                Wenando Pro
              </Link>
              <span className="mx-1.5 hidden text-black/15 sm:inline">/</span>
              <span className="font-medium text-charcoal">{currentLabel}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <NotificationDropdown
              open={notifOpen}
              onToggle={() => {
                setNotifOpen((o) => !o)
                setUserMenuOpen(false)
              }}
              onClose={() => setNotifOpen(false)}
            />

            <div className={b2bWalletPill}>
              <Wallet className="hidden h-3.5 w-3.5 text-accent-coral sm:block" />
              <span className="text-[11px] font-medium text-charcoal-muted sm:text-sm">
                <span className="hidden sm:inline">Credito </span>
                <span className="font-semibold text-charcoal">{formatCurrency(walletBalance)}</span>
              </span>
              <button
                type="button"
                onClick={openRechargeModal}
                className={b2bPrimaryBtnSm + ' !py-1.5 !text-[11px] sm:!text-xs'}
              >
                Ricarica
              </button>
            </div>

            <UserMenuDropdown
              open={userMenuOpen}
              onToggle={() => {
                setUserMenuOpen((o) => !o)
                setNotifOpen(false)
              }}
              onClose={() => setUserMenuOpen(false)}
            />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <ImpersonationBanner />
          {lowBalance && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 backdrop-blur-md">
              <span>Credito basso — ricarica per sbloccare nuovi lead.</span>
              <button
                type="button"
                onClick={openRechargeModal}
                className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
              >
                Ricarica ora
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <B2BRechargeModal />
      <B2BToast />
    </div>
  )
}
