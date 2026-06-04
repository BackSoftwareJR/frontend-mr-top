import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  Command,
  Landmark,
  LayoutDashboard,
  Loader2,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Settings,
  Users,
  CalendarClock,
  Wallet,
} from 'lucide-react'
import { WenandoMark } from '../ui/WenandoLogo'
import { useIsMobile } from '../../utils/performanceTier'
import { logoutSession } from '../../services/authService'
import { fetchAdminNotificationsWithFallback, fetchAdminSearchWithFallback } from '../../services/adminService'
import { isApiConfigured } from '../../services/apiClient'
import { adminGlassCard, adminNavActive, adminNavInactive } from './adminStyles'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', to: '/admin', end: true },
  { icon: Wallet, label: 'Portafoglio', to: '/admin/portfolio' },
  { icon: Receipt, label: 'Transazioni', to: '/admin/transactions' },
  { icon: Landmark, label: 'Bonifici', to: '/admin/wallet/pending' },
  { icon: Building2, label: 'Partners', to: '/admin/partners' },
  { icon: Users, label: 'Leads', to: '/admin/leads' },
  { icon: CalendarClock, label: 'Advisor', to: '/admin/advisor-bookings' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

const MOBILE_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', to: '/admin', end: true },
  { icon: Wallet, label: 'Portafoglio', to: '/admin/portfolio' },
  { icon: Receipt, label: 'Transazioni', to: '/admin/transactions' },
  { icon: Landmark, label: 'Bonifici', to: '/admin/wallet/pending' },
  { icon: Users, label: 'Leads', to: '/admin/leads' },
]

