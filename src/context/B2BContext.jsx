import { createContext, useCallback, useContext, useMemo, useState } from 'react'
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
} from '../data/mockB2B'

const B2BContext = createContext(null)

function formatUltimaAzione(text) {
  return `${text} · ${new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
  }).format(new Date())}`
}

export function B2BProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState(INITIAL_WALLET_BALANCE)
  const [totalSpent, setTotalSpent] = useState(705)
  const [marketplaceLeads, setMarketplaceLeads] = useState(() =>
    mockMarketplaceLeads.map((lead) => ({
      ...lead,
      unlocked: mockCRMClients.some((c) => c.marketplaceId === lead.id),
    }))
  )
  const [crmClients, setCrmClients] = useState(mockCRMClients)
  const [appointments, setAppointments] = useState(mockAppointments)
  const [invoices, setInvoices] = useState(mockInvoices)
  const [activityFeed, setActivityFeed] = useState(mockActivityFeed)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [toast, setToast] = useState(null)
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const addActivity = useCallback((entry) => {
    setActivityFeed((prev) => [{ id: `ACT-${Date.now()}`, ...entry }, ...prev].slice(0, 20))
  }, [])

  const addInvoice = useCallback((invoice) => {
    setInvoices((prev) => [{ id: `INV-${Date.now()}`, ...invoice }, ...prev])
  }, [])

  const rechargeWallet = useCallback(
    (amount) => {
      if (!amount || amount <= 0) {
        showToast('Inserisci un importo valido', 'error')
        return false
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
    [addActivity, addInvoice, showToast]
  )

  const unlockLead = useCallback(
    (leadId) => {
      const lead = marketplaceLeads.find((l) => l.id === leadId)
      if (!lead) return false
      if (lead.unlocked) return false

      if (walletBalance < lead.unlockCost) {
        showToast('Credito insufficiente. Ricarica il wallet per sbloccare il lead.', 'error')
        return false
      }

      setWalletBalance((prev) => prev - lead.unlockCost)
      setTotalSpent((prev) => prev + lead.unlockCost)
      setMarketplaceLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, unlocked: true } : l))
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
    [addActivity, addInvoice, crmClients, marketplaceLeads, showToast, walletBalance]
  )

  const updateCRMStatus = useCallback(
    (clientId, stato) => {
      setCrmClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c
          return {
            ...c,
            stato,
            ultimaAzione: formatUltimaAzione(`Stato → ${stato}`),
          }
        })
      )
      const client = crmClients.find((c) => c.id === clientId)
      if (client) {
        addActivity({
          type: 'status',
          text: `Stato aggiornato: ${client.cliente} → ${stato}`,
          time: 'Adesso',
        })
      }
    },
    [addActivity, crmClients]
  )

  const scheduleVisit = useCallback(
    (clientId, date, time, note) => {
      const client = crmClients.find((c) => c.id === clientId)
      if (!client) return false

      const formattedDate = formatDateIT(date)
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
            : c
        )
      )
      addActivity({
        type: 'visit',
        text: `Visita programmata: ${client.cliente} · ${formattedDate} ${time}`,
        time: 'Adesso',
      })
      showToast(`Visita fissata con ${client.cliente}`, 'success')
      return true
    },
    [addActivity, crmClients, showToast]
  )

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const value = useMemo(
    () => ({
      walletBalance,
      totalSpent,
      marketplaceLeads,
      crmClients,
      appointments,
      invoices,
      activityFeed,
      notifications,
      unreadCount,
      toast,
      rechargeModalOpen,
      unlockCost: UNLOCK_COST,
      openRechargeModal: () => setRechargeModalOpen(true),
      closeRechargeModal: () => setRechargeModalOpen(false),
      showToast,
      rechargeWallet,
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
      invoices,
      activityFeed,
      notifications,
      unreadCount,
      toast,
      rechargeModalOpen,
      showToast,
      rechargeWallet,
      unlockLead,
      updateCRMStatus,
      scheduleVisit,
      markNotificationRead,
      markAllNotificationsRead,
    ]
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
