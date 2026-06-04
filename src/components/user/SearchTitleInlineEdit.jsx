import { useRef, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { isApiConfigured } from '../../services/apiClient'
import { updateUserSearchTitle } from '../../services/userService'

function searchLeadRef(search) {
  return search?.leadUuid ?? search?.publicRef ?? search?.id ?? null
}

/**
 * Inline rename for a consumer search title (uuid / public_ref).
 */
export default function SearchTitleInlineEdit({
  search,
  fallbackLabel = 'Ricerca',
  titleClassName = 'truncate text-lg font-semibold tracking-tight text-slate-800 sm:text-xl',
  onRenamed,
  disabled = false,
}) {
  const leadRef = searchLeadRef(search)
  const canRename = !disabled && isApiConfigured() && Boolean(leadRef)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(search.title ?? '')
  const [saving, setSaving] = useState(false)
  const [renameError, setRenameError] = useState(null)
  const inputRef = useRef(null)

  const displayTitle = search.title || fallbackLabel

  const startEditing = () => {
    if (!canRename || saving) return
    setDraftTitle(search.title ?? '')
    setRenameError(null)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const cancelEditing = () => {
    setDraftTitle(search.title ?? '')
    setRenameError(null)
    setEditing(false)
  }

  const commitRename = async () => {
    const trimmed = draftTitle.trim()
    if (!canRename || saving) return
    if (trimmed === '' || trimmed === search.title) {
      cancelEditing()
      return
    }

    setSaving(true)
    setRenameError(null)
    try {
      const updated = await updateUserSearchTitle(leadRef, trimmed)
      if (updated) {
        onRenamed?.(updated)
      }
      setEditing(false)
    } catch {
      setRenameError('Impossibile salvare il titolo. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draftTitle}
            maxLength={255}
            disabled={saving}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void commitRename()
              }
              if (event.key === 'Escape') cancelEditing()
            }}
            onBlur={() => {
              if (!saving) void commitRename()
            }}
            className="w-full rounded-xl border border-teal-800/20 bg-white/90 px-3 py-2 text-base font-semibold text-slate-800 shadow-sm outline-none ring-2 ring-teal-800/15 focus:ring-teal-800/30"
            aria-label="Nuovo titolo ricerca"
          />
          <button
            type="button"
            onClick={cancelEditing}
            disabled={saving}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100/80 hover:text-slate-600"
            aria-label="Annulla rinomina"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
        {renameError ? <p className="text-xs text-red-600">{renameError}</p> : null}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className={titleClassName}>{displayTitle}</h2>
      {canRename ? (
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100/80 hover:text-teal-800"
          aria-label="Rinomina ricerca"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
