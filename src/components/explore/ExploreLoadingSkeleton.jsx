/**
 * Branded loading shell while ExplorePage creates a search session from ?q=
 */
export default function ExploreLoadingSkeleton() {
  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-slate-800" aria-busy="true">
      <div className="aurora-bg opacity-60" aria-hidden="true">
        <span className="aurora-orb aurora-orb--coral" />
        <span className="aurora-orb aurora-orb--violet" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200/70" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200/60" />
        </div>

        <div className="mb-10 space-y-3">
          <div className="h-8 w-2/3 max-w-md animate-pulse rounded-lg bg-slate-200/70" />
          <div className="h-5 w-1/2 max-w-xs animate-pulse rounded-lg bg-slate-200/50" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="mb-4 h-5 w-3/4 animate-pulse rounded-md bg-slate-200/70" />
              <div className="mb-2 h-4 w-full animate-pulse rounded-md bg-slate-200/50" />
              <div className="mb-2 h-4 w-5/6 animate-pulse rounded-md bg-slate-200/40" />
              <div className="mt-5 h-9 w-28 animate-pulse rounded-full bg-[#E07A5F]/20" />
            </div>
          ))}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Preparazione ricerca…
        </p>
      </div>
    </div>
  )
}
