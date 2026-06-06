/** @typedef {{ key: string, label: string, multiline?: boolean, seo?: 'h2'|'h3'|'body'|'faq', tag?: string }} LayoutField */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   description: string,
 *   category: 'intro'|'content'|'trust'|'action',
 *   b2bAllowed: boolean,
 *   previewAccent?: string,
 *   defaultSlots: Record<string, string>,
 *   fields: LayoutField[],
 * }} LayoutTemplate
 */

/** @type {Record<string, LayoutTemplate>} */
export const LAYOUT_TEMPLATES = {
  'hero-coral': {
    id: 'hero-coral',
    label: 'Hero intro',
    description: 'Titolo grande con sfondo onda coral — ideale per l’apertura',
    category: 'intro',
    b2bAllowed: true,
    previewAccent: '#E07A5F',
    defaultSlots: {
      eyebrow: 'GUIDA PRATICA',
      title: 'Titolo principale dell’articolo',
      subtitle: 'Un sottotitolo che spiega di cosa parla la guida in una frase chiara.',
      cta: 'Scopri di più ↓',
    },
    fields: [
      { key: 'eyebrow', label: 'Etichetta rubrica' },
      { key: 'title', label: 'Titolo', seo: 'h2', tag: 'h2' },
      { key: 'subtitle', label: 'Sottotitolo', multiline: true, seo: 'body' },
      { key: 'cta', label: 'Invito alla lettura' },
    ],
  },
  'prose-block': {
    id: 'prose-block',
    label: 'Testo libero',
    description: 'Paragrafo lungo — clicca e scrivi direttamente',
    category: 'content',
    b2bAllowed: true,
    previewAccent: '#D1D5DB',
    defaultSlots: {
      body: 'Scrivi qui il contenuto. Puoi usare più paragrafi: ogni riga vuota crea un nuovo paragrafo nel testo pubblicato.',
    },
    fields: [{ key: 'body', label: 'Testo', multiline: true, seo: 'body' }],
  },
  'split-text-image': {
    id: 'split-text-image',
    label: 'Testo + immagine',
    description: 'Due colonne con testo e area immagine',
    category: 'content',
    b2bAllowed: true,
    previewAccent: '#E07A5F',
    defaultSlots: {
      title: 'Sezione con immagine',
      body: 'Descrivi il concetto accanto a un’immagine illustrativa. Aggiungi l’URL immagine nel pannello laterale.',
      image_url: '',
      image_alt: 'Descrizione immagine per SEO e accessibilità',
    },
    fields: [
      { key: 'title', label: 'Titolo', seo: 'h3', tag: 'h3' },
      { key: 'body', label: 'Testo', multiline: true, seo: 'body' },
      { key: 'image_url', label: 'URL immagine' },
      { key: 'image_alt', label: 'Alt immagine (SEO)' },
    ],
  },
  'highlight-band': {
    id: 'highlight-band',
    label: 'Box evidenza',
    description: 'Banda colorata con punti chiave',
    category: 'content',
    b2bAllowed: true,
    previewAccent: '#F4A261',
    defaultSlots: {
      title: 'Cosa devi sapere',
      item1: 'Primo punto importante da ricordare',
      item2: 'Secondo punto con informazione utile',
      item3: 'Terzo punto per completare il quadro',
    },
    fields: [
      { key: 'title', label: 'Titolo box', seo: 'h3', tag: 'h3' },
      { key: 'item1', label: 'Punto 1', seo: 'body' },
      { key: 'item2', label: 'Punto 2', seo: 'body' },
      { key: 'item3', label: 'Punto 3', seo: 'body' },
    ],
  },
  'faq-band': {
    id: 'faq-band',
    label: 'Domande frequenti',
    description: 'Sezione FAQ — ottima per SEO e Google AI',
    category: 'trust',
    b2bAllowed: false,
    previewAccent: '#6B7280',
    defaultSlots: {
      title: 'Domande frequenti',
      q1: 'Qual è la domanda più comune?',
      a1: 'Risposta chiara e completa, utile anche per i motori di ricerca.',
      q2: 'Un’altra domanda tipica?',
      a2: 'Risposta con informazioni verificabili e neutrali.',
      q3: 'Serve altro chiarimento?',
      a3: 'Ultima risposta che chiude i dubbi del lettore.',
    },
    fields: [
      { key: 'title', label: 'Titolo sezione', seo: 'h3', tag: 'h3' },
      { key: 'q1', label: 'Domanda 1', seo: 'faq' },
      { key: 'a1', label: 'Risposta 1', multiline: true, seo: 'faq' },
      { key: 'q2', label: 'Domanda 2', seo: 'faq' },
      { key: 'a2', label: 'Risposta 2', multiline: true, seo: 'faq' },
      { key: 'q3', label: 'Domanda 3', seo: 'faq' },
      { key: 'a3', label: 'Risposta 3', multiline: true, seo: 'faq' },
    ],
  },
  'quote-spotlight': {
    id: 'quote-spotlight',
    label: 'Citazione',
    description: 'Citazione in evidenza con autore',
    category: 'trust',
    b2bAllowed: true,
    previewAccent: '#1F2937',
    defaultSlots: {
      quote: '« Una citazione che dà voce a un’esperienza o a un esperto. »',
      author: 'Nome Cognome, ruolo',
    },
    fields: [
      { key: 'quote', label: 'Citazione', multiline: true, seo: 'body' },
      { key: 'author', label: 'Autore', seo: 'body' },
    ],
  },
  'stats-row': {
    id: 'stats-row',
    label: 'Numeri chiave',
    description: 'Tre statistiche o dati in evidenza',
    category: 'trust',
    b2bAllowed: true,
    previewAccent: '#E07A5F',
    defaultSlots: {
      stat1_value: '85%',
      stat1_label: 'Famiglie soddisfatte',
      stat2_value: '24h',
      stat2_label: 'Tempo medio risposta',
      stat3_value: '500+',
      stat3_label: 'Strutture verificate',
    },
    fields: [
      { key: 'stat1_value', label: 'Valore 1' },
      { key: 'stat1_label', label: 'Etichetta 1', seo: 'body' },
      { key: 'stat2_value', label: 'Valore 2' },
      { key: 'stat2_label', label: 'Etichetta 2', seo: 'body' },
      { key: 'stat3_value', label: 'Valore 3' },
      { key: 'stat3_label', label: 'Etichetta 3', seo: 'body' },
    ],
  },
  'cta-coral': {
    id: 'cta-coral',
    label: 'Invito all’azione',
    description: 'Box finale con link verso Wenando o risorse',
    category: 'action',
    b2bAllowed: false,
    previewAccent: '#E07A5F',
    defaultSlots: {
      title: 'Hai bisogno di aiuto per orientarti?',
      body: 'Wenando ti aiuta a trovare la soluzione giusta per te o per un tuo caro.',
      button_label: 'Inizia la ricerca su Wenando',
      button_url: 'https://wenando.com',
    },
    fields: [
      { key: 'title', label: 'Titolo', seo: 'h3', tag: 'h3' },
      { key: 'body', label: 'Testo', multiline: true, seo: 'body' },
      { key: 'button_label', label: 'Testo pulsante' },
      { key: 'button_url', label: 'URL pulsante' },
    ],
  },
  'interview-qa': {
    id: 'interview-qa',
    label: 'Intervista Q&A',
    description: 'Domande e risposte alternate — ideale per colloqui ed esperti',
    category: 'content',
    b2bAllowed: true,
    previewAccent: '#9CA3AF',
    defaultSlots: {
      title: 'Colloquio con l’esperto',
      intro: 'Breve presentazione dell’intervistato e del contesto dell’incontro.',
      q1: 'Qual è la domanda più importante per le famiglie?',
      a1: 'Risposta dell’esperto, chiara e verificabile.',
      q2: 'Cosa consiglia a chi si trova davanti a questa scelta?',
      a2: 'Seconda risposta con consigli pratici e neutrali.',
      q3: 'Quali errori evitare?',
      a3: 'Terza risposta con avvertenze YMYL se necessario.',
    },
    fields: [
      { key: 'title', label: 'Titolo sezione', seo: 'h2', tag: 'h2' },
      { key: 'intro', label: 'Introduzione', multiline: true, seo: 'body' },
      { key: 'q1', label: 'Domanda 1', seo: 'h3', tag: 'h3' },
      { key: 'a1', label: 'Risposta 1', multiline: true, seo: 'body' },
      { key: 'q2', label: 'Domanda 2', seo: 'h3', tag: 'h3' },
      { key: 'a2', label: 'Risposta 2', multiline: true, seo: 'body' },
      { key: 'q3', label: 'Domanda 3', seo: 'h3', tag: 'h3' },
      { key: 'a3', label: 'Risposta 3', multiline: true, seo: 'body' },
    ],
  },
  'event-card': {
    id: 'event-card',
    label: 'Scheda evento',
    description: 'Data, luogo e CTA iscrizione — per webinar e open day',
    category: 'action',
    b2bAllowed: true,
    previewAccent: '#F4A261',
    defaultSlots: {
      title: 'Nome dell’evento',
      event_date: 'Sabato 15 giugno 2026',
      event_time: '10:00 – 12:00',
      event_location: 'Online · Zoom (link inviato dopo iscrizione)',
      description: 'Breve descrizione di cosa aspettarsi: argomenti, relatori e pubblico ideale.',
      cta_label: 'Iscriviti gratuitamente',
      cta_url: 'https://wenando.com/eventi/iscrizione',
    },
    fields: [
      { key: 'title', label: 'Titolo evento', seo: 'h2', tag: 'h2' },
      { key: 'event_date', label: 'Data' },
      { key: 'event_time', label: 'Orario' },
      { key: 'event_location', label: 'Luogo / modalità', seo: 'body' },
      { key: 'description', label: 'Descrizione', multiline: true, seo: 'body' },
      { key: 'cta_label', label: 'Testo pulsante iscrizione' },
      { key: 'cta_url', label: 'URL iscrizione' },
    ],
  },
  'checklist-band': {
    id: 'checklist-band',
    label: 'Checklist YMYL',
    description: 'Lista verifiche passo-passo — anti-truffe e guide pratiche',
    category: 'trust',
    b2bAllowed: false,
    previewAccent: '#10B981',
    defaultSlots: {
      title: 'Checklist prima di firmare',
      intro: 'Verifica questi punti prima di prendere una decisione importante.',
      item1: 'Richiedi sempre un preventivo scritto e dettagliato',
      item2: 'Controlla che la struttura sia iscritta agli albi regionali',
      item3: 'Non versare anticipi senza contratto firmato',
      item4: 'Confronta almeno tre offerte diverse',
      item5: 'Consulta un consulente indipendente se hai dubbi',
    },
    fields: [
      { key: 'title', label: 'Titolo checklist', seo: 'h3', tag: 'h3' },
      { key: 'intro', label: 'Introduzione', multiline: true, seo: 'body' },
      { key: 'item1', label: 'Voce 1', seo: 'body' },
      { key: 'item2', label: 'Voce 2', seo: 'body' },
      { key: 'item3', label: 'Voce 3', seo: 'body' },
      { key: 'item4', label: 'Voce 4', seo: 'body' },
      { key: 'item5', label: 'Voce 5', seo: 'body' },
    ],
  },
}

