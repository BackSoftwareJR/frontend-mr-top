import { useState, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useReadingSearchGlow } from '../../hooks/useReadingSearchGlow'
import { useHeroStickySearch } from '../../hooks/useHeroStickySearch'
import { useTypewriterPlaceholder } from '../../hooks/useTypewriterPlaceholder'
import { createSearchSession } from '../../utils/searchSessionStorage'
import AppleIntelligenceBorder from '../ui/AppleIntelligenceBorder'
import RecentSearches from './RecentSearches'

function SearchBarField({
  query,
  onQueryChange,
  glowRef,
  variant = 'hero',
  inputId,
  compact = false,
  focusable = true,
  placeholder = '',
  scrollAnchor = false,
}) {
  const isSticky = variant === 'sticky'
  const readingClass = isSticky ? '' : 'reading-line-search'
  const innerBg = 'search-bar-field__inner'
  const borderVariant = isSticky ? 'sticky' : 'default'

  return (
    <AppleIntelligenceBorder
      ref={isSticky ? undefined : glowRef}
      variant={borderVariant}
      className={`search-bar-field rounded-[9999px] ${readingClass}`.trim()}
      innerClassName={`relative flex w-full items-center overflow-hidden rounded-[9999px] ${innerBg}`}
      {...(scrollAnchor
        ? {
            'data-scroll-anchor': 'hero-cta',
            'data-scroll-label': 'Ricerca guidata',
          }
        : {})}
    >
      <div className="relative z-[1] flex w-full items-center pointer-events-auto">
        <Search
          className={`pointer-events-none absolute text-slate-400 ${
            compact ? 'left-3.5 h-4 w-4' : 'left-4 h-5 w-5'
          }`}
          strokeWidth={2}
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          tabIndex={focusable ? undefined : -1}
          className={`search-bar-input w-full bg-transparent text-slate-800 focus:outline-none ${
            compact
              ? 'min-h-[44px] py-2.5 pl-10 pr-12 text-[0.9375rem]'
              : 'min-h-[54px] py-3.5 pl-12 pr-14 text-[1.0625rem] sm:min-h-[58px] sm:text-[1.125rem]'
          }`}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className={`absolute flex items-center justify-center rounded-full bg-[#E07A5F] text-white transition-colors hover:bg-[#c96a52] disabled:cursor-not-allowed disabled:opacity-40 ${
            compact
              ? 'right-1.5 h-8 w-8'
              : 'right-2 h-10 w-10 sm:h-11 sm:w-11'
          }`}
          aria-label="Avvia esplorazione"
        >
          <Search className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.5} />
        </button>
      </div>
    </AppleIntelligenceBorder>
  )
}

export default function HomeSearchBar({ className = '', enableSticky = true }) {
  const navigate = useNavigate()
  const { isAuthenticated, userType } = useAuth()
  const [query, setQuery] = useState('')
  const glowRef = useReadingSearchGlow()
  const typewriterPlaceholder = useTypewriterPlaceholder()
  const stickyEnabled = enableSticky
  const { progress: morphProgress, isPastHero } = useHeroStickySearch(stickyEnabled)
  const heroInputId = useId()
  const stickyInputId = useId()
  const showRecent = isAuthenticated && userType === 'consumer'

  const heroFade = 1 - morphProgress
  const stickyFade = morphProgress

  const submitSearch = useCallback(
    (rawQuery) => {
      const trimmed = String(rawQuery ?? '').trim()
      if (!trimmed) return

      const session = createSearchSession(trimmed)
      navigate(`/esplora?session=${session.id}&started=1`, { replace: false })
    },
    [navigate],
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    submitSearch(query)
  }

  const stickyBar =
    stickyEnabled && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="home-sticky-search-bar pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 motion-reduce:!transform-none motion-reduce:!opacity-[unset]"
            style={{
              opacity: stickyFade,
              transform: `translateY(${(1 - stickyFade) * -14}px) scale(${0.97 + stickyFade * 0.03})`,
              pointerEvents: morphProgress > 0.35 ? 'auto' : 'none',
            }}
            aria-hidden={morphProgress < 0.15}
          >
            <form
              onSubmit={handleSubmit}
              role="search"
              aria-label="Cerca assistenza (barra fissa)"
              className="w-full max-w-xl"
            >
              <SearchBarField
                query={query}
                onQueryChange={setQuery}
                variant="sticky"
                inputId={stickyInputId}
                compact
                focusable={isPastHero}
                placeholder={typewriterPlaceholder}
              />
            </form>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div className={`w-full max-w-xl ${className}`}>
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Cerca assistenza"
          className="group relative motion-reduce:!transform-none motion-reduce:!opacity-[unset]"
          style={{
            opacity: heroFade,
            transform: `translateY(${morphProgress * -8}px) scale(${1 - morphProgress * 0.025})`,
            pointerEvents: morphProgress > 0.75 ? 'none' : 'auto',
          }}
          aria-hidden={morphProgress > 0.85}
        >
          <SearchBarField
            query={query}
            onQueryChange={setQuery}
            glowRef={glowRef}
            variant="hero"
            inputId={heroInputId}
            placeholder={typewriterPlaceholder}
            scrollAnchor
          />
        </form>

        {showRecent ? <RecentSearches className="mt-4" /> : null}
      </div>

      {stickyBar}
    </>
  )
}
