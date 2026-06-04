export const DAYS = [
  { id: 'mon', label: 'Lun' },
  { id: 'tue', label: 'Mar' },
  { id: 'wed', label: 'Mer' },
  { id: 'thu', label: 'Gio' },
  { id: 'fri', label: 'Ven' },
  { id: 'sat', label: 'Sab' },
  { id: 'sun', label: 'Dom' },
]

export const SCHEDULE_PRESETS = [
  { id: 'mattina', label: 'Mattina', slots: '08:00-12:00' },
  { id: 'pomeriggio', label: 'Pomeriggio', slots: '14:00-18:00' },
  { id: 'giornata', label: 'Giornata', slots: '08:00-18:00' },
  { id: 'h24', label: 'H24', slots: '00:00-23:59' },
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
