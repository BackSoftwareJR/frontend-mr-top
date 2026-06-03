import { useMemo, useState } from 'react'
import { Calendar, Mail, MapPin, Phone, Search, User } from 'lucide-react'
import InfoDrawer from '../../components/ui/InfoDrawer'
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
} from '../../components/b2b/b2bStyles'
import { CRM_STATUSES, statusPillStyles } from '../../data/mockB2B'
import { useB2B } from '../../context/B2BContext'

const inputClass = `w-full rounded-xl border border-black/5 bg-white/90 px-3 py-2.5 text-sm ${b2bInputFocus}`

function StatusSelect({ value, onChange }) {
  const style = statusPillStyles[value] || statusPillStyles.Nuovo

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-coral/20 ${style}`}
    >
      {CRM_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}

function ScheduleModal({ client, open, onClose, onSchedule }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!date || !time) return
    onSchedule(client.id, date, time, note)
    onClose()
    setDate('')
    setTime('10:00')
    setNote('')
  }

  if (!client) return null

  return (
    <B2BModal open={open} onClose={onClose} title={`Pianifica visita · ${client.cliente}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="visit-date" className="mb-1 block text-xs font-medium text-charcoal-muted">
              Data
            </label>
            <input
              id="visit-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="visit-time" className="mb-1 block text-xs font-medium text-charcoal-muted">
              Ora
            </label>
            <input
              id="visit-time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="visit-note" className="mb-1 block text-xs font-medium text-charcoal-muted">
            Note
          </label>
          <textarea
            id="visit-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Es. Prima visita in struttura"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={b2bSecondaryBtn}>
            Annulla
          </button>
          <button type="submit" className={b2bPrimaryBtn}>
            Conferma visita
          </button>
        </div>
      </form>
    </B2BModal>
  )
}

function CallModal({ client, open, onClose }) {
  if (!client) return null

  return (
    <B2BModal open={open} onClose={onClose} title={`Chiama ${client.cliente}`} size="sm">
      <p className="mb-4 text-sm text-charcoal-muted">
        Stai per chiamare <strong className="text-charcoal">{client.cliente}</strong>
      </p>
      <p className="mb-6 text-lg font-semibold text-charcoal">{client.phone}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className={`flex-1 ${b2bSecondaryBtn}`}>
          Annulla
        </button>
        <a
          href={`tel:${client.phone?.replace(/\s/g, '')}`}
          onClick={onClose}
          className={`flex flex-1 items-center justify-center gap-2 ${b2bPrimaryBtn}`}
        >
          <Phone className="h-4 w-4" />
          Avvia chiamata
        </a>
      </div>
    </B2BModal>
  )
}

function ClientDetailDrawer({ client, open, onClose }) {
  if (!client) return null

  const style = statusPillStyles[client.stato] || statusPillStyles.Nuovo

  return (
    <InfoDrawer open={open} onClose={onClose} title={client.cliente}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}>
            {client.stato}
          </span>
          <span className="text-xs text-charcoal-muted">{client.id}</span>
        </div>

        <div className="space-y-3">
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-charcoal-muted">
              <Phone className={`h-4 w-4 ${b2bIconAccent}`} />
              <a href={`tel:${client.phone.replace(/\s/g, '')}`} className="hover:text-accent-coral">
                {client.phone}
              </a>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-charcoal-muted">
              <Mail className={`h-4 w-4 ${b2bIconAccent}`} />
              <a href={`mailto:${client.email}`} className="hover:text-accent-coral">
                {client.email}
              </a>
            </div>
          )}
          {client.location && (
            <div className="flex items-center gap-2 text-sm text-charcoal-muted">
              <MapPin className={`h-4 w-4 ${b2bIconAccent}`} />
              {client.location}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-charcoal-muted">Esigenza</p>
          <p className="text-sm text-charcoal">{client.esigenza}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs font-medium text-charcoal-muted">Budget</p>
            <p className="text-sm font-semibold text-charcoal">{client.budget}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-charcoal-muted">Ultima azione</p>
            <p className="text-sm text-charcoal-muted">{client.ultimaAzione}</p>
          </div>
        </div>
      </div>
    </InfoDrawer>
  )
}

function CRMRow({ client, onStatusChange, onCall, onSchedule, onOpenDetail }) {
  return (
    <tr
      className="group cursor-pointer border-b border-black/5 transition-colors hover:bg-black/[0.02]"
      onClick={() => onOpenDetail(client)}
    >
      <td className="whitespace-nowrap px-4 py-3">
        <p className="text-sm font-medium text-charcoal">{client.cliente}</p>
        <p className="text-xs text-charcoal-muted">{client.id}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <StatusSelect value={client.stato} onChange={(stato) => onStatusChange(client.id, stato)} />
      </td>
      <td className="px-4 py-3 text-sm text-charcoal-muted">{client.esigenza}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-charcoal">{client.budget}</td>
      <td className="px-4 py-3 text-sm text-charcoal-muted">{client.ultimaAzione}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCall(client)
            }}
            className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-accent-coral/10 hover:text-accent-coral"
            aria-label={`Chiama ${client.cliente}`}
          >
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSchedule(client)
            }}
            className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-accent-violet/15 hover:text-accent-violet-dark"
            aria-label={`Pianifica visita per ${client.cliente}`}
          >
            <Calendar className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function SmartCRM() {
  const { crmClients, updateCRMStatus, scheduleVisit } = useB2B()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [callClient, setCallClient] = useState(null)
  const [scheduleClient, setScheduleClient] = useState(null)
  const [detailClient, setDetailClient] = useState(null)

  const filteredClients = useMemo(() => {
    return crmClients.filter((client) => {
      const matchesSearch =
        !search ||
        client.cliente.toLowerCase().includes(search.toLowerCase()) ||
        client.esigenza.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || client.stato === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [crmClients, search, statusFilter])

  return (
    <div>
      <div className="mb-6">
        <h1 className={b2bPageTitle}>Il Mio CRM</h1>
        <p className={b2bPageSubtitle}>
          {crmClients.length} clienti · Gestione lead e azioni rapide
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="search"
            placeholder="Cerca per nome o esigenza..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl border border-black/5 bg-white/90 py-2.5 pl-9 pr-3 text-sm ${b2bInputFocus}`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`rounded-xl border border-black/5 bg-white/90 px-3 py-2.5 text-sm text-charcoal ${b2bInputFocus}`}
        >
          <option value="">Tutti gli stati</option>
          {CRM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className={`overflow-hidden ${b2bCard}`}>
        {filteredClients.length === 0 ? (
          <div className={b2bEmptyState}>
            <User className="mb-3 h-8 w-8 text-charcoal-muted/40" />
            <p className="text-sm font-medium text-charcoal">Nessun cliente trovato</p>
            <p className="mt-1 text-sm text-charcoal-muted">
              Modifica i filtri o sblocca lead dal Marketplace Lead.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs font-semibold tracking-wide text-charcoal-muted uppercase">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3">Esigenza</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Ultima Azione</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <CRMRow
                    key={client.id}
                    client={client}
                    onStatusChange={updateCRMStatus}
                    onCall={setCallClient}
                    onSchedule={setScheduleClient}
                    onOpenDetail={setDetailClient}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CallModal client={callClient} open={!!callClient} onClose={() => setCallClient(null)} />
      <ScheduleModal
        client={scheduleClient}
        open={!!scheduleClient}
        onClose={() => setScheduleClient(null)}
        onSchedule={scheduleVisit}
      />
      <ClientDetailDrawer
        client={detailClient}
        open={!!detailClient}
        onClose={() => setDetailClient(null)}
      />
    </div>
  )
}
