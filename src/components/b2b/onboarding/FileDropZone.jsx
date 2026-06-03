import { useCallback, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { obDropZone, obDropZoneActive } from '../onboardingStyles'

export default function FileDropZone({ label, hint, accept, onFile }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (selected) => {
      if (!selected) return
      setFile(selected)
      onFile?.(selected)
    },
    [onFile]
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    handleFile(dropped)
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-900">{label}</p>
      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-teal-600" />
            <span className="truncate text-sm text-slate-700">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null)
              onFile?.(null)
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
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
          <Upload className="mb-2 h-8 w-8 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            Trascina il file o <span className="text-teal-600">sfoglia</span>
          </span>
          {hint && <span className="mt-1 text-xs text-slate-500">{hint}</span>}
          <input
            type="file"
            className="sr-only"
            accept={accept}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  )
}
