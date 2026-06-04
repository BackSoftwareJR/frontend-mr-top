import { useMemo, useState } from 'react'
import { CheckCircle2, Filter, Loader2, Lock, MapPin, Wallet } from 'lucide-react'
import B2BLoadError from '../../components/b2b/B2BLoadError'
import B2BModal from '../../components/b2b/B2BModal'
import {
  b2bCard,
  b2bEmptyState,
  b2bIconAccent,
  b2bInputFocus,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
  b2bSecondaryBtn,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
} from '../../components/b2b/b2bStyles'
import { useB2B } from '../../context/B2BContext'
import { isApiConfigured } from '../../services/apiClient'

function ObfuscatedField({ value }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <span className="select-none text-sm text-charcoal-muted blur-md">{value}</span>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/50 backdrop-blur-md" />
    </div>
  )
}

function ContactField({ label, value, unlocked }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-medium text-charcoal-muted">{label}</p>
      {unlocked ? (
        <p className="text-sm font-medium text-charcoal">{value}</p>
      ) : (
        <ObfuscatedField value={value} />
      )}
    </div>
  )
}

function MatchBadge({ score }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-violet/15 px-2.5 py-0.5 text-xs font-semibold text-accent-violet-dark ring-1 ring-accent-violet/25">
      {score}% Compatibile
    </span>
  )
}

function LeadCard({ lead, onUnlock, walletBalance, onRecharge }) {
  const canAfford = walletBalance >= lead.unlockCost
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  const handleCloseConfirm = () => {
    if (!unlocking) setConfirmOpen(false)
  }

  const handleConfirm = async () => {
    setUnlocking(true)
    const ok = await onUnlock(lead.id)
    setUnlocking(false)
    if (ok) setConfirmOpen(false)
  }

  return (
    <>
      <article className={`${b2bCard} p-5 transition-shadow hover:shadow-md`}>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <MatchBadge score={lead.matchScore} />
            {lead.unlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                <CheckCircle2 className="h-3 w-3" />
                Sbloccato
              </span>
            )}
          </div>
          <span className="text-xs text-charcoal-muted">{lead.id}</span>
        </div>

        <div className="mb-4 space-y-2">
          <ContactField label="Nome" value={lead.name} unlocked={lead.unlocked} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ContactField label="Telefono" value={lead.phone} unlocked={lead.unlocked} />
            <ContactField label="Email" value={lead.email} unlocked={lead.unlocked} />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-sm text-charcoal-muted">
          <span className="inline-flex items-center gap-1.5">
            <Wallet className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
            {lead.budget}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
            {lead.location}
          </span>
        </div>

        <p className="mb-4 text-sm text-charcoal-muted">{lead.need}</p>

        {lead.unlocked ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
            <CheckCircle2 className="h-4 w-4" />
            Contatto in Il Mio CRM
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (canAfford ? setConfirmOpen(true) : onRecharge())}
            className={`flex w-full items-center justify-center gap-2 ${b2bPrimaryBtn} ${!canAfford ? '!bg-amber-500 hover:!bg-amber-600' : ''}`}
          >
            <Lock className="h-3.5 w-3.5" />
            {canAfford
              ? `Sblocca Contatto (-${lead.unlockCost}€)`
              : 'Credito insufficiente — Ricarica'}
          </button>
        )}
      </article>

      <B2BModal open={confirmOpen} onClose={handleCloseConfirm} title="Conferma sblocco" size="sm">
        <p className="mb-4 text-sm text-charcoal-muted">
          Sbloccare <strong className="text-charcoal">{lead.name}</strong> costerà{' '}
          <strong>€ {lead.unlockCost},00</strong> dal credito wallet.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCloseConfirm}
            disabled={unlocking}
            className={b2bSecondaryBtn}
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={unlocking}
            className={`flex items-center gap-2 ${b2bPrimaryBtn}`}
          >
            {unlocking && <Loader2 className="h-4 w-4 animate-spin" />}
            Conferma
          </button>
        </div>
      </B2BModal>
    </>
  )
}

export default function LeadMarketplace() {
  const {
    marketplaceLeads,
    walletBalance,
    unlockLead,
    openRechargeModal,
    loading,
    initError,
    retryInit,
    useApi,
  } = useB2B()
  const [locationFilter, setLocationFilter] = useState('')
  const [scoreSegment, setScoreSegment] = useState('all')
  const [availableOnly, setAvailableOnly] = useState(false)

  const locations = useMemo(
    () => [...new Set(marketplaceLeads.map((l) => l.location))].sort(),
    [marketplaceLeads]
  )

  const filteredLeads = useMemo(() => {
    const minScore = scoreSegment === '90' ? 90 : scoreSegment === '85' ? 85 : scoreSegment === '80' ? 80 : 0
    return marketplaceLeads.filter((lead) => {
      const matchesLocation = !locationFilter || lead.location === locationFilter
      const matchesScore = !minScore || lead.matchScore >= minScore
      const matchesAvailability = !availableOnly || !lead.unlocked
      return matchesLocation && matchesScore && matchesAvailability
    })
  }, [marketplaceLeads, locationFilter, scoreSegment, availableOnly])

  const lockedCount = marketplaceLeads.filter((l) => !l.unlocked).length

  if (isApiConfigured() && loading && !useApi && !initError) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-charcoal-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Caricamento marketplace…</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className={b2bPageTitle}>Marketplace Lead</h1>
        <p className={b2bPageSubtitle}>
          {lockedCount} disponibili · Sblocca con il credito wallet
        </p>
      </div>

      {isApiConfigured() && initError ? (
        <B2BLoadError message={initError} onRetry={retryInit} />
      ) : (
        <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal-muted">
          <Filter className="h-3.5 w-3.5" />
          Filtri
        </div>
        <div className={b2bSegmented}>
          {[
            { id: 'all', label: 'Tutti' },
            { id: '90', label: '≥ 90%' },
            { id: '85', label: '≥ 85%' },
            { id: '80', label: '≥ 80%' },
          ].map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setScoreSegment(seg.id)}
              className={scoreSegment === seg.id ? b2bSegmentedActive : b2bSegmentedInactive}
            >
              {seg.label}
            </button>
          ))}
        </div>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className={`max-w-xs rounded-xl border border-black/5 bg-white/90 px-3 py-2.5 text-sm text-charcoal ${b2bInputFocus}`}
        >
          <option value="">Tutte le località</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-accent-coral focus:ring-accent-coral/30"
          />
          Solo disponibili
        </label>
      </div>

      {filteredLeads.length === 0 ? (
        <div className={b2bEmptyState}>
          <p className="text-sm font-medium text-charcoal">Nessun lead corrisponde ai filtri</p>
          <p className="mt-1 text-sm text-charcoal-muted">Prova a modificare località o compatibilità.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUnlock={unlockLead}
              walletBalance={walletBalance}
              onRecharge={openRechargeModal}
            />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}
