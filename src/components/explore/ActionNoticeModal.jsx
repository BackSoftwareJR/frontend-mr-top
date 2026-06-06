import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Lightweight consumer notice — replaces window.alert placeholders on Explore.
 */
export default function ActionNoticeModal({ open, title, message, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="explore-modal-shell fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-notice-title"
    >
      <button
        type="button"
        className="explore-modal-backdrop absolute inset-0"
        aria-label="Chiudi"
        onClick={onClose}
      />

      <div className="explore-modal-panel relative w-full max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl">
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span className="explore-modal-handle" aria-hidden />
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 id="action-notice-title" className="text-base font-semibold text-slate-800">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="explore-touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:h-8 sm:w-8 sm:rounded-lg"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <p className="px-5 py-4 text-sm leading-relaxed text-slate-600 sm:px-6">{message}</p>

        <div className="explore-modal-panel__footer border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#E07A5F] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c96a52]"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  )
}
