import { X } from 'lucide-react'
import { LAYOUT_CATEGORIES, listLayoutTemplates } from './layouts/registry'

function TemplateCard({ template, onSelect }) {
  const previewColors = {
    intro: 'from-[#FFF4EC] to-[#FDFBF7]',
    content: 'from-white to-[#F9FAFB]',
    trust: 'from-[#1F2937] to-[#374151]',
    action: 'from-[#E07A5F] to-[#c96a52]',
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 text-left transition-all hover:border-accent-coral/40 hover:shadow-lg hover:shadow-accent-coral/10"
    >
      <div
        className={`relative flex h-28 items-end bg-gradient-to-br p-4 ${previewColors[template.category] ?? previewColors.content}`}
      >
        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
          {template.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-white group-hover:text-accent-coral">{template.label}</p>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{template.description}</p>
      </div>
    </button>
  )
}

export default function TemplatePicker({ open, onClose, onSelect, b2bMode = false }) {
  if (!open) return null

  const templates = listLayoutTemplates(b2bMode)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Chiudi libreria sezioni"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-picker-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-950 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="template-picker-title" className="text-lg font-semibold text-white">
              Libreria sezioni
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Scegli un layout preimpostato — clicca sul testo per modificarlo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {LAYOUT_CATEGORIES.map((category) => {
            const categoryTemplates = templates.filter((t) => t.category === category.id)
            if (categoryTemplates.length === 0) return null

            return (
              <div key={category.id} className="mb-8 last:mb-0">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {category.label}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates.map((template) => (
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
