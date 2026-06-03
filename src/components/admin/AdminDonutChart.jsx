import { useState } from 'react'
import { adminGlassCard } from './adminStyles'

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function AdminDonutChart({ title, subtitle, segments, size = 160 }) {
  const [hovered, setHovered] = useState(null)
  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 8
  const innerR = outerR * 0.58
  const gap = 2

  const { slices } = segments.reduce(
    (state, seg, i) => {
      const sweep = (seg.percent / 100) * 360 - gap
      const start = state.angle + gap / 2
      const end = start + sweep
      state.slices.push({ ...seg, start, end, index: i })
      state.angle += (seg.percent / 100) * 360
      return state
    },
    { angle: 0, slices: [] }
  )

  const active = hovered !== null ? slices[hovered] : null
  const centerLabel = active ? active.label : `${segments.reduce((s, x) => s + x.percent, 0)}%`
  const centerSub = active ? `${active.percent}%` : 'Totale'

  return (
    <div className={`${adminGlassCard} p-4 sm:p-5`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white sm:text-base">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative shrink-0">
          <svg width={size} height={size} role="img" aria-label={title}>
            {slices.map((slice) => (
              <path
                key={slice.label}
                d={`${describeArc(cx, cy, outerR, slice.start, slice.end)} L ${polarToCartesian(cx, cy, innerR, slice.end).x} ${polarToCartesian(cx, cy, innerR, slice.end).y} ${describeArc(cx, cy, innerR, slice.end, slice.start)} Z`}
                fill={slice.color}
                opacity={hovered === null || hovered === slice.index ? 1 : 0.35}
                className="cursor-pointer transition-opacity"
                style={{
                  filter:
                    hovered === slice.index
                      ? `drop-shadow(0 0 8px ${slice.color}88)`
                      : undefined,
                }}
                onMouseEnter={() => setHovered(slice.index)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-white">{centerLabel}</span>
            <span className="text-[10px] text-zinc-500">{centerSub}</span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-2">
          {segments.map((seg, i) => (
            <li
              key={seg.label}
              className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                hovered === i ? 'bg-white/5' : ''
              }`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="flex min-w-0 items-center gap-2 text-zinc-400">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}66` }}
                />
                <span className="truncate">{seg.label}</span>
              </span>
              <span className="shrink-0 font-medium text-white">{seg.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
