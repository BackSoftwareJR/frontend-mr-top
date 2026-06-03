import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mail, Phone, X } from 'lucide-react'
import { adminPartnersList, mockAdminLeads } from '../../data/mockAdmin'
import {
  adminGlassCard,
  adminPageSubtitle,
  adminPageTitle,
  adminStatusColors,
} from '../../components/admin/adminStyles'

function StatusBadge({ stato }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        adminStatusColors[stato] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
      }`}
    >
      {stato}
    </span>
  )
}

function LeadDetailDrawerContent({ lead, onClose, onAssignPartner }) {
  const prefersReducedMotion = useReducedMotion()
  const panelRef = useRef(null)
  const [selectedPartner, setSelectedPartner] = useState(lead.partnerAssegnato || '')

  const transition = prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 34, stiffness: 400 }

  const handleSave = () => {
    onAssignPartner(lead.id, selectedPartner || null)
    onClose()
  }

  return (
    <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={transition}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-white">{lead.utente}</h2>
                <p className="font-mono text-xs text-zinc-500">{lead.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Esigenza</p>
                <p className="mt-1 text-sm text-white">{lead.esigenza}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">AI Match</p>
                <p className="mt-1 text-sm text-cyan-400">{lead.aiMatch}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.telefono}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Note</p>
                <p className="mt-1 text-sm text-zinc-400">{lead.note}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Stato</p>
                <div className="mt-1.5">
                  <StatusBadge stato={lead.stato} />
                </div>
              </div>

              <div>
                <label htmlFor="partner-override" className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Override manuale — Assegna partner
                </label>
                <select
                  id="partner-override"
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white backdrop-blur-xl focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                >
                  <option value="">— Nessun partner —</option>
                  {adminPartnersList.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-zinc-600">Creato: {lead.createdAt}</p>
            </div>

            <div className="shrink-0 border-t border-white/10 p-4">
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-opacity hover:opacity-90"
              >
                Salva assegnazione
              </button>
            </div>
          </motion.aside>
  )
}

function LeadDetailDrawer({ lead, open, onClose, onAssignPartner }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!lead) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label="Chiudi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <LeadDetailDrawerContent
            key={lead.id}
            lead={lead}
            onClose={onClose}
            onAssignPartner={onAssignPartner}
          />
        </div>
      )}
    </AnimatePresence>
  )
}

export default function LeadRouter() {
  const [leads, setLeads] = useState(mockAdminLeads)
  const [selectedLead, setSelectedLead] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openLead = (lead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const handleAssignPartner = (leadId, partner) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              partnerAssegnato: partner,
              stato: partner ? 'Assegnato' : l.stato,
              aiMatch: partner ? `${partner} (override)` : l.aiMatch,
            }
          : l,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Lead Router</h1>
        <p className={adminPageSubtitle}>
          Routing lead in tempo reale — clicca una riga per i dettagli e override manuale
        </p>
      </div>

      <div className={`${adminGlassCard} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 sm:px-5">ID</th>
                <th className="px-4 py-3 sm:px-5">Utente</th>
                <th className="hidden px-4 py-3 sm:table-cell sm:px-5">Esigenza</th>
                <th className="hidden px-4 py-3 md:table-cell md:px-5">AI Match</th>
                <th className="px-4 py-3 sm:px-5">Stato</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  className="cursor-pointer border-b border-white/5 transition-colors hover:bg-cyan-500/5 last:border-0"
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-zinc-500 sm:px-5">{lead.id}</td>
                  <td className="px-4 py-3.5 font-medium text-white sm:px-5">{lead.utente}</td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3.5 text-zinc-400 sm:table-cell sm:px-5">
                    {lead.esigenza}
                  </td>
                  <td className="hidden px-4 py-3.5 text-cyan-400/80 md:table-cell md:px-5">{lead.aiMatch}</td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <StatusBadge stato={lead.stato} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAssignPartner={handleAssignPartner}
      />
    </div>
  )
}
