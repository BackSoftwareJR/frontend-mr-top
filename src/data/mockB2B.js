export const UNLOCK_COST = 15
export const INITIAL_WALLET_BALANCE = 150

export const mockMarketplaceLeads = [
  {
    id: 'ML-2048',
    matchScore: 98,
    budget: '2.400€/mese',
    location: 'Milano (MI)',
    name: 'Maria Rossi',
    phone: '+39 347 123 4567',
    email: 'maria.rossi@gmail.com',
    need: 'Assistenza domiciliare h24',
    unlockCost: UNLOCK_COST,
  },
  {
    id: 'ML-2047',
    matchScore: 94,
    budget: '1.800€/mese',
    location: 'Roma (RM)',
    name: 'Giuseppe Bianchi',
    phone: '+39 333 987 6543',
    email: 'g.bianchi@outlook.it',
    need: 'RSA con fisioterapia',
    unlockCost: UNLOCK_COST,
  },
  {
    id: 'ML-2046',
    matchScore: 89,
    budget: '3.200€/mese',
    location: 'Torino (TO)',
    name: 'Anna Verdi',
    phone: '+39 320 555 8899',
    email: 'anna.verdi@yahoo.it',
    need: 'Struttura con giardino',
    unlockCost: UNLOCK_COST,
  },
  {
    id: 'ML-2045',
    matchScore: 85,
    budget: '1.500€/mese',
    location: 'Bologna (BO)',
    name: 'Luca Ferrari',
    phone: '+39 366 222 3344',
    email: 'luca.ferrari@libero.it',
    need: 'Badante convivente',
    unlockCost: UNLOCK_COST,
  },
  {
    id: 'ML-2044',
    matchScore: 82,
    budget: '2.100€/mese',
    location: 'Firenze (FI)',
    name: 'Elena Colombo',
    phone: '+39 348 777 1122',
    email: 'e.colombo@gmail.com',
    need: 'Centro diurno + trasporto',
    unlockCost: UNLOCK_COST,
  },
]

export const CRM_STATUSES = ['Nuovo', 'Contattato', 'Visita Fissata', 'Perso', 'Chiuso']

