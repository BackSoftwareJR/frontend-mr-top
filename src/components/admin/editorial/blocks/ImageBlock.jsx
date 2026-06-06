const inputClass =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

export default function ImageBlock({ block, onChange }) {
  const data = block.data ?? {}

  const update = (patch) => {
    onChange({ ...block, data: { ...data, ...patch } })
  }

  return (
    <div className="space-y-3">
      <input
        type="url"
        value={data.url ?? ''}
        onChange={(e) => update({ url: e.target.value })}
        placeholder="URL immagine"
        className={inputClass}
      />
      <input
        type="text"
        value={data.alt ?? data.alt_text ?? ''}
        onChange={(e) => update({ alt: e.target.value })}
        placeholder="Testo alternativo (alt)"
        className={inputClass}
      />
      <input
        type="text"
        value={data.caption ?? ''}
        onChange={(e) => update({ caption: e.target.value })}
        placeholder="Didascalia (opzionale)"
        className={inputClass}
      />
      {data.url ? (
        <img
          src={data.url}
          alt={data.alt ?? ''}
          className="max-h-40 rounded-lg border border-white/10 object-cover"
        />
      ) : null}
    </div>
  )
}
