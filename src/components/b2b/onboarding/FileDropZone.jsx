import { useCallback, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { obDropZone, obDropZoneActive } from '../onboardingStyles'

export default function FileDropZone({ label, hint, accept, fileName, onFile }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const displayName = file?.name ?? fileName ?? null

  const handleFile = useCallback(
    (selected) => {
      if (!selected) {
        setFile(null)
        onFile?.(null)
        return
      }
      setFile(selected)
      onFile?.(selected.name ?? selected)
    },
    [onFile]
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFile(dropped)
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-charcoal">{label}</p>
      {displayName ? (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-accent-teal-dark" />
            <span className="truncate text-sm font-medium text-charcoal">{displayName}</span>
          </div>
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="rounded-full p-1.5 text-charcoal-muted transition-colors hover:bg-white hover:text-charcoal"
            aria-label="Rimuovi file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`${obDropZone} cursor-pointer ${dragOver ? obDropZoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <Upload className="mb-2 h-8 w-8 text-charcoal-muted/60" />
          <span className="text-sm font-medium text-charcoal">
            Trascina il file o <span className="text-accent-coral">sfoglia</span>
          </span>
          {hint && <span className="mt-1 text-xs text-charcoal-muted">{hint}</span>}
          <input
            type="file"
            className="sr-only"
            accept={accept}
            onChange={(e) => {
              const picked = e.target.files?.[0]
              if (picked) handleFile(picked)
            }}
          />
        </label>
      )}
    </div>
  )
}
