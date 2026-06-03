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
    className: 'bg-[#C4785A]/10 text-[#A8654A] border-[#C4785A]/25 glow-badge-hot',
  },
  'Warm Lead': {
    className: 'bg-[#5B8A72]/10 text-[#4A7360] border-[#5B8A72]/25 glow-badge-warm',
  },
  New: {
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  Contacted: {
    className: 'bg-slate-50 text-slate-500 border-slate-200',
  },
}
