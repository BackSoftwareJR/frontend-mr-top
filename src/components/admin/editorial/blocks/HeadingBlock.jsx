const inputClass =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

export default function HeadingBlock({ block, onChange }) {
  const data = block.data ?? {}

  const update = (patch) => {
    onChange({ ...block, data: { ...data, ...patch } })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Livello</label>
        <select
          value={data.level ?? 2}
          onChange={(e) => update({ level: Number(e.target.value) })}
          className={`${inputClass} max-w-[5rem]`}
        >
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
      </div>
      <input
        type="text"
        value={data.text ?? ''}
        onChange={(e) => update({ text: e.target.value })}
        placeholder="Testo del titolo"
        className={inputClass}
      />
    </div>
  )
}
