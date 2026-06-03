export const autonomyInfo = {
  title: 'Livelli di autonomia',
  intro:
    'Non esiste una risposta giusta o sbagliata: serve solo capire da dove partiamo, con rispetto e senza giudizio. Ogni famiglia vive una situazione diversa — ecco cosa intendiamo con ciascuna opzione.',
  levels: [
    {
      value: 'autosufficiente',
      label: 'Autosufficiente',
      description:
        'La persona gestisce da sola le attività quotidiane — vestirsi, mangiare, muoversi in casa. Può bastare un supporto leggero, compagnia o un controllo discreto, senza assistenza continua.',
    },
    {
      value: 'parziale',
      label: 'Parziale',
      description:
        'Restano buone capacità, ma in alcuni momenti serve una mano: igiene personale, pasti, farmaci o sicurezza in casa. Spesso l\'assistenza domiciliare a ore, su misura, è la scelta più naturale.',
    },
    {
      value: 'non-autosufficiente',
      label: 'Non Autosufficiente',
      description:
        'Per gran parte della giornata serve presenza e cure costanti. Una RSA o un\'assistenza domiciliare h24 può offrire tranquillità, continuità e supervisione quando la famiglia non può essere sempre presente.',
    },
  ],
}

export const autonomyLabels = {
  autosufficiente: 'Autosufficiente',
  parziale: 'Parziale',
  'non-autosufficiente': 'Non Autosufficiente',
}

export function getDiagnosis(autonomy) {
  const diagnoses = {
    autosufficiente: {
      recommendation: 'Servizi di Compagnia e Supporto Leggero',
      summary:
        'Per un\'autonomia completa, consigliamo servizi leggeri di compagnia e monitoraggio, mantenendo la massima indipendenza a casa.',
      primary: 'Assistenza Domiciliare',
      secondary: 'RSA',
    },
    parziale: {
      recommendation: 'Assistenza Domiciliare',
      summary:
        'Per un\'autonomia parziale, consigliamo l\'Assistenza Domiciliare: supporto mirato nel comfort di casa, con flessibilità sugli orari.',
      primary: 'Assistenza Domiciliare',
      secondary: 'RSA',
    },
    'non-autosufficiente': {
      recommendation: 'RSA o Assistenza H24',
      summary:
        'Per un\'autonomia limitata, consigliamo una struttura residenziale (RSA) o assistenza domiciliare h24, con cure continue e supervisione costante.',
      primary: 'RSA',
      secondary: 'Assistenza Domiciliare',
    },
  }
  return diagnoses[autonomy] || diagnoses.parziale
}

export const careComparison = {
  domiciliare: {
    label: 'Assistenza Domiciliare',
    pros: [
      'Restare nel proprio ambiente familiare',
      'Orari flessibili e personalizzati',
      'Costi generalmente più contenuti',
    ],
    cons: [
      'Richiede adattamenti dell\'abitazione',
      'Disponibilità limitata di operatori in alcune zone',
    ],
  },
  rsa: {
    label: 'RSA (Residenza)',
    pros: [
      'Assistenza continua 24 ore su 24',
      'Ambiente strutturato e sicuro',
      'Attività sociali e programmi dedicati',
    ],
    cons: [
      'Allontanamento dall\'ambiente familiare',
      'Costi mensili più elevati',
    ],
  },
}
