export const wizardConfig = {
  id: 'care-advisor-intake-v3',
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
      ],
      submitLabel: 'Mostrami le opzioni',
    },
  ],
}
