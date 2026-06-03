import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  COOKIE_CONSENT_VERSION,
  hasCookieConsentChoice,
  writeCookieConsent,
} from '../constants/cookieConsent'

const bannerBtnClass =
  'flex-1 min-w-0 rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2.5 text-center text-sm font-semibold text-charcoal shadow-sm backdrop-blur-xl transition-colors hover:border-teal-800/25 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-800/20'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !hasCookieConsentChoice())
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [analyticsDraft, setAnalyticsDraft] = useState(false)

  const persist = (analytics) => {
    writeCookieConsent(analytics)
    setVisible(false)
    setCustomizeOpen(false)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
      >
        <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-slate-200/50 bg-white/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-5">
          <p id="cookie-banner-title" className="text-sm font-semibold text-charcoal">
            Cookie e privacy
          </p>
          <p id="cookie-banner-desc" className="mt-1.5 text-sm leading-relaxed text-charcoal-muted">
            Usiamo cookie strettamente necessari per il funzionamento del sito e, solo con il tuo
            consenso, analytics aggregati (Plausible, senza profilazione marketing).{' '}
            <Link to="/cookies" className="font-medium text-teal-800 underline-offset-2 hover:underline">
              Cookie Policy
            </Link>
          </p>

          <AnimatePresence>
            {customizeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 rounded-xl border border-slate-200/50 bg-white/70 p-3">
                  <label className="flex cursor-not-allowed items-start gap-3 opacity-70">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-800"
                    />
                    <span className="text-sm text-charcoal">
                      <span className="font-medium">Strettamente necessari</span>
                      <span className="mt-0.5 block text-charcoal-muted">
                        Sessione, sicurezza e preferenza consenso (sempre attivi).
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={analyticsDraft}
                      onChange={(e) => setAnalyticsDraft(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-800/20"
                    />
                    <span className="text-sm text-charcoal">
                      <span className="font-medium">Analytics (Plausible)</span>
                      <span className="mt-0.5 block text-charcoal-muted">
                        Statistiche aggregate anonime, nessun retargeting.
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => persist(analyticsDraft)}
                    className="w-full rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800/90"
                  >
                    Salva preferenze
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!customizeOpen && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button type="button" onClick={() => persist(true)} className={bannerBtnClass}>
                Accetta tutti
              </button>
              <button type="button" onClick={() => persist(false)} className={bannerBtnClass}>
                Rifiuta non essenziali
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalyticsDraft(false)
                  setCustomizeOpen(true)
                }}
                className={bannerBtnClass}
              >
                Personalizza
              </button>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-charcoal-muted">
            Versione preferenze {COOKIE_CONSENT_VERSION}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
