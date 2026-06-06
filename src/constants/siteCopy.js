/** Consumer-facing marketing copy — source: wenando-testi-v3.md */

export const HOME_HERO = {
  title: 'La guida sicura per chi ami.',
  subtitle:
    'Wenando è un motore di ricerca gratuito per trovare strutture e servizi per anziani. Puoi cercare da solo, oppure farti guidare passo dopo passo. Il team è lì se hai bisogno di qualcuno con cui parlare.',
}

export const HOME_BENTO = {
  label: 'Come funziona',
  steps: [
    {
      step: '01',
      title: 'Cerchi',
      description:
        'Inserisci quello che stai cercando: una struttura residenziale, un\'assistente domiciliare, un centro diurno. Wenando ti fa le domande giuste per capire cosa ti serve davvero, zona, tipo di assistenza, budget, tempistiche.',
      accentColor: 'text-[#B45309]',
      postItBg: 'bg-[#FFF4B8]',
      postItBorder: 'border-amber-900/8',
      postItShadow: '3px 5px 0 rgba(180, 83, 9, 0.14)',
      postItShadowHover: '5px 8px 0 rgba(180, 83, 9, 0.16)',
      stepWatermark: 'text-amber-900/12',
      rotate: -1.8,
    },
    {
      step: '02',
      title: 'Trovi',
      description:
        'I risultati non sono una lista uguale per tutti. Vengono filtrati e ordinati in base a quello che hai indicato. Puoi continuare ad affinare la ricerca quanto vuoi, senza fretta.',
      accentColor: 'text-[#6D5B9E]',
      postItBg: 'bg-[#E8E0F5]',
      postItBorder: 'border-violet-900/8',
      postItShadow: '3px 5px 0 rgba(109, 91, 158, 0.14)',
      postItShadowHover: '5px 8px 0 rgba(109, 91, 158, 0.16)',
      stepWatermark: 'text-violet-900/12',
      rotate: 1.6,
    },
    {
      step: '03',
      title: 'Decidi',
      description:
        'Quando trovi qualcosa che ti convince, puoi contattare direttamente la struttura o il servizio dalla piattaforma. Se hai dubbi prima di farlo, puoi parlare con qualcuno del nostro team.',
      accentColor: 'text-[#BE185D]',
      postItBg: 'bg-[#FDE4EC]',
      postItBorder: 'border-rose-900/8',
      postItShadow: '3px 5px 0 rgba(190, 24, 93, 0.12)',
      postItShadowHover: '5px 8px 0 rgba(190, 24, 93, 0.14)',
      stepWatermark: 'text-rose-900/12',
      rotate: -1.2,
    },
  ],
}

export const HOME_AUDIENCE = {
  label: 'A chi serve',
  text: 'Wenando è utile se sai già cosa cerchi e vuoi trovarlo in modo rapido e ordinato. Ed è ugualmente utile se non hai ancora le idee chiare e vuoi capire cosa esiste, cosa costa, cosa fa al caso tuo. Puoi usarlo tu direttamente, oppure usarlo insieme a un familiare.',
}

export const HOME_CTA = {
  label: 'Inizia la ricerca',
}

