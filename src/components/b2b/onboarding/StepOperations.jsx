import { motion } from 'framer-motion'
import { Clock, Settings2 } from 'lucide-react'
import DynamicFormField from './DynamicFormField'
import { obBadge, obGlassCard, obInput, obLabel } from '../onboardingStyles'

const DAYS = [
  { id: 'mon', label: 'Lun' },
  { id: 'tue', label: 'Mar' },
  { id: 'wed', label: 'Mer' },
  { id: 'thu', label: 'Gio' },
  { id: 'fri', label: 'Ven' },
  { id: 'sat', label: 'Sab' },
  { id: 'sun', label: 'Dom' },
]

export const OPERATIONS_FORM_CONFIG = [
  {
    id: 'sector',
    type: 'select',
    label: 'Settore operativo',
    required: true,
    options: [
      { value: 'rsa', label: 'RSA / Residenza' },
      { value: 'adi', label: 'Assistenza domiciliare' },
      { value: 'centro', label: 'Centro diurno' },
      { value: 'clinica', label: 'Clinica / Ambulatorio' },
    ],
  },
  {
    id: 'capacity',
    type: 'number',
    label: 'Posti / slot disponibili al mese',
    placeholder: 'es. 12',
    required: true,
  },
  {
    id: 'nonSelfSufficient',
    type: 'toggle',
    label: 'Accettazione non autosufficienti',
    hint: 'La struttura è equipaggiata per ospiti con bisogni elevati',
  },
  {
    id: 'nightStaff',
    type: 'toggle',
    label: 'Personale notturno certificato',
    hint: 'Presidio H24 per emergenze',
  },
  {
    id: 'notes',
    type: 'textarea',
    label: 'Note operative',
    placeholder: 'Servizi aggiuntivi, limitazioni, ecc.',
    rows: 3,
  },
]

const SECTOR_LABELS = {
  rsa: 'RSA / Residenza',
  adi: 'Assistenza domiciliare',
  centro: 'Centro diurno',
  clinica: 'Clinica / Ambulatorio',
}

function ScheduleRow({ day, schedule, onToggle, onSlotChange }) {
  const entry = schedule[day.id] ?? { open: false, slots: '' }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-black/5 py-3 last:border-0">
      <label className="flex w-14 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={entry.open}
          onChange={(e) => onToggle(day.id, e.target.checked)}
          className="h-4 w-4 rounded-md border-black/10 text-accent-violet-dark focus:ring-accent-violet/25"
        />
        <span className="text-sm font-semibold text-charcoal">{day.label}</span>
      </label>
      <input
        type="text"
        disabled={!entry.open}
        value={entry.slots}
        onChange={(e) => onSlotChange(day.id, e.target.value)}
        placeholder="es. 09:00-12:00, 15:00-18:00"
        className={`${obInput} min-w-[200px] flex-1 disabled:bg-warm-cream/80 disabled:text-charcoal-muted`}
      />
    </div>
  )
}

export default function StepOperations({ data, onChange }) {
  const schedule = data.schedule ?? {}
  const dynamicValues = data.dynamic ?? {}

  const handleDynamic = (id, value) => {
    onChange({ dynamic: { ...dynamicValues, [id]: value } })
  }

  const handleScheduleToggle = (dayId, open) => {
    onChange({
      schedule: {
        ...schedule,
        [dayId]: { ...schedule[dayId], open, slots: schedule[dayId]?.slots ?? '' },
      },
    })
  }

  const handleSlotChange = (dayId, slots) => {
    onChange({
      schedule: {
        ...schedule,
        [dayId]: { ...schedule[dayId], open: true, slots },
      },
    })
  }

  return (
    <div className="space-y-6">
      <motion.div
        className={`${obGlassCard} flex items-start gap-3`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet-dark">
          <Settings2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-charcoal">Configurazione operativa</p>
          <p className="mt-1 text-xs text-charcoal-muted">
            Form dinamico adattato al settore — dati mock già inseriti.
          </p>
          {dynamicValues.sector && (
            <span className={`${obBadge} mt-2`}>
              {SECTOR_LABELS[dynamicValues.sector] ?? dynamicValues.sector}
            </span>
          )}
        </div>
      </motion.div>

      <div className="space-y-4">
        {OPERATIONS_FORM_CONFIG.map((field) => (
          <DynamicFormField
            key={field.id}
            field={field}
            value={dynamicValues[field.id]}
            onChange={handleDynamic}
          />
        ))}
      </div>

      <div className={obGlassCard}>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber-dark">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-charcoal">Schedule Builder</p>
            <p className="text-xs text-charcoal-muted">Orari di apertura e slot per appuntamenti</p>
          </div>
        </div>
        <p className={obLabel}>Giorni e fasce disponibili</p>
        <div className="mt-2">
          {DAYS.map((day) => (
            <ScheduleRow
              key={day.id}
              day={day}
              schedule={schedule}
              onToggle={handleScheduleToggle}
              onSlotChange={handleSlotChange}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
