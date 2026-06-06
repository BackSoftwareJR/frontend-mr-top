import { useCallback, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutGrid, Plus, Type } from 'lucide-react'
import TemplatePicker from './TemplatePicker'
import LayoutSection from './layouts/LayoutSection'
import BlockEditor from './BlockEditor'
import SortableSection from './SortableSection'
import { createLayoutBlock, duplicateLayoutBlock } from './blockUtils'
import { getLayoutTemplate, QUICK_ADD_TEMPLATES } from './layouts/registry'
import { getSortableId, useSortableList } from './useSortableList'

export default function TileEditor({ blocks, onChange, disabled = false, b2bMode = false }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [mode, setMode] = useState('visual')
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const safeBlocks = Array.isArray(blocks) ? blocks : []

  const quickAddTemplates = QUICK_ADD_TEMPLATES.filter(({ id }) => {
    const template = getLayoutTemplate(id)
    return template && (!b2bMode || template.b2bAllowed)
  })

  const selectedIndex = safeBlocks.findIndex(
    (block, index) => getSortableId(block, index) === selectedSectionId
  )

  const updateBlock = (index, nextBlock) => {
    const next = [...safeBlocks]
    next[index] = nextBlock
    onChange(next)
  }

  const deleteBlock = (index) => {
    const removedId = getSortableId(safeBlocks[index], index)
    onChange(safeBlocks.filter((_, i) => i !== index))
    if (selectedSectionId === removedId) {
      setSelectedSectionId(null)
    }
  }

  const duplicateBlock = (index) => {
    const copy = duplicateLayoutBlock(safeBlocks[index])
    const next = [...safeBlocks]
    next.splice(index + 1, 0, copy)
    onChange(next)
    setSelectedSectionId(copy.id)
  }

  const addLayout = (templateId) => {
    const newBlock = createLayoutBlock(templateId)
    if (selectedIndex >= 0 && selectedIndex < safeBlocks.length) {
      const next = [...safeBlocks]
      next.splice(selectedIndex + 1, 0, newBlock)
      onChange(next)
      setSelectedSectionId(newBlock.id)
    } else {
      onChange([...safeBlocks, newBlock])
      setSelectedSectionId(newBlock.id)
    }
  }

  const addParagraph = () => {
    addLayout('prose-block')
  }

  const blockLabel = (block) => {
    if (block.type === 'layout') {
      return getLayoutTemplate(block.data?.template_id)?.label ?? 'Layout'
    }
    return block.type
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'visual'
                ? 'bg-accent-coral/20 text-accent-coral'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Canvas
          </button>
          <button
            type="button"
            onClick={() => setMode('advanced')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'advanced'
                ? 'bg-accent-coral/20 text-accent-coral'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            Avanzato
          </button>
        </div>

        {!disabled && mode === 'visual' ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-coral/40 bg-accent-coral/10 px-3 py-1.5 text-xs font-semibold text-accent-coral transition-colors hover:bg-accent-coral/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi sezione
            </button>
            <button
              type="button"
              onClick={addParagraph}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/20"
            >
              + Testo
            </button>
          </div>
        ) : null}
      </div>

      {!disabled && mode === 'visual' && quickAddTemplates.length > 0 ? (
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 pl-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Rapidi
          </span>
          {quickAddTemplates.map(({ id, chipLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => addLayout(id)}
              className="shrink-0 rounded-full border border-[#E07A5F]/25 bg-[#FDFBF7] px-3 py-1 text-xs font-medium text-[#1F2937] transition-colors hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/10 hover:text-[#E07A5F]"
            >
              {chipLabel}
            </button>
          ))}
        </div>
      ) : null}

      {mode === 'advanced' ? (
        <BlockEditor blocks={safeBlocks} onChange={onChange} disabled={disabled} />
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#FDFBF7] p-4 sm:p-6"
          onClick={() => setSelectedSectionId(null)}
        >
          {safeBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="mb-3 h-10 w-10 text-[#E07A5F]/40" />
              <p className="text-sm font-medium text-[#1F2937]">Inizia con una sezione</p>
              <p className="mt-1 max-w-xs text-xs text-[#6B7280]">
                Scegli un layout dalla libreria — hero, testo, FAQ, citazioni e altro. Tutto già
                ottimizzato per SEO.
              </p>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-4 rounded-full bg-[#E07A5F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c96a52]"
                >
                  Scegli layout
                </button>
              ) : null}
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
                <div className="space-y-6">
                  {safeBlocks.map((block, index) => {
                    const sectionId = getSortableId(block, index)

                    return (
                      <SortableSection
                        key={sectionId}
                        block={block}
                        index={index}
                        label={blockLabel(block)}
                        selected={selectedSectionId === sectionId}
                        disabled={disabled}
                        showDropIndicator={showDropBefore(index)}
                        onSelect={setSelectedSectionId}
                        onDuplicate={() => duplicateBlock(index)}
                        onDelete={() => deleteBlock(index)}
                      >
                        {block.type === 'layout' ? (
                          <LayoutSection
                            templateId={block.data?.template_id}
                            slots={block.data?.slots ?? {}}
                            onSlotsChange={(slots) =>
                              updateBlock(index, {
                                ...block,
                                data: { ...block.data, slots },
                              })
                            }
                            editMode
                            disabled={disabled}
                          />
                        ) : (
                          <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <p className="mb-2 text-[10px] font-semibold uppercase text-zinc-400">
                              Blocco legacy: {block.type}
                            </p>
                            <BlockEditor
                              blocks={[block]}
                              onChange={(next) => updateBlock(index, next[0])}
                              disabled={disabled}
                            />
                          </div>
                        )}
                      </SortableSection>
                    )
                  })}

                  {!disabled ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSectionId(null)
                        setPickerOpen(true)
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E07A5F]/30 py-6 text-sm font-medium text-[#E07A5F] transition-colors hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/5"
                    >
                      <Plus className="h-4 w-4" />
                      Aggiungi sezione
                    </button>
                  ) : null}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {sortable.activeId ? (
                  <div className="rounded-xl border-2 border-[#E07A5F]/40 bg-white/90 px-4 py-3 text-xs font-semibold text-[#E07A5F] shadow-lg">
                    Trascina sezione…
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      )}

      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addLayout}
        b2bMode={b2bMode}
        insertIndex={selectedIndex >= 0 ? selectedIndex : null}
      />
    </div>
  )
}
