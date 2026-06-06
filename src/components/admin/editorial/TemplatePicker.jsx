import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import LayoutSection from './layouts/LayoutSection'
import { LAYOUT_CATEGORIES, listLayoutTemplates } from './layouts/registry'

const PREVIEW_SCALE = 0.22

const CATEGORY_TAB_LABELS = {
  intro: 'Introduzione',
  content: 'Contenuto',
  trust: 'Fiducia',
  action: 'Azione',
}

function TemplatePreview({ template }) {
  const accent = template.previewAccent ?? '#E07A5F'

  return (
    <div
      className="relative h-32 overflow-hidden rounded-lg bg-[#FDFBF7] ring-1 ring-[#E07A5F]/10"
      style={{ boxShadow: `inset 0 3px 0 0 ${accent}` }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none origin-top-left"
          style={{
            transform: `scale(${PREVIEW_SCALE})`,
            width: `${100 / PREVIEW_SCALE}%`,
          }}
        >
          <LayoutSection
            templateId={template.id}
            slots={template.defaultSlots}
            editMode={false}
            disabled
          />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#1F2937]/0 opacity-0 transition-all duration-200 group-hover:bg-[#E07A5F]/85 group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#E07A5F] shadow-md">
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </span>
      </div>
    </div>
  )
}

function TemplateCard({ template, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#E07A5F]/15 bg-white text-left shadow-sm transition-all hover:border-[#E07A5F]/40 hover:shadow-md hover:shadow-[#E07A5F]/10"
    >
      <TemplatePreview template={template} />
      <div className="flex flex-1 flex-col p-3">
        <p className="font-semibold text-[#1F2937] group-hover:text-[#E07A5F]">{template.label}</p>
        <p className="mt-0.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#6B7280]">
          {template.description}
        </p>
      </div>
    </button>
  )
}

export default function TemplatePicker({
  open,
  onClose,
  onSelect,
  b2bMode = false,
  insertIndex = null,
}) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const templates = listLayoutTemplates(b2bMode)

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return templates.filter((template) => {
      const matchesCategory = activeCategory === 'all' || template.category === activeCategory
      if (!matchesCategory) return false
      if (!normalizedQuery) return true

      return (
        template.label.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [templates, query, activeCategory])

  if (!open) return null

  const insertHint =
    insertIndex !== null && insertIndex >= 0
      ? `Inserimento dopo la sezione ${insertIndex + 1}`
      : 'Inserimento in fondo al canvas'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Chiudi libreria sezioni"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-picker-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-[#E07A5F]/20 bg-[#FDFBF7] shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-[#E07A5F]/15 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="template-picker-title" className="text-lg font-semibold text-[#1F2937]">
                Libreria sezioni
              </h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Scegli un layout preimpostato — {insertHint.toLowerCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E07A5F]/20 p-2 text-[#6B7280] transition-colors hover:border-[#E07A5F]/40 hover:text-[#E07A5F]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per nome o descrizione…"
              className="w-full rounded-xl border border-[#E07A5F]/20 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#E07A5F]/50 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
            />
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-white text-[#6B7280] ring-1 ring-[#E07A5F]/15 hover:text-[#E07A5F]'
              }`}
            >
              Tutti
            </button>
            {LAYOUT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === category.id
                    ? 'bg-[#E07A5F] text-white'
                    : 'bg-white text-[#6B7280] ring-1 ring-[#E07A5F]/15 hover:text-[#E07A5F]'
                }`}
              >
                {CATEGORY_TAB_LABELS[category.id] ?? category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 h-8 w-8 text-[#E07A5F]/40" />
              <p className="text-sm font-medium text-[#1F2937]">Nessun layout trovato</p>
              <p className="mt-1 text-xs text-[#6B7280]">Prova un’altra ricerca o categoria</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={(id) => {
                    onSelect(id)
                    onClose()
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
