import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { autonomyInfo } from '../../data/autonomyInfo'
import { AUTONOMY_COPY } from '../../constants/siteCopy'
import { MotionButton } from '../../utils/motionProxy'

/**
 * Guided autonomy level picker — non-blocking overlay for Explore refinement.
 */
export default function AutonomyLevelModal({ open, onClose, onSelect, pathName = '' }) {
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

  const handleSelect = (level) => {
    onSelect?.({
      value: level.value,
      label: level.label,
    })
    onClose?.()
  }

  return (
    <div
      className="explore-modal-shell fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="autonomy-modal-title"
    >
      <button
        type="button"
        className="explore-modal-backdrop absolute inset-0"
        aria-label="Chiudi"
        onClick={onClose}
      />

      <div className="explore-modal-panel relative flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span className="explore-modal-handle" aria-hidden />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700/80">
              {AUTONOMY_COPY.eyebrow}
            </p>
            <h2
              id="autonomy-modal-title"
              className="search-bar-input text-xl font-normal text-slate-800 sm:text-2xl"
            >
              {autonomyInfo.title}
            </h2>
            {pathName ? (
              <p className="mt-1 truncate text-xs text-slate-500">
                {AUTONOMY_COPY.forPath} {pathName}
              </p>
            ) : null}
          </div>
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">{autonomyInfo.intro}</p>

          <div className="space-y-2.5">
            {autonomyInfo.levels.map((level) => (
              <MotionButton
                key={level.value}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(level)}
                className="explore-touch-target w-full rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-left transition-colors hover:border-violet-200 hover:bg-violet-50/30"
              >
                <span className="block text-sm font-semibold text-slate-800">{level.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {level.description}
                </span>
              </MotionButton>
            ))}
          </div>
        </div>

        <div className="explore-modal-panel__footer shrink-0 border-t border-slate-100 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {AUTONOMY_COPY.skip}
          </button>
        </div>
      </div>
    </div>
  )
}