export const statusPillStyles = {
  Nuovo: 'bg-blue-50 text-blue-700 border-blue-200',
  Contattato: 'bg-amber-50 text-amber-700 border-amber-200',
  'Visita Fissata': 'bg-accent-violet/10 text-accent-violet-dark border-accent-violet/25',
  Perso: 'bg-red-50 text-red-600 border-red-200',
  Chiuso: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export const mockCRMClients = [
  {
    id: 'CRM-102',
    cliente: 'Giuseppe Bianchi',
    stato: 'Contattato',
    esigenza: 'RSA con fisioterapia',
    budget: '1.800€',
    ultimaAzione: 'Chiamata effettuata · ieri',
    phone: '+39 333 987 6543',
    email: 'g.bianchi@outlook.it',
    location: 'Roma (RM)',
    marketplaceId: 'ML-2047',
  },
  {
    id: 'CRM-103',
    cliente: 'Anna Verdi',
    stato: 'Visita Fissata',
    esigenza: 'Struttura con giardino',
    budget: '3.200€',
    ultimaAzione: 'Visita fissata · 15 Giu',
    phone: '+39 320 555 8899',
    email: 'anna.verdi@yahoo.it',
    location: 'Torino (TO)',
    marketplaceId: 'ML-2046',
  },
  {
    id: 'CRM-104',
    cliente: 'Luca Ferrari',
    stato: 'Perso',
    esigenza: 'Badante convivente',
    budget: '1.500€',
    ultimaAzione: 'Non interessato · 3 giorni fa',
    phone: '+39 366 222 3344',
    email: 'luca.ferrari@libero.it',
    location: 'Bologna (BO)',
    marketplaceId: 'ML-2045',
  },
  {
    id: 'CRM-105',
    cliente: 'Elena Colombo',
    stato: 'Chiuso',
    esigenza: 'Centro diurno + trasporto',
    budget: '2.100€',
    ultimaAzione: 'Contratto firmato · 1 Giu',
    phone: '+39 348 777 1122',
    email: 'e.colombo@gmail.com',
    location: 'Firenze (FI)',
    marketplaceId: 'ML-2044',
  },
  {
    id: 'CRM-106',
    cliente: 'Paolo Ricci',
    stato: 'Contattato',
    esigenza: 'Assistenza notturna',
    budget: '1.200€',
    ultimaAzione: 'Email inviata · 4 ore fa',
    phone: '+39 340 111 2233',
    email: 'p.ricci@gmail.com',
    location: 'Genova (GE)',
  },
]

export const mockAppointments = [
  {
    id: 'APT-001',
    clientId: 'CRM-103',
    cliente: 'Anna Verdi',
    date: '2026-06-15',
    time: '10:30',
    note: 'Prima visita struttura con giardino',
  },
  {
    id: 'APT-002',
    clientId: 'CRM-106',
    cliente: 'Paolo Ricci',
    date: '2026-06-04',
    time: '15:00',
    note: 'Follow-up assistenza notturna',
  },
]

export const mockInvoices = [
  {
    id: 'INV-2026-042',
    date: '2026-05-28',
    description: 'Ricarica credito wallet',
    amount: 100,
    status: 'Pagata',
  },
  {
    id: 'INV-2026-041',
    date: '2026-05-20',
    description: 'Sblocco lead ML-2039',
    amount: 15,
    status: 'Pagata',
  },
  {
    id: 'INV-2026-040',
    date: '2026-05-15',
    description: 'Ricarica credito wallet',
    amount: 50,
    status: 'Pagata',
  },
  {
    id: 'INV-2026-039',
    date: '2026-05-10',
    description: 'Sblocco lead ML-2035',
    amount: 15,
    status: 'Pagata',
  },
  {
    id: 'INV-2026-038',
    date: '2026-05-02',
    description: 'Abbonamento Wenando Pro',
    amount: 29,
    status: 'In attesa',
  },
]

export const mockNotifications = [
  {
    id: 'NOT-001',
    type: 'match',
    title: 'Nuovo lead compatibile',
    message: 'Maria Rossi · 98% match · Milano',
    time: '10 min fa',
    read: false,
  },
  {
    id: 'NOT-002',
    type: 'credit',
    title: 'Credito in esaurimento',
    message: 'Saldo sotto € 50 — ricarica il wallet',
    time: '2 ore fa',
    read: false,
  },
  {
    id: 'NOT-003',
    type: 'visit',
    title: 'Visita domani',
    message: 'Paolo Ricci · 15:00 · Genova',
    time: 'Ieri',
    read: true,
  },
]

export const mockActivityFeed = [
  {
    id: 'ACT-001',
    type: 'unlock',
    text: 'Lead sbloccato: Giuseppe Bianchi',
    time: '2 ore fa',
  },
  {
    id: 'ACT-002',
    type: 'status',
    text: 'Stato aggiornato: Anna Verdi → Visita Fissata',
    time: 'Ieri',
  },
  {
    id: 'ACT-003',
    type: 'visit',
    text: 'Visita programmata: Paolo Ricci · 4 Giu 15:00',
    time: '2 giorni fa',
  },
  {
    id: 'ACT-004',
    type: 'unlock',
    text: 'Lead sbloccato: Elena Colombo',
    time: '5 giorni fa',
  },
  {
    id: 'ACT-005',
    type: 'status',
    text: 'Stato aggiornato: Luca Ferrari → Perso',
    time: '1 settimana fa',
  },
]

export const dashboardStats = {
  leadsSbloccati: 47,
  tassoConversione: '32%',
  spesaMensile: '€ 705,00',
}

export const leadsTrendData = [
  { day: 1, leads: 3 },
  { day: 5, leads: 5 },
  { day: 10, leads: 4 },
  { day: 15, leads: 8 },
  { day: 20, leads: 6 },
  { day: 25, leads: 9 },
  { day: 30, leads: 12 },
]

export const PARTNER_NAME = 'Studio Care Milano'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDateIT(dateStr) {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}
