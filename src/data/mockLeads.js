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
    className: 'bg-[#E07A5F]/10 text-[#c96a52] border-[#E07A5F]/25 glow-badge-hot',
  },
  'Warm Lead': {
    className: 'bg-[#E9A84A]/10 text-[#c88a32] border-[#E9A84A]/25 glow-badge-warm',
  },
  New: {
    className: 'bg-[#5CB8A8]/10 text-[#0d9488] border-[#5CB8A8]/25 glow-badge-teal',
  },
  Contacted: {
    className: 'bg-[#9B8EC4]/10 text-[#7c6ba8] border-[#9B8EC4]/25 glow-badge-violet',
  },
}
