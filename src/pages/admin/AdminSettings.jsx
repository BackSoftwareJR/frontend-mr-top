import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bell, ChevronDown, Layers, Loader2, Shield, ShieldAlert, Webhook, Zap } from 'lucide-react'
import {
  fetchAdminErasureRequestsWithFallback,
  fetchAdminSectorsWithFallback,
  fetchAdminSettingsWithFallback,
  fetchAdminWebhookEventsWithFallback,
  patchAdminErasureRequest,
  patchAdminSector,
  patchAdminSettings,
} from '../../services/adminService'
import { isApiConfigured } from '../../services/apiClient'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

const INPUT_CLASS =
  'mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white backdrop-blur-xl focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20'

const EMPTY_SETTINGS = {
  security: { otpTtlMinutes: 10 },
  automations: { autoMatchOnLead: true },
  notifications: { adminEmail: '' },
}

function SettingsSection({ icon: Icon, title, description, accent, open, onToggle, children }) {
  return (
    <div className={`${adminGlassCard} overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-all hover:border-white/15 sm:p-5"
      >
        <div className={`rounded-xl border border-white/10 bg-white/5 p-2.5 ${accent}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white sm:text-base">{title}</h2>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{description}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">{children}</div>}
    </div>
  )
}

export default function AdminSettings() {
  const [searchParams] = useSearchParams()
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [sectors, setSectors] = useState([])
  const [erasureQueue, setErasureQueue] = useState({ pendingCount: 0, processingCount: 0, erasureRequests: [] })
  const [webhookEvents, setWebhookEvents] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [erasureLoading, setErasureLoading] = useState(false)
  const [webhooksLoading, setWebhooksLoading] = useState(false)
  const [erasureActionId, setErasureActionId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sectorSavingId, setSectorSavingId] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const urlSection = searchParams.get('section')
  const [userSection, setUserSection] = useState(null)
  const openSection = urlSection ?? userSection ?? 'security'

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) setLoading(true)
      try {
        const [settingsData, sectorsData] = await Promise.all([
          fetchAdminSettingsWithFallback(),
          fetchAdminSectorsWithFallback(),
        ])
        if (cancelled) return
        setSettings(settingsData)
        setSectors(sectorsData)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function loadErasureQueue() {
    setErasureLoading(true)
    try {
      const data = await fetchAdminErasureRequestsWithFallback()
      setErasureQueue(data)
    } finally {
      setErasureLoading(false)
    }
  }

  useEffect(() => {
    if (openSection !== 'privacy') return

    let cancelled = false

    async function load() {
      setErasureLoading(true)
      try {
        const data = await fetchAdminErasureRequestsWithFallback()
        if (!cancelled) setErasureQueue(data)
      } finally {
        if (!cancelled) setErasureLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [openSection])

  useEffect(() => {
    if (openSection !== 'webhooks') return

    let cancelled = false

    async function load() {
      setWebhooksLoading(true)
      try {
        const data = await fetchAdminWebhookEventsWithFallback({ per_page: 50 })
        if (!cancelled) setWebhookEvents(data.events)
      } finally {
        if (!cancelled) setWebhooksLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [openSection])

  async function handleErasureAction(id, action) {
    if (!isApiConfigured()) return

    setErasureActionId(id)
    setSaveMessage('')
    try {
      await patchAdminErasureRequest(id, { action })
      await loadErasureQueue()
      setSaveMessage(
        action === 'approve'
          ? 'Richiesta approvata.'
          : action === 'reject'
            ? 'Richiesta rifiutata.'
            : 'Richiesta segnata come revisionata.',
      )
    } catch {
      setSaveMessage('Azione DSAR non riuscita. Riprova.')
    } finally {
      setErasureActionId(null)
    }
  }

  async function handleSaveSettings() {
    setSaving(true)
    setSaveMessage('')
    try {
      const updated = isApiConfigured()
        ? await patchAdminSettings(settings)
        : settings
      setSettings(updated)
      setSaveMessage('Impostazioni salvate.')
    } catch {
      setSaveMessage('Salvataggio non riuscito. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSectorToggle(sector) {
    const nextActive = !sector.isActive
    setSectorSavingId(sector.id)
    setSectors((prev) =>
      prev.map((s) => (s.id === sector.id ? { ...s, isActive: nextActive } : s)),
    )

    try {
      if (isApiConfigured()) {
        await patchAdminSector(sector.id, { isActive: nextActive })
      }
    } catch {
      setSectors((prev) =>
        prev.map((s) => (s.id === sector.id ? { ...s, isActive: sector.isActive } : s)),
      )
      setSaveMessage(`Aggiornamento settore "${sector.name}" non riuscito.`)
    } finally {
      setSectorSavingId(null)
    }
  }

  function toggleSection(key) {
    setUserSection((prev) => (prev === key ? '' : key))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className={adminPageTitle}>Impostazioni</h1>
          <p className={adminPageSubtitle}>Configurazione God Mode — area riservata Super Admin</p>
        </div>
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-label="Caricamento impostazioni" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Impostazioni</h1>
        <p className={adminPageSubtitle}>Configurazione God Mode — area riservata Super Admin</p>
      </div>

      <div className="space-y-3">
        <SettingsSection
          icon={Shield}
          title="Sicurezza & Accesso"
          description="Gestisci ruoli Super Admin, 2FA e sessioni attive."
          accent="text-cyan-400"
          open={openSection === 'security'}
          onToggle={() => toggleSection('security')}
        >
          <label htmlFor="otp-ttl" className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Durata OTP (minuti)
          </label>
          <input
            id="otp-ttl"
            type="number"
            min={1}
            max={60}
            value={settings.security.otpTtlMinutes}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                security: { otpTtlMinutes: Number(e.target.value) || 1 },
              }))
            }
            className={INPUT_CLASS}
          />
          <p className="mt-2 text-xs text-zinc-600">
            Tempo di validità del codice OTP per accesso admin e partner.
          </p>
        </SettingsSection>

        <SettingsSection
          icon={Zap}
          title="Automazioni AI"
          description="Configura soglie di matching, routing automatico e override."
          accent="text-purple-400"
          open={openSection === 'automations'}
          onToggle={() => toggleSection('automations')}
        >
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.automations.autoMatchOnLead}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  automations: { autoMatchOnLead: e.target.checked },
                }))
              }
              className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-purple-500 focus:ring-purple-500/30"
            />
            <span className="text-sm text-white">Matching automatico all&apos;ingresso lead</span>
          </label>
          <p className="mt-2 text-xs text-zinc-600">
            Se attivo, ogni nuovo lead viene instradato automaticamente dal motore AI.
          </p>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notifiche Piattaforma"
          description="Alert per approvazioni partner, lead urgenti e anomalie."
          accent="text-emerald-400"
          open={openSection === 'notifications'}
          onToggle={() => toggleSection('notifications')}
        >
          <label htmlFor="admin-email" className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Email alert admin
          </label>
          <input
            id="admin-email"
            type="email"
            value={settings.notifications.adminEmail}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                notifications: { adminEmail: e.target.value },
              }))
            }
            className={INPUT_CLASS}
            placeholder="admin@wenando.com"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Destinatario per notifiche critiche e approvazioni in sospeso.
          </p>
        </SettingsSection>

        <SettingsSection
          icon={ShieldAlert}
          title="Privacy & DSAR"
          description="Coda richieste cancellazione dati (Art. 17 GDPR)."
          accent="text-rose-400"
          open={openSection === 'privacy'}
          onToggle={() => toggleSection('privacy')}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">
              {erasureQueue.pendingCount} in attesa
            </span>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
              {erasureQueue.processingCount} in elaborazione
            </span>
          </div>

          {erasureLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" aria-label="Caricamento coda DSAR" />
            </div>
          ) : erasureQueue.erasureRequests.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessuna richiesta di cancellazione in coda.</p>
          ) : (
            <ul className="space-y-2">
              {erasureQueue.erasureRequests.map((request) => (
                <li
                  key={request.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {request.user.email || request.user.name || `Richiesta #${request.id}`}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {request.status === 'processing' ? 'In elaborazione' : 'In attesa'} ·{' '}
                        {request.requestedAt
                          ? new Intl.DateTimeFormat('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(request.requestedAt))
                          : '—'}
                      </p>
                      {request.reason && (
                        <p className="mt-1 text-xs text-zinc-400">{request.reason}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={erasureActionId === request.id}
                            onClick={() => handleErasureAction(request.id, 'approve')}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            Approva
                          </button>
                          <button
                            type="button"
                            disabled={erasureActionId === request.id}
                            onClick={() => handleErasureAction(request.id, 'reject')}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            Rifiuta
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={erasureActionId === request.id}
                        onClick={() => handleErasureAction(request.id, 'review')}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        Revisionata
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-xs text-zinc-600">
            Le notifiche God Mode includono anche le richieste DSAR in sospeso.{' '}
            <Link to="/admin/settings?section=privacy" className="text-cyan-400 hover:underline">
              Apri coda privacy
            </Link>
          </p>
        </SettingsSection>

        <SettingsSection
          icon={Webhook}
          title="Webhook pagamenti"
          description="Registro eventi PSP — ultimi 50 (sola lettura)."
          accent="text-sky-400"
          open={openSection === 'webhooks'}
          onToggle={() => toggleSection('webhooks')}
        >
          {webhooksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" aria-label="Caricamento webhook" />
            </div>
          ) : webhookEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessun evento webhook registrato.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                    <th className="pb-2 pr-3 font-medium">Data</th>
                    <th className="pb-2 pr-3 font-medium">Provider</th>
                    <th className="pb-2 pr-3 font-medium">Evento</th>
                    <th className="pb-2 pr-3 font-medium">Stato</th>
                    <th className="pb-2 font-medium">Payment intent</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookEvents.map((event) => (
                    <tr key={event.id} className="border-b border-white/5 text-zinc-300">
                      <td className="py-2 pr-3 whitespace-nowrap text-zinc-400">
                        {event.createdAt
                          ? new Intl.DateTimeFormat('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(event.createdAt))
                          : '—'}
                      </td>
                      <td className="py-2 pr-3 font-mono">{event.provider}</td>
                      <td className="py-2 pr-3 font-mono text-[11px]">{event.eventType}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${
                            event.status === 'processed'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {event.status === 'processed' ? 'OK' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[11px] text-zinc-400">
                        {event.paymentIntentId ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          icon={Layers}
          title="Settori"
          description="Attiva o disattiva settori verticali sulla piattaforma."
          accent="text-amber-400"
          open={openSection === 'sectors'}
          onToggle={() => toggleSection('sectors')}
        >
          {sectors.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessun settore configurato.</p>
          ) : (
            <ul className="space-y-2">
              {sectors.map((sector) => (
                <li
                  key={sector.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{sector.name}</p>
                    <p className="font-mono text-[11px] text-zinc-500">{sector.slug}</p>
                  </div>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2">
                    {sectorSavingId === sector.id && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" aria-hidden />
                    )}
                    <input
                      type="checkbox"
                      checked={sector.isActive}
                      disabled={sectorSavingId === sector.id}
                      onChange={() => handleSectorToggle(sector)}
                      className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/30"
                    />
                    <span className="text-xs text-zinc-400">{sector.isActive ? 'Attivo' : 'Off'}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </SettingsSection>
      </div>

      <div className={`${adminGlassCard} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}>
        <p className="text-xs text-zinc-500">
          Wenando God Mode v1.0 — Super Admin Dashboard.
          {saveMessage && <span className="mt-1 block text-emerald-400">{saveMessage}</span>}
        </p>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : 'Salva impostazioni'}
        </button>
      </div>
    </div>
  )
}
