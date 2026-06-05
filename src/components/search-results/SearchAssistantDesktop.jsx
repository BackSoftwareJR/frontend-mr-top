import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HeartHandshake } from 'lucide-react'
import SearchAssistantPanel from './SearchAssistantPanel'

const MIN_W = 280
const MIN_H = 320
const DEFAULT_W = 320
const DEFAULT_H = 400

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getDefaultPos() {
  if (typeof window === 'undefined') return { x: 24, y: 96 }
  return {
    x: Math.max(16, window.innerWidth - DEFAULT_W - 24),
    y: Math.max(80, window.innerHeight - DEFAULT_H - 88),
  }
}

export default function SearchAssistantDesktop({
  open,
  onOpenChange,
  panelProps,
}) {
  const [pos, setPos] = useState(getDefaultPos)
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
  const dragRef = useRef(null)
  const resizeRef = useRef(null)

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  const onPointerDownDrag = useCallback(
    (event) => {
      if (!event.target.closest('.assistant-drag-handle')) return
      event.preventDefault()
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: pos.x,
        originY: pos.y,
      }

      const onMove = (e) => {
        if (!dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        const maxX = window.innerWidth - size.w - 8
        const maxY = window.innerHeight - size.h - 8
        setPos({
          x: clamp(dragRef.current.originX + dx, 8, maxX),
          y: clamp(dragRef.current.originY + dy, 8, maxY),
        })
      }

      const onUp = () => {
        dragRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [pos.x, pos.y, size.h, size.w],
  )

  const onPointerDownResize = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      resizeRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originW: size.w,
        originH: size.h,
      }

      const onMove = (e) => {
        if (!resizeRef.current) return
        const dw = e.clientX - resizeRef.current.startX
        const dh = e.clientY - resizeRef.current.startY
        setSize({
          w: clamp(resizeRef.current.originW + dw, MIN_W, 440),
          h: clamp(resizeRef.current.originH + dh, MIN_H, window.innerHeight * 0.75),
        })
      }

      const onUp = () => {
        resizeRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [size.h, size.w],
  )

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      {open ? (
        <div
          className="assistant-window fixed z-[60] max-md:hidden"
          style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
          onPointerDown={onPointerDownDrag}
          role="dialog"
          aria-label="Nando — guida ricerca"
        >
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.12)]">
            <SearchAssistantPanel
              {...panelProps}
              showWindowChrome
              onMinimize={handleClose}
              onClose={handleClose}
              className="h-full min-h-0"
            />
            <button
              type="button"
              aria-label="Ridimensiona"
              onPointerDown={onPointerDownResize}
              className="absolute bottom-1 right-1 h-5 w-5 cursor-se-resize rounded-br-lg bg-gradient-to-br from-transparent from-50% to-slate-300/50"
            />
          </div>
        </div>
      ) : null}

      {!open ? (
        <div className="assistant-fab-wrap fixed bottom-6 right-6 z-[60] max-md:hidden">
          <button
            type="button"
            onClick={() => onOpenChange?.(true)}
            className="assistant-fab group inline-flex items-center gap-2.5 rounded-full border border-violet-200/90 bg-white py-2 pl-3 pr-4 text-violet-700 shadow-[0_8px_32px_rgba(109,91,158,0.22)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(109,91,158,0.28)]"
            aria-label="Apri Nando"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 via-rose-50 to-sky-50">
              <span className="absolute inset-0 animate-ping rounded-full bg-violet-300/30" aria-hidden />
              <HeartHandshake className="relative h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold text-slate-800">Nando</span>
          </button>
        </div>
      ) : null}
    </>,
    document.body,
  )
}