export const FAQ_ITEMS = [
  {
    question: 'Il servizio è gratuito?',
    answer:
      'Sì, completamente. Non paghi nulla per cercare, confrontare o contattare una struttura tramite Wenando.',
    accent: '#E07A5F',
  },
  {
    question: 'Devo registrarmi per usare Wenando?',
    answer:
      'No. Puoi cercare, filtrare e confrontare strutture e servizi senza creare un account. Ti chiediamo l\'email solo se vuoi salvare le ricerche o richiedere un contatto verso una struttura.',
    accent: '#E9A84A',
  },
  {
    question: 'Posso usarlo solo per informarmi, senza contattare nessuno?',
    answer:
      'Sì. Puoi cercare, filtrare e confrontare strutture e servizi senza dover fare nulla. L\'unica azione che ha conseguenze pratiche è richiedere un contatto verso una struttura, e la fai solo se e quando vuoi tu.',
    accent: '#9B8EC4',
  },
  {
    question: 'Come funziona la richiesta di contatto?',
    answer:
      'È un modulo semplice con cui fai sapere a una struttura o a un servizio che vuoi essere ricontattato. Non è un contratto, non è un impegno. Sei libero di valutare le risposte che ricevi e decidere il passo successivo.',
    accent: '#E879A0',
  },
  {
    question: 'I risultati sono imparziali?',
    answer:
      'I risultati vengono filtrati in base alle informazioni che hai inserito. L\'obiettivo è mostrarti quello che è più compatibile con la tua situazione, non quello che fa comodo a noi.',
    accent: '#0F766E',
  },
  {
    question: 'Posso parlare con qualcuno se ho dubbi?',
    answer:
      'Sì. Il team di Wenando è disponibile per rispondere a domande, aiutarti a capire i risultati o consigliarti su come impostare la ricerca. Non è obbligatorio, ma è lì se ne hai bisogno.',
    accent: '#E07A5F',
  },
  {
    question: 'Che tipo di servizi posso cercare?',
    answer:
      'Qualsiasi servizio legato all\'assistenza e al benessere degli anziani: strutture residenziali, assistenza domiciliare, centri diurni, servizi di supporto quotidiano. Se stai cercando qualcosa che non trovi, segnalacelo.',
    accent: '#E9A84A',
  },
  {
    question: 'I miei dati vengono condivisi o venduti?',
    answer:
      'No. Le informazioni che inserisci durante la ricerca vengono usate solo per mostrarti risultati pertinenti. Non vengono vendute a terzi né usate per pubblicità.',
    accent: '#9B8EC4',
  },
]

export const COME_FUNZIONA_PAGE = {
  title: 'Come funziona Wenando',
  intro: [
    'Wenando funziona come un motore di ricerca, ma costruito apposta per i servizi anziani.',
    'Non ti mostra una lista generica di strutture. Ti chiede prima cosa stai cercando, attraverso filtri e domande progressive, e poi ti mostra solo i risultati compatibili con la tua situazione.',
  ],
  sections: [
    {
      title: 'La ricerca guidata',
      paragraphs: [
        'Quando inizi una ricerca, Wenando ti accompagna con domande semplici: che tipo di servizio cerchi, in quale zona, con quale budget indicativo, con quali tempistiche. Non è un questionario lungo. Sono le informazioni minime per mostrarti risultati utili invece di risultati qualsiasi.',
        'Puoi fermarti quando vuoi e guardare i risultati. Puoi anche tornare indietro e cambiare qualcosa se i risultati non ti convincono.',
      ],
    },
    {
      title: 'I risultati',
      paragraphs: [
        'I risultati che vedi sono filtrati in base a quello che hai indicato. Puoi ordinare, confrontare, approfondire ogni scheda. Le informazioni su ogni struttura o servizio sono quelle che ci sono, senza abbellimenti.',
      ],
    },
    {
      title: 'Contattare una struttura',
      paragraphs: [
        'Quando trovi qualcosa che ti interessa, puoi richiedere un contatto direttamente dalla piattaforma. La struttura o il servizio riceverà la tua richiesta. Non succede nulla di automatico prima di questa azione, sei tu a decidere quando e verso chi.',
      ],
    },
    {
      title: 'Il team (se ne hai bisogno)',
      paragraphs: [
        'Se in qualsiasi momento hai domande, dubbi, o vuoi parlare con qualcuno prima di procedere, il team di Wenando è disponibile. Non è un call center. Sono persone che conoscono questo settore e possono aiutarti a capire meglio le tue opzioni o a interpretare quello che hai trovato.',
      ],
    },
  ],
}

