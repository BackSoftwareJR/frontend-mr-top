import { useCallback, useRef, useState } from 'react'

function formatEuro(value) {
  return new Intl.NumberFormat('it-IT').format(value)
}

function clamp(value, floor, ceiling) {
  return Math.min(ceiling, Math.max(floor, value))
}

function snapToStep(value, min, max, step) {
  const stepped = Math.round(value / step) * step
  return clamp(stepped, min, max)
}

function ThumbLabel({ value, percent, offsetPx = 0, isActive }) {
  return (
    <div
      className="pointer-events-none absolute top-[calc(50%+1.35rem)] flex flex-col items-center"
      style={{
        left: `${percent}%`,
        transform: `translateX(calc(-50% + ${offsetPx}px))`,
      }}
    >
      <span
        className={`mb-1.5 block h-4 w-px rounded-full bg-gradient-to-b from-teal-800/40 to-transparent transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-60'
        }`}
        aria-hidden
      />
      <span
        className={`whitespace-nowrap rounded-full border bg-white/80 px-3 py-1 text-sm font-medium tracking-tight shadow-[0_4px_16px_rgb(17_94_89_/0.1)] backdrop-blur-xl transition-all ${
          isActive
            ? 'scale-105 border-teal-800/35 text-teal-800'
            : 'border-teal-800/15 text-teal-800/80'
        }`}
      >
        {formatEuro(value)} €
      </span>
    </div>
  )
}

export default function BudgetRangeSlider({
  min,
  max,
  step,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}) {
  const trackRef = useRef(null)
  const [activeThumb, setActiveThumb] = useState(null)

  const minPercent = ((minVal - min) / (max - min)) * 100
  const maxPercent = ((maxVal - min) / (max - min)) * 100
  const thumbSpread = maxPercent - minPercent
  const minLabelOffset = thumbSpread < 22 ? -20 : 0
  const maxLabelOffset = thumbSpread < 22 ? 20 : 0

  const valueFromClientX = useCallback(
    (clientX) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect?.width) return minVal
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      return snapToStep(min + ratio * (max - min), min, max, step)
    },
    [min, max, step, minVal],
  )

  const updateThumb = useCallback(
    (thumb, clientX) => {
      const next = valueFromClientX(clientX)
      if (thumb === 'min') {
        onMinChange(clamp(next, min, maxVal - step))
      } else {
        onMaxChange(clamp(next, minVal + step, max))
      }
    },
    [valueFromClientX, onMinChange, onMaxChange, min, max, minVal, maxVal, step],
  )

  const endDrag = useCallback(() => {
    setActiveThumb(null)
  }, [])

  const handleTrackPointerDown = (event) => {
    if (event.button !== 0) return
    const value = valueFromClientX(event.clientX)
    const pickMin =
      Math.abs(value - minVal) <= Math.abs(value - maxVal)
        ? 'min'
        : 'max'
    setActiveThumb(pickMin)
    updateThumb(pickMin, event.clientX)
    trackRef.current?.setPointerCapture(event.pointerId)
  }

  const handleThumbPointerDown = (thumb, event) => {
    event.stopPropagation()
    if (event.button !== 0) return
    setActiveThumb(thumb)
    trackRef.current?.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!activeThumb) return
    updateThumb(activeThumb, event.clientX)
  }

  const handlePointerUp = (event) => {
    if (trackRef.current?.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId)
    }
    endDrag()
  }

  const handleKeyDown = (thumb, event) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step : 0
    const negative =
      event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? step : 0
    const change = delta || (negative ? -negative : 0)
    if (!change) return
    event.preventDefault()
    if (thumb === 'min') {
      onMinChange(clamp(minVal + change, min, maxVal - step))
    } else {
      onMaxChange(clamp(maxVal + change, minVal + step, max))
    }
  }

  return (
    <div className="budget-range relative mx-auto max-w-lg px-2">
      <div
        ref={trackRef}
        className="relative h-[7.5rem] touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="budget-range__hit absolute inset-x-0 top-1/2 z-0 h-12 -translate-y-1/2 cursor-pointer"
          onPointerDown={handleTrackPointerDown}
          aria-hidden
        />

        <div
          className="budget-range__track pointer-events-none absolute inset-x-0 top-1/2 z-[1] h-1.5 -translate-y-1/2 rounded-full"
          aria-hidden
        />
        <div
          className="budget-range__fill pointer-events-none absolute top-1/2 z-[1] h-2 -translate-y-1/2 rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          aria-hidden
        />

        <ThumbLabel
          value={minVal}
          percent={minPercent}
          offsetPx={minLabelOffset}
          isActive={activeThumb === 'min'}
        />
        <ThumbLabel
          value={maxVal}
          percent={maxPercent}
          offsetPx={maxLabelOffset}
          isActive={activeThumb === 'max'}
        />

        <button
          type="button"
          role="slider"
          aria-label="Budget minimo"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minVal}
          aria-valuetext={`${formatEuro(minVal)} euro`}
          className={`budget-range-thumb absolute top-1/2 touch-manipulation ${
            activeThumb === 'min'
              ? 'budget-range-thumb--active z-[5]'
              : activeThumb === 'max'
                ? 'z-[2]'
                : 'z-[4]'
          }`}
          style={{ left: `${minPercent}%` }}
          onPointerDown={(e) => handleThumbPointerDown('min', e)}
          onKeyDown={(e) => handleKeyDown('min', e)}
        />

        <button
          type="button"
          role="slider"
          aria-label="Budget massimo"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          aria-valuetext={`${formatEuro(maxVal)} euro`}
          className={`budget-range-thumb absolute top-1/2 touch-manipulation ${
            activeThumb === 'max'
              ? 'budget-range-thumb--active z-[5]'
              : activeThumb === 'min'
                ? 'z-[2]'
                : 'z-[3]'
          }`}
          style={{ left: `${maxPercent}%` }}
          onPointerDown={(e) => handleThumbPointerDown('max', e)}
          onKeyDown={(e) => handleKeyDown('max', e)}
        />
      </div>

      <div className="flex justify-between px-0.5 text-xs font-medium tracking-wide text-slate-400">
        <span>{formatEuro(min)} €</span>
        <span>{formatEuro(max)} €</span>
      </div>
    </div>
  )
}