const MOBILE_MORE_ITEMS = [
  { icon: Building2, label: 'Partners', to: '/admin/partners' },
  { icon: Landmark, label: 'Bonifici', to: '/admin/wallet/pending' },
  { icon: CalendarClock, label: 'Advisor', to: '/admin/advisor-bookings' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

const ROUTE_LABELS = {
  '/admin': 'God Mode',
  '/admin/portfolio': 'Portafoglio',
  '/admin/transactions': 'Transazioni',
  '/admin/wallet/pending': 'Bonifici in attesa',
  '/admin/partners': 'Partner',
  '/admin/leads': 'Lead Router',
  '/admin/advisor-bookings': 'Consulenze advisor',
  '/admin/settings': 'Impostazioni',
}

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive ? adminNavActive : adminNavInactive
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

const SPOTLIGHT_ROUTES = {
  partner: (id) => `/admin/partners?highlight=${encodeURIComponent(id)}`,
  lead: (id) => `/admin/leads?open=${encodeURIComponent(id)}`,
  transaction: (id) => `/admin/transactions?open=${encodeURIComponent(id)}`,
  advisor_booking: (_id, q) =>
    `/admin/advisor-bookings?q=${encodeURIComponent(q)}`,
}

const SPOTLIGHT_GROUPS = [
  { key: 'partners', label: 'Partners' },
  { key: 'leads', label: 'Lead' },
  { key: 'transactions', label: 'Transazioni' },
  { key: 'advisor_bookings', label: 'Consulenze' },
]

const EMPTY_SPOTLIGHT_RESULTS = {
  partners: [],
  leads: [],
  transactions: [],
  advisor_bookings: [],
}

const SPOTLIGHT_SKELETON_ROWS = 3

function SpotlightSkeleton() {
  return (
    <div className="space-y-2 px-3 py-2" aria-busy="true" aria-label="Ricerca in corso">
      {Array.from({ length: SPOTLIGHT_SKELETON_ROWS }, (_, i) => (
        <div key={i} className="flex animate-pulse items-start gap-3 py-1">
          <div className="mt-0.5 h-5 w-14 shrink-0 rounded-md bg-white/10" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SpotlightSearch({ className = '' }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(EMPTY_SPOTLIGHT_RESULTS)
  const [activeIndex, setActiveIndex] = useState(-1)

  const trimmedQuery = query.trim()
  const isSearchActive = trimmedQuery.length >= 2
  const displayResults = isSearchActive ? results : EMPTY_SPOTLIGHT_RESULTS
  const displayLoading = isSearchActive && loading
  const displayActiveIndex = isSearchActive ? activeIndex : -1

  const flatResults = [
    ...displayResults.partners,
    ...displayResults.leads,
    ...displayResults.transactions,
    ...displayResults.advisor_bookings,
  ]

  const showDropdown = focused && isSearchActive

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  useEffect(() => {
    if (!isSearchActive) return undefined

    let cancelled = false

    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchAdminSearchWithFallback(trimmedQuery)
        if (!cancelled) {
          setResults(data)
          setActiveIndex(-1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isSearchActive, trimmedQuery])

  const handleQueryChange = (e) => {
    const next = e.target.value
    setQuery(next)
    const trimmed = next.trim()
    if (trimmed.length < 2) {
      setResults(EMPTY_SPOTLIGHT_RESULTS)
      setLoading(false)
      setActiveIndex(-1)
    } else {
      setLoading(true)
      setActiveIndex(-1)
    }
  }

  useEffect(() => {
    if (displayActiveIndex < 0 || !resultsRef.current) return
    const active = resultsRef.current.querySelector('[aria-selected="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [displayActiveIndex, displayLoading])

  const selectResult = (item) => {
    const routeFn = SPOTLIGHT_ROUTES[item.type]
    if (!routeFn) return
    const spotlightQuery = trimmedQuery
    setQuery('')
    setFocused(false)
    setActiveIndex(-1)
    navigate(routeFn(item.id, spotlightQuery))
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) return

    if (e.key === 'Escape') {
      e.preventDefault()
      setFocused(false)
      inputRef.current?.blur()
      return
    }

    if (displayLoading || flatResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const index = displayActiveIndex >= 0 ? displayActiveIndex : 0
      selectResult(flatResults[index])
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        ref={inputRef}
        id="admin-spotlight"
        type="search"
        value={query}
        onChange={handleQueryChange}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder="Cerca partner, lead, transazioni, consulenze…"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="admin-spotlight-results"
        className={`w-full rounded-xl border bg-zinc-900/60 py-2 pl-9 pr-16 text-sm text-white placeholder:text-zinc-500 backdrop-blur-xl transition-all focus:outline-none ${
          focused
            ? 'border-cyan-500/40 ring-1 ring-cyan-500/20'
            : 'border-white/10 hover:border-white/15'
        }`}
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:flex">
        <Command className="h-2.5 w-2.5" />K
      </kbd>

      {showDropdown && (
        <div
          ref={resultsRef}
          id="admin-spotlight-results"
          role="listbox"
          className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 ${adminGlassCard} py-1 shadow-2xl`}
        >
          {displayLoading ? (
            <SpotlightSkeleton />
          ) : flatResults.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">Nessun risultato</p>
          ) : (
            SPOTLIGHT_GROUPS.map((group, groupIndex) => {
              const items = displayResults[group.key]
              if (!items?.length) return null

              const offset = SPOTLIGHT_GROUPS.slice(0, groupIndex).reduce(
                (sum, g) => sum + (displayResults[g.key]?.length ?? 0),
                0,
              )

              return (
                <div key={group.key}>
                  <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {group.label}
                  </p>
                  {items.map((item, itemIndex) => {
                    const index = offset + itemIndex
                    const isActive = index === displayActiveIndex

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectResult(item)}
                        className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-cyan-500/10 text-white' : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-500">
                          {item.type}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{item.label}</span>
                          {item.subtitle ? (
                            <span className="block truncate text-xs text-zinc-500">{item.subtitle}</span>
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function NotificationBell({ notifications, loading, open, onToggle, onClose, onNavigate }) {
  const ref = useRef(null)
  const unreadCount = loading ? 0 : notifications.filter((n) => !n.read).length

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
        className="relative rounded-xl border border-white/10 bg-zinc-900/50 p-2 text-zinc-400 backdrop-blur-xl transition-colors hover:border-white/15 hover:text-white"
        aria-label="Notifiche"
        aria-expanded={open}
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-cyan-400/80" aria-hidden />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {!loading && unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full z-50 mt-2 w-80 ${adminGlassCard} py-1 shadow-2xl`}>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notifiche</p>
            <p className="text-xs text-zinc-500">
              {loading ? 'Caricamento…' : `${unreadCount} in attesa di approvazione`}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2
                className="h-5 w-5 animate-spin text-cyan-400"
                aria-label="Caricamento notifiche"
              />
            </div>
          ) : (
          <ul className="max-h-72 overflow-y-auto">
            {notifications.map((notif) => (
              <li key={notif.id}>
                {notif.href ? (
                  <Link
                    to={notif.href}
                    onClick={() => {
                      onClose()
                      onNavigate?.()
                    }}
                    className={`block w-full px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                      !notif.read ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                      )}
                      <div className={!notif.read ? '' : 'pl-3.5'}>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-zinc-400">{notif.message}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">{notif.time}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                      !notif.read ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                      )}
                      <div className={!notif.read ? '' : 'pl-3.5'}>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-zinc-400">{notif.message}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">{notif.time}</p>
                      </div>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
          )}
        </div>
      )}
    </div>
  )
}

function AdminAvatarMenu({ open, onToggle, onClose }) {
  const navigate = useNavigate()
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
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/50 py-1 pl-1 pr-3 backdrop-blur-xl transition-colors hover:border-cyan-500/30"
        aria-expanded={open}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-xs font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]">
          SA
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-white md:inline">
          Super Admin
        </span>
      </button>

      {open && (
        <div className={`absolute right-0 top-full z-50 mt-2 w-52 ${adminGlassCard} py-1 shadow-2xl`}>
          <div className="border-b border-white/10 px-4 py-2.5">
            <p className="text-sm font-semibold text-white">Super Admin</p>
            <p className="text-xs text-zinc-500">Wenando God Mode</p>
          </div>
          <Link
            to="/admin/settings"
            onClick={onClose}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
            Impostazioni
          </Link>
          <button
            type="button"
            onClick={async () => {
              onClose()
              await logoutSession()
              navigate('/admin/login')
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
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
      className={`flex shrink-0 flex-col border-r border-white/10 bg-zinc-950/80 backdrop-blur-2xl transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-56'} ${className}`}
    >
      <div
        className={`flex items-center border-b border-white/10 ${collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-4 py-4'}`}
      >
        <WenandoMark className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">God Mode</p>
            <p className="text-xs text-zinc-500">Super Admin</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 ${collapsed ? 'justify-center' : ''}`}
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
            className="flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-white/15 hover:text-zinc-300"
          >
            Torna al sito
          </Link>
        )}
      </div>
    </aside>
  )
}

function BottomNavLink({ item, compact, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-all ${
          isActive ? 'text-cyan-400' : 'text-zinc-500'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`rounded-xl p-1.5 transition-all ${
              isActive ? 'bg-cyan-500/15 shadow-[0_0_12px_rgba(34,211,238,0.25)]' : ''
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
          </div>
          <span
            className={`font-medium tracking-tight ${compact ? 'text-[9px]' : 'text-[10px]'}`}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function BottomNavigationBar() {
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = MOBILE_MORE_ITEMS.some((item) => location.pathname === item.to)
  const closeMore = () => setMoreOpen(false)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
      style={{ boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.6)' }}
      aria-label="Navigazione Super Admin"
    >
      <div className="relative mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {MOBILE_NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.to} item={item} compact onNavigate={closeMore} />
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-all ${
            moreActive || moreOpen ? 'text-cyan-400' : 'text-zinc-500'
          }`}
          aria-expanded={moreOpen}
          aria-haspopup="true"
          aria-label="Altro menu"
        >
          <div
            className={`rounded-xl p-1.5 transition-all ${
              moreActive || moreOpen ? 'bg-cyan-500/15 shadow-[0_0_12px_rgba(34,211,238,0.25)]' : ''
            }`}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={moreOpen ? 2.25 : 1.75} />
          </div>
          <span className="text-[9px] font-medium tracking-tight">Altro</span>
        </button>

        {moreOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[-1] bg-transparent"
              aria-label="Chiudi menu"
              onClick={() => setMoreOpen(false)}
            />
            <div
              className={`absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 ${adminGlassCard} py-1 shadow-2xl`}
            >
              {MOBILE_MORE_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                        isActive ? 'text-cyan-400' : 'text-zinc-400'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default function AdminLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(() => isApiConfigured())

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) setNotificationsLoading(true)
      try {
        const data = await fetchAdminNotificationsWithFallback()
        if (!cancelled) setNotifications(data)
      } finally {
        if (!cancelled) setNotificationsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const currentLabel = ROUTE_LABELS[location.pathname] || 'God Mode'

  return (
    <div className="flex min-h-screen bg-black text-white">
      {!isMobile && (
        <SidebarShell
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          className="relative z-20"
        />
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 px-3 py-3 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 shrink-0">
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <WenandoMark className="h-7 w-7" />
                  <span className="text-sm font-semibold text-white">{currentLabel}</span>
                </div>
              ) : (
                <nav className="text-sm text-zinc-500" aria-label="Breadcrumb">
                  <Link to="/admin" className="font-medium text-cyan-400/80 hover:text-cyan-400">
                    God Mode
                  </Link>
                  {location.pathname !== '/admin' && (
                    <>
                      <span className="mx-1.5 text-zinc-700">/</span>
                      <span className="font-medium text-white">{currentLabel}</span>
                    </>
                  )}
                </nav>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
              <SpotlightSearch className="hidden max-w-md flex-1 sm:block" />
              <NotificationBell
                notifications={notifications}
                loading={notificationsLoading}
                open={notifOpen}
                onToggle={() => {
                  setNotifOpen((o) => !o)
                  setAvatarOpen(false)
                }}
                onClose={() => setNotifOpen(false)}
              />
              <AdminAvatarMenu
                open={avatarOpen}
                onToggle={() => {
                  setAvatarOpen((o) => !o)
                  setNotifOpen(false)
                }}
                onClose={() => setAvatarOpen(false)}
              />
            </div>
          </div>

          {isMobile && (
            <SpotlightSearch className="mt-3" />
          )}
        </header>

        <main className={`flex-1 overflow-auto p-4 sm:p-6 ${isMobile ? 'pb-28' : ''}`}>
          <Outlet />
        </main>
      </div>

      {isMobile && <BottomNavigationBar />}
    </div>
  )
}
