const inputClass =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

export default function CalloutBlock({ block, onChange }) {
  const data = block.data ?? {}

  const update = (patch) => {
    onChange({ ...block, data: { ...data, ...patch } })
  }

  return (
    <div className="space-y-3">
      <select
        value={data.variant ?? 'info'}
        onChange={(e) => update({ variant: e.target.value })}
        className={inputClass}
      >
        <option value="info">Info</option>
        <option value="tip">Suggerimento</option>
        <option value="warning">Attenzione</option>
        <option value="success">Successo</option>
      </select>
      <input
        type="text"
        value={data.title ?? ''}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="Titolo callout (opzionale)"
        className={inputClass}
      />
      <textarea
        value={data.text ?? data.html?.replace(/<[^>]+>/g, '') ?? ''}
        onChange={(e) => update({ text: e.target.value })}
        placeholder="Testo del callout…"
        rows={3}
        className={`${inputClass} resize-y min-h-[4rem]`}
      />
    </div>
  )
}
