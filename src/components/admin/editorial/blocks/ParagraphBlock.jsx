const inputClass =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

export default function ParagraphBlock({ block, onChange }) {
  const data = block.data ?? {}
  const text = data.text ?? data.html?.replace(/<[^>]+>/g, '') ?? ''

  return (
    <textarea
      value={text}
      onChange={(e) => onChange({ ...block, data: { ...data, text: e.target.value } })}
      placeholder="Scrivi il paragrafo…"
      rows={4}
      className={`${inputClass} resize-y min-h-[6rem]`}
    />
  )
}
