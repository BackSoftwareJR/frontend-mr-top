import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { b2bCard, b2bInput, b2bInputFocus } from '../../components/b2b/b2bStyles'
import { createEmptyBlock } from '../../components/admin/editorial/blockUtils'

const inputClass = `${b2bInput} ${b2bInputFocus} text-sm`
const textareaClass = `${inputClass} min-h-[6rem] resize-y`

const BLOCK_LABELS = {
  heading: 'Titolo',
  paragraph: 'Paragrafo',
  image: 'Immagine',
}

const BLOCK_TYPE_OPTIONS = [
  { type: 'heading', label: 'Titolo (H2/H3)' },
  { type: 'paragraph', label: 'Paragrafo' },
  { type: 'image', label: 'Immagine' },
]

function HeadingEditor({ block, onChange, disabled }) {
  const data = block.data ?? {}

  return (
    <div className="space-y-2">
      <select
        value={data.level ?? 2}
        onChange={(e) => onChange({ ...block, data: { ...data, level: Number(e.target.value) } })}
        disabled={disabled}
        className={inputClass}
      >
        <option value={2}>Titolo H2</option>
        <option value={3}>Titolo H3</option>
      </select>
      <input
        type="text"
        value={data.text ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...data, text: e.target.value } })}
        placeholder="Testo del titolo…"
        disabled={disabled}
        className={inputClass}
      />
    </div>
  )
}

function ParagraphEditor({ block, onChange, disabled }) {
  const data = block.data ?? {}
  const text = data.text ?? data.html?.replace(/<[^>]+>/g, '') ?? ''

  return (
    <textarea
      value={text}
      onChange={(e) => onChange({ ...block, data: { ...data, text: e.target.value } })}
      placeholder="Scrivi il paragrafo…"
      rows={4}
      disabled={disabled}
      className={textareaClass}
    />
  )
}

function ImageEditor({ block, onChange, disabled }) {
  const data = block.data ?? {}

  return (
    <div className="space-y-2">
      <input
        type="url"
        value={data.url ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...data, url: e.target.value } })}
        placeholder="URL immagine"
        disabled={disabled}
        className={inputClass}
      />
      <input
        type="text"
        value={data.alt ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...data, alt: e.target.value } })}
        placeholder="Testo alternativo (alt)"
        disabled={disabled}
        className={inputClass}
      />
      <input
        type="text"
        value={data.caption ?? ''}
        onChange={(e) => onChange({ ...block, data: { ...data, caption: e.target.value } })}
        placeholder="Didascalia (opzionale)"
        disabled={disabled}
        className={inputClass}
      />
    </div>
  )
}

function BlockEditorRow({ block, index, total, onChange, onMoveUp, onMoveDown, onDelete, disabled }) {
  const Editor =
    block.type === 'heading'
      ? HeadingEditor
      : block.type === 'image'
        ? ImageEditor
        : ParagraphEditor

  return (
    <div className={`${b2bCard} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-muted">
          {BLOCK_LABELS[block.type] ?? block.type}
        </span>
        {!disabled ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="rounded-lg border border-black/5 p-1.5 text-charcoal-muted transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
              title="Sposta su"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index >= total - 1}
              className="rounded-lg border border-black/5 p-1.5 text-charcoal-muted transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
              title="Sposta giù"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
              title="Elimina blocco"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
      <Editor block={block} onChange={onChange} disabled={disabled} />
    </div>
  )
}

export default function B2bBlockEditor({ blocks, onChange, disabled = false }) {
  const safeBlocks = Array.isArray(blocks) ? blocks : []

  const updateBlock = (index, nextBlock) => {
    const next = [...safeBlocks]
    next[index] = nextBlock
    onChange(next)
  }

  const moveBlock = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= safeBlocks.length) return

    const next = [...safeBlocks]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    onChange(next)
  }

  const deleteBlock = (index) => {
    onChange(safeBlocks.filter((_, i) => i !== index))
  }

  const addBlock = (type) => {
    onChange([...safeBlocks, createEmptyBlock(type)])
  }

  return (
    <div className="space-y-4">
      {!disabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-charcoal-muted">Aggiungi blocco:</span>
          {BLOCK_TYPE_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="rounded-lg border border-black/5 bg-white/70 px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:border-accent-coral/30 hover:bg-accent-coral/10 hover:text-accent-coral"
            >
              + {label}
            </button>
          ))}
        </div>
      ) : null}

      {safeBlocks.length === 0 ? (
        <div className={`${b2bCard} px-4 py-10 text-center text-sm text-charcoal-muted`}>
          Nessun blocco. Aggiungi un titolo o un paragrafo per iniziare.
        </div>
      ) : (
        safeBlocks.map((block, index) => (
          <BlockEditorRow
            key={block.id ?? index}
            block={block}
            index={index}
            total={safeBlocks.length}
            onChange={(next) => updateBlock(index, next)}
            onMoveUp={() => moveBlock(index, -1)}
            onMoveDown={() => moveBlock(index, 1)}
            onDelete={() => deleteBlock(index)}
            disabled={disabled}
          />
        ))
      )}
    </div>
  )
}
