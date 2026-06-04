import { MotionDiv } from '../../../utils/motionProxy'
import { Clock, Copy, Settings2 } from 'lucide-react'
import DynamicFormField from './DynamicFormField'
import { DAYS, OPERATIONS_FORM_CONFIG, SCHEDULE_PRESETS } from '../../../constants/b2bOperationsConfig'
import { obBadge, obGlassCard, obLabel, obSecondaryBtn } from '../onboardingStyles'

const SECTOR_LABELS = {
  rsa: 'RSA / Residenza',
  adi: 'Assistenza domiciliare',
  centro: 'Centro diurno',
  clinica: 'Clinica / Ambulatorio',
}

function slotsFromPresets(activePresetIds) {
  return SCHEDULE_PRESETS.filter((p) => activePresetIds.includes(p.id))
    .map((p) => p.slots)
    .join(', ')
}

function activePresetsForSlots(slots) {
  if (!slots?.trim()) return []
  const normalized = slots.replace(/\s/g, '')
  return SCHEDULE_PRESETS.filter((p) => normalized.includes(p.slots.replace(/\s/g, ''))).map(
    (p) => p.id,
  )
}

function DayToggle({ day, isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day.id, !isOpen)}
      className={`min-w-[3rem] rounded-xl px-3 py-2 text-sm font-semibold transition ${
        isOpen
          ? 'bg-teal-800 text-white shadow-sm'
          : 'bg-white/80 text-charcoal-muted ring-1 ring-black/5 hover:bg-warm-cream'
      }`}
      aria-pressed={isOpen}
    >
      {day.label}
    </button>
  )
}

function ScheduleDayEditor({ day, entry, onChange }) {
  const presets = activePresetsForSlots(entry.slots)
  const customFrom = entry.customFrom ?? ''
  const customTo = entry.customTo ?? ''

  const applyPresets = (presetId) => {
    const next = presets.includes(presetId)
      ? presets.filter((id) => id !== presetId)
      : [...presets, presetId]
    onChange({ ...entry, open: true, slots: slotsFromPresets(next), presetIds: next })
  }

  const applyCustomRange = () => {
    if (!customFrom || !customTo) return
    onChange({ ...entry, open: true, slots: `${customFrom}-${customTo}`, presetIds: [] })
  }

  if (!entry.open) return null

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-warm-cream/60 p-3">
      <p className="text-xs font-medium text-charcoal-muted">Fasce per {day.label}</p>
      <div className="flex flex-wrap gap-2">
        {SCHEDULE_PRESETS.map((preset) => {
          const active = presets.includes(preset.id)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPresets(preset.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-accent-amber/20 text-accent-amber-dark ring-1 ring-accent-amber/40'
                  : 'bg-white text-charcoal-muted ring-1 ring-black/5 hover:bg-white/90'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-charcoal-muted">
          Dalle
          <input
            type="time"
            value={customFrom}
            onChange={(e) => onChange({ ...entry, customFrom: e.target.value })}
            className="mt-1 block rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-charcoal"
          />
        </label>
        <label className="text-xs text-charcoal-muted">
          Alle
          <input
            type="time"
            value={customTo}
            onChange={(e) => onChange({ ...entry, customTo: e.target.value })}
            className="mt-1 block rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-charcoal"
          />
        </label>
        <button
          type="button"
          onClick={applyCustomRange}
          disabled={!customFrom || !customTo}
          className={`${obSecondaryBtn} !w-auto !py-2 !text-xs`}
        >
          Applica fascia
        </button>
      </div>
      {entry.slots && (
        <p className="text-xs text-charcoal">
          <span className="font-medium">Riepilogo:</span> {entry.slots}
        </p>
      )}
    </div>
  )
}

export default function StepOperations({ data, onChange }) {
  const schedule = data.schedule ?? {}
  const dynamicValues = data.dynamic ?? {}

  const handleDynamic = (id, value) => {
    const patch = { dynamic: { ...dynamicValues, [id]: value } }
    if (id === 'sector' && value !== dynamicValues.sector) {
      patch.trustAnswers = {}
    }
    onChange(patch)
  }

  const handleDayToggle = (dayId, open) => {
    onChange({
      schedule: {
        ...schedule,
        [dayId]: {
          ...schedule[dayId],
          open,
          slots: open ? (schedule[dayId]?.slots ?? '08:00-18:00') : '',
        },
      },
    })
  }

  const handleDayChange = (dayId, entry) => {
    onChange({
      schedule: {
        ...schedule,
        [dayId]: entry,
      },
    })
  }

  const copyWeekdaysToAll = () => {
    const template = schedule.mon?.open ? schedule.mon : schedule.tue
    if (!template?.open) return

    const next = { ...schedule }
    DAYS.forEach(({ id }) => {
      next[id] = { ...template, open: true }
    })
    onChange({ schedule: next })
  }

  const applyPresetToOpenDays = (presetId) => {
    const preset = SCHEDULE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    const next = { ...schedule }
    DAYS.forEach(({ id }) => {
      if (next[id]?.open) {
        next[id] = { ...next[id], open: true, slots: preset.slots }
      }
    })
    onChange({ schedule: next })
  }

  const openDays = DAYS.filter(({ id }) => schedule[id]?.open)

  return (
    <div className="space-y-6">
      <MotionDiv
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
            Indica settore, capacità e disponibilità — pochi clic per completare gli orari.
          </p>
          {dynamicValues.sector && (
            <span className={`${obBadge} mt-2`}>
              {SECTOR_LABELS[dynamicValues.sector] ?? dynamicValues.sector}
            </span>
          )}
        </div>
      </MotionDiv>

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
            <p className="text-sm font-semibold text-charcoal">Orari e disponibilità</p>
            <p className="text-xs text-charcoal-muted">
              Attiva i giorni lavorativi e scegli preset rapidi o fasce personalizzate
            </p>
          </div>
        </div>

        <p className={obLabel}>Giorni attivi</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <DayToggle
              key={day.id}
              day={day}
              isOpen={Boolean(schedule[day.id]?.open)}
              onToggle={handleDayToggle}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={copyWeekdaysToAll} className={`${obSecondaryBtn} !w-auto !text-xs`}>
            <Copy className="h-3.5 w-3.5" />
            Copia Lun su tutti
          </button>
          {SCHEDULE_PRESETS.slice(0, 3).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPresetToOpenDays(preset.id)}
              className={`${obSecondaryBtn} !w-auto !text-xs`}
            >
              {preset.label} su giorni attivi
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-1 divide-y divide-black/5">
          {openDays.length === 0 ? (
            <p className="py-3 text-sm text-charcoal-muted">
              Seleziona almeno un giorno per configurare le fasce orarie.
            </p>
          ) : (
            openDays.map((day) => (
              <div key={day.id} className="py-2">
                <p className="text-sm font-semibold text-charcoal">{day.label}</p>
                <ScheduleDayEditor
                  day={day}
                  entry={schedule[day.id] ?? { open: true, slots: '' }}
                  onChange={(entry) => handleDayChange(day.id, entry)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
