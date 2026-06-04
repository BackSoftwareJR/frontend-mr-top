/** Offline fallback when VITE_API_URL is unset — mirrors backend curated list subset. */
export const wizardOfflineLocations = [
  { label: 'Milano (MI)', value: 'milano-mi', city: 'Milano', province: 'MI', region: 'Lombardia' },
  { label: 'Milazzo (ME)', value: 'milazzo-me', city: 'Milazzo', province: 'ME', region: 'Sicilia' },
  { label: 'Roma (RM)', value: 'roma-rm', city: 'Roma', province: 'RM', region: 'Lazio' },
  { label: 'Torino (TO)', value: 'torino-to', city: 'Torino', province: 'TO', region: 'Piemonte' },
  { label: 'Napoli (NA)', value: 'napoli-na', city: 'Napoli', province: 'NA', region: 'Campania' },
  { label: 'Bologna (BO)', value: 'bologna-bo', city: 'Bologna', province: 'BO', region: 'Emilia-Romagna' },
  { label: 'Firenze (FI)', value: 'firenze-fi', city: 'Firenze', province: 'FI', region: 'Toscana' },
]

export const wizardConfig = {
  id: 'wenando-intake-v3',
  title: 'Analisi gratuita',
  steps: [
    {
      id: 'autonomy',
      type: 'cards',
      question: 'Qual è il livello di autonomia?',
      options: [
        { value: 'autosufficiente', label: 'Autosufficiente' },
        { value: 'parziale', label: 'Parziale' },
        { value: 'non-autosufficiente', label: 'Non Autosufficiente' },
      ],
    },
    {
      id: 'location',
      type: 'autocomplete',
      question: 'In che zona stai cercando?',
      placeholder: 'Es. Milano',
    },
    {
      id: 'budget',
      type: 'range-slider',
      question: 'Qual è il tuo budget mensile?',
      min: 500,
      max: 5000,
      step: 100,
      defaultMin: 1500,
      defaultMax: 2500,
    },
    {
      id: 'contact',
      type: 'contact-form',
      question: 'Dove inviamo le soluzioni ottimali?',
      fields: [
        { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Il tuo nome', required: true },
        { name: 'telefono', label: 'Telefono', type: 'tel', placeholder: '+39 333 123 4567', required: true },
        {
          name: 'email',
          label: 'Email (facoltativo)',
          type: 'email',
          placeholder: 'nome@esempio.it',
          required: false,
        },
      ],
      submitLabel: 'Mostrami le opzioni',
    },
  ],
}
