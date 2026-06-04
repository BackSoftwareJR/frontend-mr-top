import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, MapPin, Shield, TrendingUp, Wallet } from 'lucide-react'
import {
  fetchPortfolioAllocationWithFallback,
  fetchPortfolioPartnersWithFallback,
  fetchPortfolioSummaryWithFallback,
  fetchRiskIndicatorsWithFallback,
} from '../../services/adminService'
import { ApiError, isApiConfigured } from '../../services/apiClient'
import AdminLoadError from '../../components/admin/AdminLoadError'
import AdminDonutChart from '../../components/admin/AdminDonutChart'
import PartnerSparkline from '../../components/admin/PartnerSparkline'
import {
  adminGlassCard,
  adminPageSubtitle,
  adminPageTitle,
  adminRiskColors,
} from '../../components/admin/adminStyles'

const TIER_COLORS = {
  Enterprise: '#22d3ee',
  Growth: '#a855f7',
  Starter: '#71717a',
  standard: '#71717a',
  premium: '#22d3ee',
}

const EMPTY_SUMMARY = {
  totalAum: '—',
  revenueUnderManagement: '—',
  monthlyGrowth: '—',
  activeContracts: '—',
  avgExposure: '—',
}

const EMPTY_ALLOCATION = { bySector: [], byRegion: [], byTier: [] }

function RiskIndicatorCard({ indicator }) {
  const colorClass = adminRiskColors[indicator.status] || 'text-zinc-400'

  return (
    <div className={`${adminGlassCard} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-zinc-500">{indicator.label}</p>
        {indicator.status === 'alert' && (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
        )}
        {indicator.status === 'warn' && (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        )}
      </div>
      <p className={`mt-2 text-xl font-semibold ${colorClass}`}>{indicator.value}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{indicator.detail}</p>
    </div>
  )
}

function PartnerHoldingCard({ partner }) {
  const tierColor = TIER_COLORS[partner.tier] || '#22d3ee'

  return (
    <article
      className={`${adminGlassCard} p-4 transition-all hover:border-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white sm:text-base">{partner.nome}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {partner.citta || '—'}
            <span className="text-zinc-700">·</span>
            <span style={{ color: tierColor }}>{partner.tier}</span>
          </div>
        </div>
        {partner.trend?.length > 0 && (
          <PartnerSparkline values={partner.trend} color={tierColor} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-zinc-500">AUM</p>
          <p className="mt-0.5 font-semibold text-white">{partner.aum || '—'}</p>
        </div>
        <div>
          <p className="text-zinc-500">Esposizione</p>
          <p className="mt-0.5 font-semibold text-white">{partner.exposure || '—'}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Performance revenue</span>
          <span className="font-medium text-cyan-400">{partner.revenueShare}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
            style={{ width: `${partner.revenueShare}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Shield className="h-3 w-3 text-zinc-500" />
        <span className="text-[11px] text-zinc-500">Rischio</span>
        <span className={`text-xs font-medium ${adminRiskColors[partner.risk] || 'text-zinc-400'}`}>
          {partner.risk}
        </span>
      </div>
    </article>
  )
}

export default function AdminPortfolio() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [allocation, setAllocation] = useState(EMPTY_ALLOCATION)
  const [partners, setPartners] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) {
        setLoading(true)
        setLoadError(null)
      }
      try {
        const [summaryData, allocationData, partnersData, risksData] = await Promise.all([
          fetchPortfolioSummaryWithFallback(),
          fetchPortfolioAllocationWithFallback(),
          fetchPortfolioPartnersWithFallback(),
          fetchRiskIndicatorsWithFallback(),
        ])
        if (cancelled) return
        setSummary(summaryData)
        setAllocation(allocationData)
        setPartners(partnersData)
        setRisks(risksData)
      } catch (err) {
        if (!cancelled && isApiConfigured()) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare il portafoglio. Verifica la connessione e riprova.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [retryCount])

  const topPerformers = [...partners]
    .sort((a, b) => b.revenueShare - a.revenueShare)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Portafoglio</h1>
        <p className={adminPageSubtitle}>
          AUM da transazioni completate — trend mensili e indicatori rischio da API
        </p>
      </div>

      {loadError && !loading ? (
        <AdminLoadError message={loadError} onRetry={() => setRetryCount((n) => n + 1)} />
      ) : null}

      {loading ? (
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-label="Caricamento portafoglio" />
        </div>
      ) : loadError ? null : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`${adminGlassCard} p-4 sm:p-5`}>
              <div className="flex items-center gap-2 text-zinc-500">
                <Wallet className="h-4 w-4 text-cyan-400" />
                <p className="text-xs font-medium uppercase tracking-wider">AUM totale</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {summary.totalAum}
              </p>
              <p className="mt-1 text-xs text-emerald-400">{summary.monthlyGrowth} mese</p>
            </div>
            <div className={`${adminGlassCard} p-4 sm:p-5`}>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Revenue gestito
              </p>
              <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {summary.revenueUnderManagement}
              </p>
              <p className="mt-1 text-xs text-zinc-500">MRR corrente</p>
            </div>
            <div className={`${adminGlassCard} p-4 sm:p-5`}>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Contratti attivi
              </p>
              <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {summary.activeContracts}
              </p>
            </div>
            <div className={`${adminGlassCard} p-4 sm:p-5`}>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Esposizione media
              </p>
              <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {summary.avgExposure}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminDonutChart
              title="Allocazione per categoria"
              subtitle="Mix revenue per tipo struttura"
              segments={allocation.bySector}
            />
            <AdminDonutChart
              title="Allocazione per tier"
              subtitle="Enterprise · Growth · Starter"
              segments={allocation.byTier}
            />
          </div>

          {topPerformers.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Top performer</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {topPerformers.map((p, i) => (
                  <div
                    key={p.id}
                    className={`${adminGlassCard} flex items-center gap-3 p-4`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-sm font-bold text-cyan-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{p.nome}</p>
                      <p className="text-xs text-zinc-500">{p.revenueShare}% performance</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-white">Holdings partner B2B</h2>
            {partners.length === 0 ? (
              <div className={`${adminGlassCard} py-12 text-center text-sm text-zinc-500`}>
                Nessun partner approvato nel portafoglio.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {partners.map((partner) => (
                  <PartnerHoldingCard key={partner.id} partner={partner} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-white">Rischio ed esposizione</h2>
            {risks.length === 0 ? (
              <div className={`${adminGlassCard} py-12 text-center text-sm text-zinc-500`}>
                Nessun indicatore di rischio disponibile.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {risks.map((ind) => (
                  <RiskIndicatorCard key={ind.label} indicator={ind} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
