import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  INITIAL_WALLET_BALANCE,
  UNLOCK_COST,
  formatCurrency,
  formatDateIT,
  mockActivityFeed,
  mockAppointments,
  mockCRMClients,
  mockInvoices,
  mockMarketplaceLeads,
  mockNotifications,
  PARTNER_NAME,
} from '../data/mockB2B'
import { ApiError, getBearerToken, isApiConfigured } from '../services/apiClient'
import { getSession } from '../services/authService'
import { createAppointment, fetchAppointments } from '../services/b2bAppointmentsService'
import { fetchCrmClientsWithOfflineMock, updateCrmClientStatus } from '../services/b2bCrmService'
import {
  fetchB2bDashboardWithOfflineMock,
  fetchB2bNotificationsWithOfflineMock,
  markAllB2bNotificationsRead,
  markB2bNotificationRead,
} from '../services/b2bDashboardService'
import {
  fetchMarketplaceLeadsWithOfflineMock,
  unlockMarketplaceLead,
} from '../services/b2bMarketplaceService'
import {
  fetchB2bInvoicesWithOfflineMock,
  fetchWalletWithOfflineMock,
  rechargeWalletApi,
} from '../services/b2bWalletService'

const B2BContext = createContext(null)

function formatUltimaAzione(text) {
  return `${text} · ${new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
  }).format(new Date())}`
}

function shouldUseApi() {
  return isApiConfigured() && Boolean(getBearerToken())
}

function readCompanyNameFromSession() {
  return getSession()?.name ?? null
}

