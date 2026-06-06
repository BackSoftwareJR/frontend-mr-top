import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { adminGlassCard } from '../adminStyles'
import { BLOCK_TYPE_OPTIONS, createEmptyBlock } from './blockUtils'
import HeadingBlock from './blocks/HeadingBlock'
import ParagraphBlock from './blocks/ParagraphBlock'
import ImageBlock from './blocks/ImageBlock'
import CalloutBlock from './blocks/CalloutBlock'

const BLOCK_LABELS = {
  heading: 'Titolo',
  paragraph: 'Paragrafo',
  image: 'Immagine',
  callout: 'Callout',
}

function BlockEditorRow({ block, index, total, onChange, onMoveUp, onMoveDown, onDelete }) {
  const Editor =
    block.type === 'heading'
      ? HeadingBlock
      : block.type === 'paragraph'
        ? ParagraphBlock
        : block.type === 'image'
          ? ImageBlock
          : block.type === 'callout'
            ? CalloutBlock
            : ParagraphBlock

  return (
    <div className={`${adminGlassCard} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {BLOCK_LABELS[block.type] ?? block.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Sposta su"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Sposta giù"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/20 p-1.5 text-red-400/80 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="Elimina blocco"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <Editor block={block} onChange={onChange} />
    </div>
  )
}

export default function BlockEditor({ blocks, onChange }) {
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">Aggiungi blocco:</span>
        {BLOCK_TYPE_OPTIONS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-accent-coral/30 hover:bg-accent-coral/10 hover:text-accent-coral"
          >
            + {label}
          </button>
        ))}
      </div>

      {safeBlocks.length === 0 ? (
        <div className={`${adminGlassCard} px-4 py-10 text-center text-sm text-zinc-500`}>
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
          />
        ))
      )}
    </div>
  )
}
