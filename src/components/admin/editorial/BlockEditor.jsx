import { useCallback } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { adminGlassCard } from '../adminStyles'
import { BLOCK_TYPE_OPTIONS, createEmptyBlock } from './blockUtils'
import HeadingBlock from './blocks/HeadingBlock'
import ParagraphBlock from './blocks/ParagraphBlock'
import ImageBlock from './blocks/ImageBlock'
import CalloutBlock from './blocks/CalloutBlock'
import SortableBlockRow from './SortableBlockRow'
import { useSortableList } from './useSortableList'

const BLOCK_LABELS = {
  heading: 'Titolo',
  paragraph: 'Paragrafo',
  image: 'Immagine',
  callout: 'Callout',
  layout: 'Sezione layout',
}

function BlockEditorContent({ block, onChange }) {
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

  return <Editor block={block} onChange={onChange} />
}

export default function BlockEditor({ blocks, onChange, disabled = false }) {
  const safeBlocks = Array.isArray(blocks) ? blocks : []

  const updateBlock = (index, nextBlock) => {
    const next = [...safeBlocks]
    next[index] = nextBlock
    onChange(next)
  }

  const deleteBlock = (index) => {
    onChange(safeBlocks.filter((_, i) => i !== index))
  }

  const addBlock = (type) => {
    onChange([...safeBlocks, createEmptyBlock(type)])
  }

  const handleReorder = useCallback(
    (next) => {
      onChange(next)
    },
    [onChange]
  )

  const sortable = useSortableList({
    items: safeBlocks,
    onReorder: handleReorder,
    disabled,
  })

  const showDropBefore = (index) => {
    if (sortable.activeIndex === -1 || sortable.overIndex === -1) return false
    if (sortable.activeIndex === sortable.overIndex) return false
    return sortable.overIndex === index
  }

  return (
    <div className="space-y-4">
      {!disabled ? (
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
      ) : null}

      {safeBlocks.length === 0 ? (
        <div className={`${adminGlassCard} px-4 py-10 text-center text-sm text-zinc-500`}>
          Nessun blocco. Aggiungi un titolo o un paragrafo per iniziare.
        </div>
      ) : (
        <DndContext
          sensors={sortable.sensors}
          collisionDetection={sortable.collisionDetection}
          onDragStart={sortable.onDragStart}
          onDragOver={sortable.onDragOver}
          onDragEnd={sortable.onDragEnd}
          onDragCancel={sortable.onDragCancel}
        >
          <SortableContext items={sortable.itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {safeBlocks.map((block, index) => (
                <div key={sortable.itemIds[index]} className={`${adminGlassCard} p-4`}>
                  <SortableBlockRow
                    block={block}
                    index={index}
                    label={BLOCK_LABELS[block.type] ?? block.type}
                    disabled={disabled}
                    showDropIndicator={showDropBefore(index)}
                    onDelete={() => deleteBlock(index)}
                  >
                    <BlockEditorContent
                      block={block}
                      onChange={(next) => updateBlock(index, next)}
                    />
                  </SortableBlockRow>
                </div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {sortable.activeId ? (
              <div className="rounded-xl border border-accent-coral/40 bg-zinc-900/95 px-4 py-3 text-xs font-semibold text-accent-coral shadow-lg">
                Trascina blocco…
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