export const CHI_SIAMO_PAGE = {
  title: 'Chi siamo',
  paragraphs: [
    'Il mercato dei servizi per anziani è frammentato e difficile da leggere. Le informazioni ci sono, ma sono sparse, spesso incomplete, a volte fuorvianti. Chi si trova a dover cercare una struttura o un servizio, che sia l\'anziano stesso o un familiare, si ritrova spesso a navigare senza punti di riferimento chiari.',
    'Wenando nasce per risolvere questo problema in modo pratico: un motore di ricerca verticale, costruito apposta per questo settore, che aiuta a trovare la soluzione giusta senza dover raccogliere informazioni da dieci fonti diverse.',
    'Il funzionamento è semplice: cerchi, filtri, confronti, decidi. La ricerca è guidata per aiutarti a ottenere risultati pertinenti, ma sei tu a condurla. Se hai bisogno di qualcuno con cui parlare, il team c\'è, ma non è un passaggio obbligatorio.',
    'Wenando è gratuito per chiunque cerchi.',
  ],
}

export const SITE_META = {
  title: 'Wenando — Motore di ricerca per servizi anziani',
  description:
    'Wenando è un motore di ricerca gratuito per trovare strutture e servizi per anziani. Cerca da solo o fatti guidare passo dopo passo.',
}

/** Nando companion copy — explore / results flow */
export const NANDO_COPY = {
  name: 'Nando',
  tagline: 'Ti accompagno nella ricerca.',
  rationaleHeading: 'Ecco perché',
  rationaleFallback:
    'Percorso orientativo basato sulle informazioni che ci hai dato finora.',
  microPromptDefault: 'Affina la ricerca con qualche domanda in più.',
  loading: 'Nando sta pensando…',
  complete: 'Ho abbastanza info per ora — scrivimi se vuoi aggiungere dettagli.',
  inputPlaceholder: 'Scrivi… zona, budget, esigenze',
  expandLabel: 'Affina con Nando',
  refineHeading: 'Affina questo percorso',
  refineHint: 'Ogni dettaglio migliora le proposte — puoi saltare e tornare dopo.',
}

export const AUTONOMY_COPY = {
  eyebrow: 'Livello di autonomia',
  forPath: 'Per il percorso:',
  skip: 'Lo faccio dopo',
}

/** Explore contact-intent flow — Phase 6 */
export const CONTACT_INTENT_COPY = {
  modalTitle: 'Contatta strutture in zona',
  modalSubtitle:
    'Solo se e quando decidi tu. Nessun contatto automatico: le strutture vedranno la tua richiesta solo dopo conferma.',
  antiFraud:
    'Wenando non chiede pagamenti anticipati per metterti in contatto. Se qualcuno ti chiede bonifici o pressioni, segnalacelo.',
  summaryHeading: 'Riepilogo ricerca',
  zoneLabel: 'Zona',
  autonomyLabel: 'Livello di autonomia',
  budgetLabel: 'Budget indicativo',
  contactHeading: 'Come possiamo ricontattarti',
  nomePlaceholder: 'Il tuo nome',
  telefonoPlaceholder: 'Telefono (es. +39 333 123 4567)',
  emailPlaceholder: 'Email (facoltativa)',
  submit: 'Cerca strutture compatibili',
  submitting: 'Sto cercando strutture…',
  cancel: 'Annulla',
  scopriDiPiu: 'Scopri di più',
  contattaCta: 'Contatta strutture in zona',
  resultsTitle: 'Strutture in zona',
  resultsSubtitle:
    'Solo strutture verificate Wenando compatibili con zona e percorso scelto. I dettagli di contatto restano protetti finché non procedi.',
  emptyTitle: 'Nessuna struttura in questa zona per ora',
  emptyBody:
    'Prova ad ampliare l’area di ricerca — ad esempio un’intera provincia — o modifica il budget indicativo.',
  emptyAction: 'Amplia la zona',
  closeResults: 'Chiudi',
  errorGeneric: 'Impossibile completare la richiesta. Riprova tra poco.',
  offlineNotice:
    'Connessione non disponibile — salva i tuoi dati e riprova quando sei online.',
  consentIntro:
    'Per inoltrare la richiesta alle strutture partner devi accettare quanto segue:',
}
