import { Bookmark, HelpCircle, LayoutDashboard, Search, User } from 'lucide-react'

/** Value props shown after search — each includes a short "perché". */
export const POST_SEARCH_BENEFITS = [
  {
    id: 'personalized',
    title: 'Piano su misura',
    why: 'Eviti confronti a caso: ogni opzione segue autonomia, zona e budget che hai indicato.',
    accent: 'teal',
  },
  {
    id: 'saved',
    title: 'Preferiti sempre con te',
    why: 'Salvi le strutture che ti convincono e le ritrovi nell’area personale, anche da telefono.',
    accent: 'coral',
  },
  {
    id: 'advisor',
    title: 'Consulente umano',
    why: 'Un confronto reale riduce l’ansia: puoi chiarire dubbi prima di una visita o di una scelta definitiva.',
    accent: 'violet',
  },
  {
    id: 'privacy',
    title: 'Dati protetti',
    why: 'Le risposte del wizard restano riservate: usiamo solo ciò che serve a proporti match pertinenti.',
    accent: 'emerald',
  },
]

/** Guided steps after results (and mirrored on dashboard). */
export const CONSUMER_JOURNEY_STEPS = [
  {
    id: 'saved',
    icon: Bookmark,
    title: 'Risultati e preferiti',
    description:
      'Le strutture che salvi restano nel tuo spazio. Così non perdi ciò che ti aveva colpito mentre confronti le opzioni.',
    ctaLabel: 'Vai alle ricerche',
    ctaTo: '/area-personale/ricerche',
  },
  {
    id: 'new-search',
    icon: Search,
    title: 'Nuova ricerca',
    description:
      'Puoi ripetere il percorso se cambiano esigenze o zona: ogni ricerca resta separata e consultabile.',
    ctaLabel: 'Avvia wizard',
    ctaTo: '/wizard',
  },
  {
    id: 'profile',
    icon: User,
    title: 'Profilo',
    description:
      'Aggiorna nome e contatti per ricevere conferme e promemoria senza dover reinserire i dati.',
    ctaLabel: 'Apri profilo',
    ctaTo: '/area-personale/profilo',
  },
  {
    id: 'help',
    icon: HelpCircle,
    title: 'Aiuto',
    description:
      'Guide e risposte rapide quando non sai da dove partire: siamo qui prima di una scelta importante.',
    ctaLabel: 'Centro assistenza',
    ctaTo: '/area-personale/aiuto',
  },
]

export const DASHBOARD_GUIDE_STEPS = [
  {
    id: 'welcome',
    icon: LayoutDashboard,
    title: 'Il tuo riepilogo',
    description:
      'In home vedi subito l’ultima ricerca: se è in elaborazione o se i risultati sono pronti da aprire.',
  },
  ...CONSUMER_JOURNEY_STEPS,
]

export const PERSONAL_AREA_HOME = '/area-personale/home'