export const LAYOUT_CATEGORIES = [
  { id: 'intro', label: 'Introduzione' },
  { id: 'content', label: 'Contenuto' },
  { id: 'trust', label: 'Fiducia & FAQ' },
  { id: 'action', label: 'Azione' },
]

/** Most-used templates for the quick-add strip in TileEditor */
export const QUICK_ADD_TEMPLATES = [
  { id: 'hero-coral', chipLabel: 'Hero' },
  { id: 'prose-block', chipLabel: 'Testo' },
  { id: 'faq-band', chipLabel: 'FAQ' },
  { id: 'split-text-image', chipLabel: 'Immagine' },
  { id: 'quote-spotlight', chipLabel: 'Citazione' },
  { id: 'cta-coral', chipLabel: 'CTA' },
]

/** @param {string} templateId */
export function getLayoutTemplate(templateId) {
  return LAYOUT_TEMPLATES[templateId] ?? null
}

/** @param {boolean} [b2bOnly] */
export function listLayoutTemplates(b2bOnly = false) {
  return Object.values(LAYOUT_TEMPLATES).filter((t) => !b2bOnly || t.b2bAllowed)
}

/** @param {string} templateId */
export function createDefaultSlots(templateId) {
  const template = getLayoutTemplate(templateId)
  if (!template) return {}
  return { ...template.defaultSlots }
}
