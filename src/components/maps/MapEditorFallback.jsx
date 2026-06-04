import { Loader2 } from 'lucide-react'

export default function MapEditorFallback({ label = 'Caricamento mappa…' }) {
  return (
    <div
      className="flex h-[280px] w-full items-center justify-center rounded-3xl border border-dashed border-slate-200/70 bg-white/50 sm:h-[360px] lg:h-[420px]"
      aria-busy="true"
      aria-label={label}
    >
      <Loader2 className="h-6 w-6 animate-spin text-teal-800" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
