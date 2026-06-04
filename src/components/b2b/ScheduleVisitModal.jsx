import { useState } from 'react'
import B2BModal from './B2BModal'
import { b2bInputFocus, b2bPrimaryBtn, b2bSecondaryBtn } from './b2bStyles'

const inputClass = `w-full rounded-xl border border-black/5 bg-white/90 px-3 py-2.5 text-sm ${b2bInputFocus}`

export default function ScheduleVisitModal({
  client,
  clients = [],
  open,
  onClose,
  onSchedule,
  initialDate = '',
  initialTime = '10:00',
}) {
  const [clientId, setClientId] = useState(client?.id ?? '')
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)
  const [note, setNote] = useState('')

  const selectedClient = client ?? clients.find((item) => item.id === clientId)
  const titleClient = selectedClient?.cliente ?? 'Nuova visita'

  const handleSubmit = (e) => {
    e.preventDefault()
    const targetId = client?.id ?? clientId
    if (!targetId || !date || !time) return
    onSchedule(targetId, date, time, note)
    onClose()
  }

  return (
    <B2BModal open={open} onClose={onClose} title={`Pianifica visita · ${titleClient}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!client && clients.length > 0 && (
          <div>
            <label htmlFor="visit-client" className="mb-1 block text-xs font-medium text-charcoal-muted">
              Cliente
            </label>
            <select
              id="visit-client"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleziona cliente</option>
              {clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.cliente}
                </option>
              ))}
            </select>
          </div>
        )}
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
