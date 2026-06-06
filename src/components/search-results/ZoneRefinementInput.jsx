import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { searchLocations } from '../../services/locationService'
import { ZONE_FALLBACK_OPTIONS } from '../../constants/pathRefinement'
import { MotionButton } from '../../utils/motionProxy'

const DEBOUNCE_MS = 300

/**
 * Geo autocomplete for zone refinement with static chip fallback.
 */
export default function ZoneRefinementInput({ onSelect, disabled = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [apiFailed, setApiFailed] = useState(false)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleInputChange = (event) => {
    const value = event.target.value
    setQuery(value)

    if (timerRef.current) window.clearTimeout(timerRef.current)

    if (value.trim().length < 2) {
      setResults([])
      setLoading(false)
      setOpen(false)
      return
    }

    timerRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const places = await searchLocations(value.trim())
        setResults(places)
        setOpen(places.length > 0)
        setApiFailed(false)
      } catch {
        setResults([])
        setOpen(false)
        setApiFailed(true)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
  }

  const handlePick = (option) => {
    onSelect?.({
      id: option.id ?? option.value,
      label: option.label,
    })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const showFallback = apiFailed || (query.trim().length < 2 && !loading)

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Cerca città o comune…"
          className="search-bar-input w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-50"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {loading ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            …
          </span>
        ) : null}

        {open && results.length > 0 ? (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200/80 bg-white py-1 shadow-lg"
          >
            {results.map((place) => (
              <li key={place.value}>
                <button
                  type="button"
                  role="option"
                  onClick={() => handlePick({ id: place.value, label: place.label })}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50/50"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                  <span>{place.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showFallback ? (
        <div className="grid gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Opzioni rapide
          </p>
          {ZONE_FALLBACK_OPTIONS.map((option) => (
            <MotionButton
              key={option.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              disabled={disabled}
              onClick={() => handlePick(option)}
              className="min-h-[40px] rounded-lg border border-slate-200/80 bg-[#FDFBF7] px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50/40 disabled:opacity-50 sm:text-sm"
            >
              {option.label}
            </MotionButton>
          ))}
        </div>
      ) : null}
    </div>
  )
}
