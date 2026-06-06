import { useState } from 'react'
import { ChevronDown, ChevronUp, LayoutGrid, Plus, Trash2, Type } from 'lucide-react'
import TemplatePicker from './TemplatePicker'
import LayoutSection from './layouts/LayoutSection'
import BlockEditor from './BlockEditor'
import { createLayoutBlock } from './blockUtils'
import { getLayoutTemplate } from './layouts/registry'

function SectionToolbar({ index, total, label, onMoveUp, onMoveDown, onDelete, disabled }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-zinc-900/90 px-3 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
      <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={onMoveUp}
          className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"
          title="Sposta su"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled || index >= total - 1}
          onClick={onMoveDown}
          className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30"
          title="Sposta giù"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="rounded p-1 text-red-400/80 hover:text-red-400 disabled:opacity-30"
          title="Elimina sezione"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function TileEditor({ blocks, onChange, disabled = false, b2bMode = false }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [mode, setMode] = useState('visual')
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
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const deleteBlock = (index) => {
    onChange(safeBlocks.filter((_, i) => i !== index))
  }

  const addLayout = (templateId) => {
    onChange([...safeBlocks, createLayoutBlock(templateId)])
  }

  const addParagraph = () => {
    onChange([...safeBlocks, createLayoutBlock('prose-block')])
  }

  const blockLabel = (block) => {
    if (block.type === 'layout') {
      return getLayoutTemplate(block.data?.template_id)?.label ?? 'Layout'
    }
    return block.type
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

      {mode === 'advanced' ? (
        <BlockEditor blocks={safeBlocks} onChange={onChange} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#FDFBF7] p-4 sm:p-6">
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
            <div className="space-y-6">
              {safeBlocks.map((block, index) => (
                <div key={block.id ?? index} className="group relative">
                  <SectionToolbar
                    index={index}
                    total={safeBlocks.length}
                    label={blockLabel(block)}
                    onMoveUp={() => moveBlock(index, -1)}
                    onMoveDown={() => moveBlock(index, 1)}
                    onDelete={() => deleteBlock(index)}
                    disabled={disabled}
                  />

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
                      />
                    </div>
                  )}
                </div>
              ))}

              {!disabled ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E07A5F]/30 py-6 text-sm font-medium text-[#E07A5F] transition-colors hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/5"
                >
                  <Plus className="h-4 w-4" />
                  Aggiungi sezione
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}

      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addLayout}
        b2bMode={b2bMode}
      />
    </div>
  )
}
