export const ERROR_PAGES = {
  403: {
    code: '403',
    title: 'Accesso non consentito',
    message:
      'Non hai i permessi per visualizzare questa pagina. Se pensi sia un errore, accedi con l’account corretto o torna alla home.',
    icon: 'shield',
  },
  404: {
    code: '404',
    title: 'Pagina non trovata',
    message:
      'Il link potrebbe essere scaduto o la pagina è stata spostata. Torna alla home e riprendi da lì.',
    icon: 'compass',
  },
  500: {
    code: '500',
    title: 'Qualcosa non ha funzionato',
    message:
      'Si è verificato un errore imprevisto. Riprova tra poco; se il problema continua, contattaci da hola@wenando.com.',
    icon: 'alert',
  },
  503: {
    code: '503',
    title: 'Servizio temporaneamente non disponibile',
    message:
      'Stiamo effettuando un aggiornamento o il traffico è elevato. Attendi qualche minuto e riprova.',
    icon: 'clock',
  },
}

export function resolveErrorPage(code) {
  const key = String(code ?? '404')
  return ERROR_PAGES[key] ?? ERROR_PAGES[404]
}
