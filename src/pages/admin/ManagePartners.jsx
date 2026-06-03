import { useState } from 'react'
import { Check, Eye, MapPin, X } from 'lucide-react'
import { mockPartnerRegistrations } from '../../data/mockAdmin'
import { approvePartner, rejectPartner } from '../../services/adminService'
import { getBearerToken, isApiConfigured } from '../../services/apiClient'
import {
  adminGlassCard,
  adminPageSubtitle,
  adminPageTitle,
  adminStatusColors,
} from '../../components/admin/adminStyles'

function StatusBadge({ stato }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
        adminStatusColors[stato] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
      }`}
    >
      {stato}
    </span>
  )
}

function PartnerCard({ partner, onApprove, onReject, onImpersonate }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className={`group relative ${adminGlassCard} p-4 transition-all hover:border-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] sm:p-5`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white sm:text-base">
            {partner.nomeStruttura}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">P.IVA {partner.partitaIva}</p>
        </div>
        <StatusBadge stato={partner.stato} />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{partner.citta}</span>
        <span className="text-zinc-600">·</span>
        <span>{partner.submittedAt}</span>
      </div>

      <div
        className={`mt-4 flex items-center gap-2 transition-all ${
          hovered ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
        } ${partner.stato !== 'Pending' ? 'pointer-events-none opacity-40' : ''}`}
      >
        <button
          type="button"
          onClick={() => onApprove(partner.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
          title="Approva"
        >
          <Check className="h-3.5 w-3.5" />
          Approva
        </button>
        <button
          type="button"
          onClick={() => onReject(partner.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
          title="Rifiuta"
        >
          <X className="h-3.5 w-3.5" />
          Rifiuta
        </button>
        <button
          type="button"
          onClick={() => onImpersonate(partner)}
          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
          title="Impersonate"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}

export default function ManagePartners() {
  const [partners, setPartners] = useState(mockPartnerRegistrations)
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const handleApprove = async (id) => {
    const partner = partners.find((p) => p.id === id)
    const companyId = partner?.companyId ?? id

    if (isApiConfigured() && getBearerToken() && partner?.companyId) {
      try {
        await approvePartner(companyId)
      } catch (error) {
        if (!import.meta.env.DEV) {
          showToast(error.message ?? 'Approvazione non riuscita')
          return
        }
        console.warn('[Wenando Admin] Approve API failed — mock fallback:', error)
      }
    }

    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stato: 'Active' } : p)),
    )
    showToast('Partner approvato con successo')
  }

  const handleReject = async (id) => {
    const partner = partners.find((p) => p.id === id)
    const companyId = partner?.companyId ?? id

    if (isApiConfigured() && getBearerToken() && partner?.companyId) {
      try {
        await rejectPartner(companyId)
      } catch (error) {
        if (!import.meta.env.DEV) {
          showToast(error.message ?? 'Rifiuto non riuscito')
          return
        }
        console.warn('[Wenando Admin] Reject API failed — mock fallback:', error)
      }
    }

    setPartners((prev) => prev.filter((p) => p.id !== id))
    showToast('Registrazione rifiutata')
  }

  const handleImpersonate = (partner) => {
    showToast(`Impersonating ${partner.nomeStruttura}…`)
  }

  const pendingCount = partners.filter((p) => p.stato === 'Pending').length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={adminPageTitle}>Gestione Partner</h1>
          <p className={adminPageSubtitle}>
            Registrazioni B2B in arrivo — {pendingCount} in attesa di approvazione
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onApprove={handleApprove}
            onReject={handleReject}
            onImpersonate={handleImpersonate}
          />
        ))}
      </div>

      {partners.length === 0 && (
        <div className={`${adminGlassCard} py-16 text-center`}>
          <p className="text-zinc-400">Nessuna registrazione partner in coda.</p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-zinc-900/95 px-4 py-2.5 text-sm text-cyan-400 shadow-2xl backdrop-blur-xl lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  )
}
