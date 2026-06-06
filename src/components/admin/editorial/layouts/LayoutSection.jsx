import InlineEditable from './InlineEditable'
import { CoralWaveBg, DotPatternBg } from './BackgroundSvg'
import { getLayoutTemplate } from './registry'

function updateSlot(slots, key, value, onSlotsChange) {
  onSlotsChange({ ...slots, [key]: value })
}

function HeroCoral({ slots, onSlotsChange, editMode, disabled }) {
  return (
    <section className="editorial-layout editorial-layout--hero-coral relative overflow-hidden rounded-2xl bg-[#FDFBF7] px-6 py-10 sm:px-10 sm:py-14">
      <CoralWaveBg />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <InlineEditable
          value={slots.eyebrow}
          onChange={(v) => updateSlot(slots, 'eyebrow', v, onSlotsChange)}
          placeholder="Etichetta rubrica"
          disabled={disabled || !editMode}
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E07A5F]"
        />
        <InlineEditable
          as="h2"
          value={slots.title}
          onChange={(v) => updateSlot(slots, 'title', v, onSlotsChange)}
          placeholder="Titolo principale"
          disabled={disabled || !editMode}
          className="font-serif text-3xl font-bold leading-tight text-[#1F2937] sm:text-4xl"
        />
        <InlineEditable
          value={slots.subtitle}
          onChange={(v) => updateSlot(slots, 'subtitle', v, onSlotsChange)}
          placeholder="Sottotitolo"
          multiline
          disabled={disabled || !editMode}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6B7280]"
        />
        <InlineEditable
          value={slots.cta}
          onChange={(v) => updateSlot(slots, 'cta', v, onSlotsChange)}
          placeholder="Invito alla lettura"
          disabled={disabled || !editMode}
          className="mt-6 inline-block text-sm font-medium text-[#E07A5F]"
        />
      </div>
    </section>
  )
}

function ProseBlock({ slots, onSlotsChange, editMode, disabled }) {
  return (
    <section className="editorial-layout editorial-layout--prose rounded-xl bg-white px-6 py-6 sm:px-8">
      <InlineEditable
        value={slots.body}
        onChange={(v) => updateSlot(slots, 'body', v, onSlotsChange)}
        placeholder="Scrivi il testo qui…"
        multiline
        disabled={disabled || !editMode}
        className="font-serif text-lg leading-[1.75] text-[#1F2937] whitespace-pre-wrap"
      />
    </section>
  )
}

