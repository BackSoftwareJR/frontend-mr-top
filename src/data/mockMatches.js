export const mockMatches = [
  {
    id: 'match-1',
    name: 'Casa Serenità',
    type: 'Assistenza Domiciliare',
    location: 'Milano, Zona Navigli',
    compatibility: 95,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80',
    description: 'Assistenza personalizzata con operatori qualificati, flessibilità oraria.',
    pros: [
      'Operatori fissi e referente dedicato',
      'Orari su misura, anche weekend',
      'Supporto per ADI e detrazioni fiscali',
    ],
    contactHint: 'Richiedi un sopralluogo gratuito: rispondono entro 24 ore via telefono o WhatsApp.',
  },
  {
    id: 'match-2',
    name: 'Residenza Il Girasole',
    type: 'RSA',
    location: 'Milano, Zona Porta Romana',
    compatibility: 91,
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop&q=80',
    description: 'Struttura accogliente con programmi sociali e assistenza 24h.',
    pros: [
      'Assistenza infermieristica h24',
      'Programmi sociali e fisioterapia',
      'Visite illimitate per familiari',
    ],
    contactHint: 'Prenota una visita guidata: il referente ti richiama entro un giorno lavorativo.',
  },
  {
    id: 'match-3',
    name: 'Care Home Milano',
    type: 'Assistenza Domiciliare',
    location: 'Milano, Zona Isola',
    compatibility: 88,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
    description: 'Team dedicato con esperienza in demenza e patologie croniche.',
    pros: [
      'Specializzazione in demenza e Alzheimer',
      'Coordinamento con medico di base',
      'Piano assistenziale personalizzato',
    ],
    contactHint: 'Compila il modulo online o chiama il numero verde: consulenza iniziale gratuita.',
  },
]

export const mockAdvisor = {
  name: 'Marco',
  role: 'Consulente pari',
  story:
    'Parla con Marco. Ha affrontato la stessa situazione con suo padre 2 anni fa. Nessuna vendita, solo l\'esperienza di chi ci è già passato.',
  ctaLabel: 'Prenota una chiamata gratuita (15 min)',
}

export function getMatchesForLocation(locationLabel) {
  if (!locationLabel) return mockMatches
  const city = locationLabel.split(' ')[0]
  return mockMatches.map((match) => ({
    ...match,
    location: match.location.replace('Milano', city),
  }))
}
