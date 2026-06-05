import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

export default function SearchResultsNav({ query, pageTitle, onNewSearch }) {
  const displayTitle = pageTitle ?? (query ? `Risultati per ${query}` : query ?? '')

  useEffect(() => {
    if (!displayTitle || typeof document === 'undefined') return
    document.title = `${displayTitle} | Wenando`
  }, [displayTitle])

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#FDFBF7]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Torna alla home"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <div className="min-w-0 flex-1">
          {!pageTitle ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Risultati per
            </p>
          ) : null}
          <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
            {displayTitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewSearch}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#E07A5F]/30 hover:text-[#c96a52] sm:text-sm"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span className="hidden sm:inline">Nuova ricerca</span>
        </button>
      </div>
    </header>
  )
}
