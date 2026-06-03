import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { proSheetModal } from './proDesignTokens'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function B2BModal({ open, onClose, title, children, size = 'md' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !panelRef.current) return
    const focusable = panelRef.current.querySelector(FOCUSABLE_SELECTOR)
    focusable?.focus()
  }, [open])

  if (!open) return null

  const sizeClass =
    size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Chiudi"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="b2b-modal-title"
        className={`${proSheetModal} ${sizeClass}`}
      >
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-black/10" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h2 id="b2b-modal-title" className="text-base font-semibold tracking-tight text-charcoal">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-black/5 hover:text-charcoal"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-6 sm:px-6 sm:pb-8">{children}</div>
      </div>
    </div>
  )
}