export function B2BProvider({ children }) {
  const [useApi, setUseApi] = useState(() => shouldUseApi())
  const [walletBalance, setWalletBalance] = useState(INITIAL_WALLET_BALANCE)
  const [totalSpent, setTotalSpent] = useState(705)
  const [marketplaceLeads, setMarketplaceLeads] = useState(() =>
    mockMarketplaceLeads.map((lead) => ({
      ...lead,
      unlocked: mockCRMClients.some((c) => c.marketplaceId === lead.id),
    })),
  )
  const [crmClients, setCrmClients] = useState(mockCRMClients)
  const [appointments, setAppointments] = useState(() =>
    shouldUseApi() ? [] : mockAppointments,
  )
  const [companyName, setCompanyName] = useState(() =>
    shouldUseApi() ? (readCompanyNameFromSession() ?? '') : PARTNER_NAME,
  )
  const [invoices, setInvoices] = useState(() =>
    isApiConfigured() && getBearerToken() ? [] : mockInvoices,
  )
  const [initError, setInitError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [activityFeed, setActivityFeed] = useState(mockActivityFeed)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [leadsTrend, setLeadsTrend] = useState([])
  const [notifications, setNotifications] = useState(mockNotifications)
  const [toast, setToast] = useState(null)
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const unlockIdempotencyKeys = useRef(new Map())
  const appointmentIdempotencyKeys = useRef(new Map())

  const showToast = useCallback((message, type = 'info', options = {}) => {
    setToast({ message, type, id: Date.now(), action: options.action ?? null })
    setTimeout(() => setToast(null), options.action ? 6000 : 3500)
  }, [])

  const addActivity = useCallback((entry) => {
    setActivityFeed((prev) => [{ id: `ACT-${Date.now()}`, ...entry }, ...prev].slice(0, 20))
  }, [])

  const addInvoice = useCallback((invoice) => {
    setInvoices((prev) => [{ id: `INV-${Date.now()}`, ...invoice }, ...prev])
  }, [])

  const apiReady = shouldUseApi()
  const useApiEnabled = apiReady && useApi

  const retryInit = useCallback(() => {
    setRetryCount((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!apiReady) return

    let cancelled = false

    async function loadFromApi() {
      setLoading(true)
      setInitError(null)
      try {
        const [leads, clients, wallet, appointmentsList, dashboard, notifPayload, invoiceList] =
          await Promise.all([
            fetchMarketplaceLeadsWithOfflineMock(),
            fetchCrmClientsWithOfflineMock(),
            fetchWalletWithOfflineMock(),
            fetchAppointments(),
            fetchB2bDashboardWithOfflineMock(),
            fetchB2bNotificationsWithOfflineMock(),
            fetchB2bInvoicesWithOfflineMock(),
          ])

        if (cancelled) return

        setMarketplaceLeads(leads)
        setCrmClients(clients)
        setWalletBalance(wallet.balanceCredits)
        setTotalSpent(wallet.totalSpent)
        setAppointments(appointmentsList ?? [])
        const sessionCompanyName = readCompanyNameFromSession()
        if (sessionCompanyName) {
          setCompanyName(sessionCompanyName)
        }
        setDashboardStats(dashboard.stats)
        if (dashboard.activityFeed?.length) {
          setActivityFeed(dashboard.activityFeed)
        }
        setLeadsTrend(dashboard.leadsTrend ?? [])
        setNotifications(notifPayload.notifications)
        setInvoices(invoiceList)
        setUseApi(true)
      } catch (error) {
        if (cancelled) return

        if (isApiConfigured()) {
          setInitError(
            error instanceof ApiError
              ? error.message
              : 'Impossibile caricare i dati dal server. Verifica la connessione e riprova.',
          )
        } else {
          showToast('Impossibile caricare i dati dal server.', 'error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFromApi()

    return () => {
      cancelled = true
    }
  }, [apiReady, retryCount, showToast])

  const finalizeRecharge = useCallback(
    (amount, wallet, transaction) => {
      if (wallet) {
        setWalletBalance(wallet.balanceCredits)
        setTotalSpent(wallet.totalSpent)
      } else {
        setWalletBalance((prev) => prev + amount)
      }
      const invoiceStatus =
        transaction?.status === 'completed' ? 'Pagata' : 'In attesa'
      addInvoice({
        date: new Date().toISOString().slice(0, 10),
        description: 'Ricarica credito wallet',
        amount,
        status: invoiceStatus,
      })
      addActivity({
        type: 'recharge',
        text: `Ricarica wallet: ${formatCurrency(amount)}`,
        time: 'Adesso',
      })
      showToast(`Credito ricaricato: ${formatCurrency(amount)}`, 'success')
    },
    [addActivity, addInvoice, showToast],
  )

  const rechargeWallet = useCallback(
    async (amount, paymentMethod = 'card') => {
      if (!amount || amount <= 0) {
        showToast('Inserisci un importo valido', 'error')
        return false
      }

      if (useApiEnabled) {
        try {
          const result = await rechargeWalletApi({ amount, paymentMethod })

          if (result.pending) {
            showToast('Pagamento in attesa di conferma', 'info')
            return 'pending'
          }

          finalizeRecharge(amount, result.wallet, result.transaction)
          return true
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : (error.message ?? 'Ricarica non riuscita.')
          showToast(message, 'error')
          return false
        }
      }

      setWalletBalance((prev) => prev + amount)
      addInvoice({
        date: new Date().toISOString().slice(0, 10),
        description: 'Ricarica credito wallet',
        amount,
        status: 'Pagata',
      })
      addActivity({
        type: 'recharge',
        text: `Ricarica wallet: ${formatCurrency(amount)}`,
        time: 'Adesso',
      })
      showToast(`Credito ricaricato: ${formatCurrency(amount)}`, 'success')
      return true
    },
    [addActivity, addInvoice, finalizeRecharge, showToast, useApiEnabled],
  )

  const openRechargeFromToast = useCallback(() => {
    setRechargeModalOpen(true)
  }, [])

  const unlockLead = useCallback(
    async (leadId) => {
      const lead = marketplaceLeads.find((l) => l.id === leadId)
      if (!lead) return false
      if (lead.unlocked) return false

      if (useApiEnabled) {
        let idempotencyKey = unlockIdempotencyKeys.current.get(leadId)
        if (!idempotencyKey) {
          idempotencyKey = crypto.randomUUID()
          unlockIdempotencyKeys.current.set(leadId, idempotencyKey)
        }

        try {
          const result = await unlockMarketplaceLead(leadId, idempotencyKey)

          unlockIdempotencyKeys.current.delete(leadId)

          if (result.wallet) {
            setWalletBalance(result.wallet.balanceCredits)
            setTotalSpent(result.wallet.totalSpent)
          }

          setMarketplaceLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...result.lead, unlocked: true } : l)),
          )

          if (result.crmClient) {
            setCrmClients((prev) => {
              const exists = prev.some((c) => c.id === result.crmClient.id)
              if (exists) {
                return prev.map((c) =>
                  c.id === result.crmClient.id ? result.crmClient : c,
                )
              }
              return [result.crmClient, ...prev]
            })
          }

          addActivity({
            type: 'unlock',
            text: `Lead sbloccato: ${result.lead.name}`,
            time: 'Adesso',
          })
          showToast(
            `Contatto sbloccato: ${result.lead.name}. Trovi il lead in Il Mio CRM.`,
            'success',
          )
          return true
        } catch (error) {
          const apiError = error instanceof ApiError ? error : null
          const errorCode = apiError?.code

          if (errorCode === 'INSUFFICIENT_CREDITS' || apiError?.status === 402) {
            const balanceCredits = apiError?.details?.balance_credits
            if (balanceCredits != null) {
              setWalletBalance(balanceCredits)
            }
            showToast(
              apiError?.message ??
                'Credito insufficiente. Ricarica il wallet per sbloccare il lead.',
              'error',
              { action: { label: 'Ricarica wallet', onClick: openRechargeFromToast } },
            )
            return false
          }

          if (errorCode === 'IDEMPOTENCY_KEY_MISMATCH') {
            unlockIdempotencyKeys.current.delete(leadId)
            showToast(
              apiError?.message ??
                'La richiesta non corrisponde alla chiave di idempotenza già utilizzata. Riprova.',
              'error',
            )
            return false
          }

          showToast(apiError?.message ?? 'Sblocco non riuscito.', 'error')
          return false
        }
      }

      if (walletBalance < lead.unlockCost) {
        showToast('Credito insufficiente. Ricarica il wallet per sbloccare il lead.', 'error', {
          action: { label: 'Ricarica wallet', onClick: openRechargeFromToast },
        })
        return false
      }

      setWalletBalance((prev) => prev - lead.unlockCost)
      setTotalSpent((prev) => prev + lead.unlockCost)
      setMarketplaceLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, unlocked: true } : l)),
      )

      const existingCrm = crmClients.find((c) => c.marketplaceId === leadId)
      if (!existingCrm) {
        const newClient = {
          id: `CRM-${Date.now()}`,
          cliente: lead.name,
          stato: 'Nuovo',
          esigenza: lead.need,
          budget: lead.budget.replace('/mese', ''),
          ultimaAzione: formatUltimaAzione('Lead sbloccato'),
          phone: lead.phone,
          email: lead.email,
          location: lead.location,
          marketplaceId: lead.id,
        }
        setCrmClients((prev) => [newClient, ...prev])
      }

      addInvoice({
        date: new Date().toISOString().slice(0, 10),
        description: `Sblocco lead ${lead.id}`,
        amount: lead.unlockCost,
        status: 'Pagata',
      })
      addActivity({
        type: 'unlock',
        text: `Lead sbloccato: ${lead.name}`,
        time: 'Adesso',
      })
      showToast(`Contatto sbloccato: ${lead.name}`, 'success')
      return true
    },
    [
      addActivity,
      addInvoice,
      crmClients,
      marketplaceLeads,
      openRechargeFromToast,
      showToast,
      useApiEnabled,
      walletBalance,
    ],
  )

  const updateCRMStatus = useCallback(
    async (clientId, stato) => {
      const client = crmClients.find((c) => c.id === clientId)

      if (useApiEnabled) {
        try {
          const updated = await updateCrmClientStatus(clientId, stato)
          setCrmClients((prev) =>
            prev.map((c) => (c.id === clientId ? { ...updated, ultimaAzione: formatUltimaAzione(`Stato → ${stato}`) } : c)),
          )
          if (client) {
            addActivity({
              type: 'status',
              text: `Stato aggiornato: ${client.cliente} → ${stato}`,
              time: 'Adesso',
            })
          }
          return
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : (error.message ?? 'Aggiornamento stato non riuscito.')
          showToast(message, 'error')
          return
        }
      }

      setCrmClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c
          return {
            ...c,
            stato,
            ultimaAzione: formatUltimaAzione(`Stato → ${stato}`),
          }
        }),
      )
      if (client) {
        addActivity({
          type: 'status',
          text: `Stato aggiornato: ${client.cliente} → ${stato}`,
          time: 'Adesso',
        })
      }
    },
    [addActivity, crmClients, showToast, useApiEnabled],
  )

  const scheduleVisit = useCallback(
    async (clientId, date, time, note) => {
      const client = crmClients.find((c) => c.id === clientId)
      if (!client) return false

      const formattedDate = formatDateIT(date)

      if (useApiEnabled) {
        const visitKey = `${clientId}:${date}:${time}`
        let idempotencyKey = appointmentIdempotencyKeys.current.get(visitKey)
        if (!idempotencyKey) {
          idempotencyKey = crypto.randomUUID()
          appointmentIdempotencyKeys.current.set(visitKey, idempotencyKey)
        }

        try {
          const result = await createAppointment({
            clientId,
            date,
            time,
            note,
            idempotencyKey,
          })

          appointmentIdempotencyKeys.current.delete(visitKey)
          const appointment = result.appointment ?? {
            id: `APT-${Date.now()}`,
            clientId,
            cliente: client.cliente,
            date,
            time,
            note: note || '',
          }
          setAppointments((prev) => [...prev, appointment])
          setCrmClients((prev) =>
            prev.map((c) =>
              c.id === clientId
                ? {
                    ...c,
                    stato: 'Visita Fissata',
                    ultimaAzione: formatUltimaAzione(
                      `Visita fissata · ${formattedDate} ${time}`,
                    ),
                  }
                : c,
            ),
          )
          addActivity({
            type: 'visit',
            text: `Visita programmata: ${client.cliente} · ${formattedDate} ${time}`,
            time: 'Adesso',
          })
          showToast(`Visita fissata con ${client.cliente}`, 'success')
          return true
        } catch (error) {
          const apiError = error instanceof ApiError ? error : null
          if (apiError?.code === 'IDEMPOTENCY_KEY_MISMATCH') {
            appointmentIdempotencyKeys.current.delete(visitKey)
            showToast(
              apiError.message ??
                'La richiesta non corrisponde alla chiave di idempotenza già utilizzata. Riprova.',
              'error',
            )
            return false
          }

          showToast(apiError?.message ?? 'Impossibile fissare la visita.', 'error')
          return false
        }
      }

      const appointment = {
        id: `APT-${Date.now()}`,
        clientId,
        cliente: client.cliente,
        date,
        time,
        note: note || '',
      }

      setAppointments((prev) => [...prev, appointment])
      setCrmClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                stato: 'Visita Fissata',
                ultimaAzione: formatUltimaAzione(`Visita fissata · ${formattedDate} ${time}`),
              }
            : c,
        ),
      )
      addActivity({
        type: 'visit',
        text: `Visita programmata: ${client.cliente} · ${formattedDate} ${time}`,
        time: 'Adesso',
      })
      showToast(`Visita fissata con ${client.cliente}`, 'success')
      return true
    },
    [addActivity, crmClients, showToast, useApiEnabled],
  )

  const markNotificationRead = useCallback(
    async (notifId) => {
      if (useApiEnabled) {
        try {
          await markB2bNotificationRead(notifId)
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : (error.message ?? 'Impossibile aggiornare la notifica.')
          showToast(message, 'error')
          return
        }
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
      )
    },
    [showToast, useApiEnabled],
  )

  const markAllNotificationsRead = useCallback(async () => {
    if (useApiEnabled) {
      try {
        await markAllB2bNotificationsRead()
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : (error.message ?? 'Impossibile aggiornare le notifiche.')
        showToast(message, 'error')
        return
      }
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [showToast, useApiEnabled])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      walletBalance,
      totalSpent,
      marketplaceLeads,
      crmClients,
      appointments,
      setAppointments,
      companyName,
      invoices,
      initError,
      activityFeed,
      dashboardStats,
      leadsTrend,
      notifications,
      unreadCount,
      toast,
      rechargeModalOpen,
      loading,
      useApi: useApiEnabled,
      retryInit,
      unlockCost: UNLOCK_COST,
      openRechargeModal: () => setRechargeModalOpen(true),
      closeRechargeModal: () => setRechargeModalOpen(false),
      showToast,
      rechargeWallet,
      finalizeRecharge,
      unlockLead,
      updateCRMStatus,
      scheduleVisit,
      markNotificationRead,
      markAllNotificationsRead,
      formatCurrency,
    }),
    [
      walletBalance,
      totalSpent,
      marketplaceLeads,
      crmClients,
      appointments,
      companyName,
      invoices,
      initError,
      activityFeed,
      dashboardStats,
      leadsTrend,
      notifications,
      unreadCount,
      toast,
      rechargeModalOpen,
      loading,
      useApiEnabled,
      retryInit,
      showToast,
      rechargeWallet,
      finalizeRecharge,
      unlockLead,
      updateCRMStatus,
      scheduleVisit,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  )

  return <B2BContext.Provider value={value}>{children}</B2BContext.Provider>
}

export function useB2B() {
  const ctx = useContext(B2BContext)
  if (!ctx) {
    throw new Error('useB2B must be used within B2BProvider')
  }
  return ctx
}