function SplitTextImage({ slots, onSlotsChange, editMode, disabled }) {
  const hasImage = Boolean(slots.image_url?.trim())

  return (
    <section className="editorial-layout editorial-layout--split grid gap-6 rounded-2xl bg-white p-6 sm:grid-cols-2 sm:p-8">
      <div>
        <InlineEditable
          as="h3"
          value={slots.title}
          onChange={(v) => updateSlot(slots, 'title', v, onSlotsChange)}
          placeholder="Titolo sezione"
          disabled={disabled || !editMode}
          className="mb-3 font-serif text-xl font-bold text-[#1F2937]"
        />
        <InlineEditable
          value={slots.body}
          onChange={(v) => updateSlot(slots, 'body', v, onSlotsChange)}
          placeholder="Testo descrittivo"
          multiline
          disabled={disabled || !editMode}
          className="text-base leading-relaxed text-[#4B5563] whitespace-pre-wrap"
        />
        {editMode && !disabled ? (
          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              URL immagine (SEO)
            </label>
            <input
              type="url"
              value={slots.image_url ?? ''}
              onChange={(e) => updateSlot(slots, 'image_url', e.target.value, onSlotsChange)}
              placeholder="https://…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
            />
            <input
              type="text"
              value={slots.image_alt ?? ''}
              onChange={(e) => updateSlot(slots, 'image_alt', e.target.value, onSlotsChange)}
              placeholder="Alt text (accessibilità + SEO)"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
            />
          </div>
        ) : null}
      </div>
      <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl bg-[#FDFBF7]">
        <DotPatternBg />
        {hasImage ? (
          <img
            src={slots.image_url}
            alt={slots.image_alt || ''}
            className="relative z-10 max-h-64 w-full rounded-xl object-cover"
          />
        ) : (
          <p className="relative z-10 px-4 text-center text-sm text-zinc-400">
            {editMode ? 'Aggiungi URL immagine nel pannello' : 'Immagine'}
          </p>
        )}
      </div>
    </section>
  )
}

function HighlightBand({ slots, onSlotsChange, editMode, disabled }) {
  const items = ['item1', 'item2', 'item3']

  return (
    <section className="editorial-layout editorial-layout--highlight relative overflow-hidden rounded-2xl border border-[#E07A5F]/20 bg-gradient-to-br from-[#FFF4EC] to-[#FDFBF7] px-6 py-8 sm:px-10">
      <DotPatternBg />
      <div className="relative z-10">
        <InlineEditable
          as="h3"
          value={slots.title}
          onChange={(v) => updateSlot(slots, 'title', v, onSlotsChange)}
          placeholder="Titolo box"
          disabled={disabled || !editMode}
          className="mb-5 font-serif text-xl font-bold text-[#1F2937]"
        />
        <ul className="space-y-3">
          {items.map((key) => (
            <li key={key} className="flex gap-3 text-base text-[#374151]">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E07A5F]" aria-hidden />
              <InlineEditable
                value={slots[key]}
                onChange={(v) => updateSlot(slots, key, v, onSlotsChange)}
                placeholder="Punto elenco"
                disabled={disabled || !editMode}
                className="flex-1 leading-relaxed"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FaqBand({ slots, onSlotsChange, editMode, disabled }) {
  const pairs = [
    ['q1', 'a1'],
    ['q2', 'a2'],
    ['q3', 'a3'],
  ]

  return (
    <section className="editorial-layout editorial-layout--faq rounded-2xl bg-white px-6 py-8 sm:px-10">
      <InlineEditable
        as="h3"
        value={slots.title}
        onChange={(v) => updateSlot(slots, 'title', v, onSlotsChange)}
        placeholder="Domande frequenti"
        disabled={disabled || !editMode}
        className="mb-6 font-serif text-xl font-bold text-[#1F2937]"
      />
      <div className="space-y-3">
        {pairs.map(([qKey, aKey]) => (
          <details
            key={qKey}
            className="group rounded-xl border border-zinc-200 bg-[#FDFBF7] open:border-[#E07A5F]/30"
            open={editMode}
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-medium text-[#1F2937] marker:content-none [&::-webkit-details-marker]:hidden">
              <InlineEditable
                value={slots[qKey]}
                onChange={(v) => updateSlot(slots, qKey, v, onSlotsChange)}
                placeholder="Domanda"
                disabled={disabled || !editMode}
                className="inline font-medium"
              />
            </summary>
            <div className="border-t border-zinc-200/80 px-4 py-3 text-[#4B5563]">
              <InlineEditable
                value={slots[aKey]}
                onChange={(v) => updateSlot(slots, aKey, v, onSlotsChange)}
                placeholder="Risposta"
                multiline
                disabled={disabled || !editMode}
                className="leading-relaxed whitespace-pre-wrap"
              />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

function QuoteSpotlight({ slots, onSlotsChange, editMode, disabled }) {
  return (
    <section className="editorial-layout editorial-layout--quote relative overflow-hidden rounded-2xl bg-[#1F2937] px-8 py-10 text-center">
      <DotPatternBg className="opacity-20" />
      <blockquote className="relative z-10">
        <InlineEditable
          value={slots.quote}
          onChange={(v) => updateSlot(slots, 'quote', v, onSlotsChange)}
          placeholder="Citazione"
          multiline
          disabled={disabled || !editMode}
          className="font-serif text-xl italic leading-relaxed text-white sm:text-2xl whitespace-pre-wrap"
        />
        <InlineEditable
          value={slots.author}
          onChange={(v) => updateSlot(slots, 'author', v, onSlotsChange)}
          placeholder="Autore"
          disabled={disabled || !editMode}
          className="mt-4 text-sm text-[#E07A5F]"
        />
      </blockquote>
    </section>
  )
}

function StatsRow({ slots, onSlotsChange, editMode, disabled }) {
  const stats = [
    ['stat1_value', 'stat1_label'],
    ['stat2_value', 'stat2_label'],
    ['stat3_value', 'stat3_label'],
  ]

  return (
    <section className="editorial-layout editorial-layout--stats grid gap-4 rounded-2xl bg-white p-6 sm:grid-cols-3 sm:p-8">
      {stats.map(([valueKey, labelKey]) => (
        <div key={valueKey} className="rounded-xl bg-[#FDFBF7] px-4 py-6 text-center">
          <InlineEditable
            value={slots[valueKey]}
            onChange={(v) => updateSlot(slots, valueKey, v, onSlotsChange)}
            placeholder="00"
            disabled={disabled || !editMode}
            className="font-serif text-3xl font-bold text-[#E07A5F]"
          />
          <InlineEditable
            value={slots[labelKey]}
            onChange={(v) => updateSlot(slots, labelKey, v, onSlotsChange)}
            placeholder="Etichetta"
            disabled={disabled || !editMode}
            className="mt-1 text-sm text-[#6B7280]"
          />
        </div>
      ))}
    </section>
  )
}

function CtaCoral({ slots, onSlotsChange, editMode, disabled }) {
  return (
    <section className="editorial-layout editorial-layout--cta relative overflow-hidden rounded-2xl bg-[#E07A5F] px-8 py-10 text-center text-white">
      <CoralWaveBg className="opacity-30" />
      <div className="relative z-10 mx-auto max-w-lg">
        <InlineEditable
          as="h3"
          value={slots.title}
          onChange={(v) => updateSlot(slots, 'title', v, onSlotsChange)}
          placeholder="Titolo invito"
          disabled={disabled || !editMode}
          className="font-serif text-2xl font-bold"
        />
        <InlineEditable
          value={slots.body}
          onChange={(v) => updateSlot(slots, 'body', v, onSlotsChange)}
          placeholder="Testo descrittivo"
          multiline
          disabled={disabled || !editMode}
          className="mt-3 text-base leading-relaxed text-white/90 whitespace-pre-wrap"
        />
        {editMode && !disabled ? (
          <div className="mt-6 space-y-2">
            <input
              type="text"
              value={slots.button_label ?? ''}
              onChange={(e) => updateSlot(slots, 'button_label', e.target.value, onSlotsChange)}
              placeholder="Testo pulsante"
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60"
            />
            <input
              type="url"
              value={slots.button_url ?? ''}
              onChange={(e) => updateSlot(slots, 'button_url', e.target.value, onSlotsChange)}
              placeholder="URL pulsante"
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60"
            />
          </div>
        ) : (
          <span className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#E07A5F]">
            {slots.button_label || 'Azione'}
          </span>
        )}
      </div>
    </section>
  )
}

const TEMPLATE_COMPONENTS = {
  'hero-coral': HeroCoral,
  'prose-block': ProseBlock,
  'split-text-image': SplitTextImage,
  'highlight-band': HighlightBand,
  'faq-band': FaqBand,
  'quote-spotlight': QuoteSpotlight,
  'stats-row': StatsRow,
  'cta-coral': CtaCoral,
}

/**
 * Renders a layout block (editor canvas or read-only preview).
 */
export default function LayoutSection({
  templateId,
  slots,
  onSlotsChange,
  editMode = true,
  disabled = false,
}) {
  const template = getLayoutTemplate(templateId)
  const Component = TEMPLATE_COMPONENTS[templateId]

  if (!template || !Component) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Layout sconosciuto: {templateId}
      </div>
    )
  }

  const safeSlots = { ...template.defaultSlots, ...slots }

  return (
    <Component
      slots={safeSlots}
      onSlotsChange={onSlotsChange ?? (() => {})}
      editMode={editMode}
      disabled={disabled}
    />
  )
}
