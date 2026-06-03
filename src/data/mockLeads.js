export const mockLeads = [
  {
    id: 'LD-1042',
    name: 'Maria Rossi',
    location: 'Milano (MI)',
    budget: '1.800€',
    autonomy: 'Parziale',
    status: 'Hot Match',
    score: 94,
    date: '03 Giu 2026',
  },
  {
    id: 'LD-1041',
    name: 'Giuseppe Bianchi',
    location: 'Roma (RM)',
    budget: '2.400€',
    autonomy: 'Non Autosufficiente',
    status: 'Hot Match',
    score: 91,
    date: '03 Giu 2026',
  },
  {
    id: 'LD-1040',
    name: 'Anna Verdi',
    location: 'Torino (TO)',
    budget: '1.500€',
    autonomy: 'Autosufficiente',
    status: 'Warm Lead',
    score: 78,
    date: '02 Giu 2026',
  },
  {
    id: 'LD-1039',
    name: 'Luca Ferrari',
    location: 'Bologna (BO)',
    budget: '3.200€',
    autonomy: 'Parziale',
    status: 'New',
    score: 65,
    date: '02 Giu 2026',
  },
  {
    id: 'LD-1038',
    name: 'Elena Colombo',
    location: 'Firenze (FI)',
    budget: '2.100€',
    autonomy: 'Non Autosufficiente',
    status: 'Warm Lead',
    score: 82,
    date: '01 Giu 2026',
  },
  {
    id: 'LD-1037',
    name: 'Paolo Ricci',
    location: 'Napoli (NA)',
    budget: '1.200€',
    autonomy: 'Autosufficiente',
    status: 'Contacted',
    score: 58,
    date: '01 Giu 2026',
  },
]

export const statusStyles = {
  'Hot Match': {
    className: 'bg-gradient-to-r from-pink-500/25 to-rose-500/25 text-pink-300 border-pink-400/30 glow-badge-hot',
  },
  'Warm Lead': {
    className: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-400/30 glow-badge-warm',
  },
  New: {
    className: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-400/30',
  },
  Contacted: {
    className: 'bg-white/8 text-white/50 border-white/15',
  },
}
