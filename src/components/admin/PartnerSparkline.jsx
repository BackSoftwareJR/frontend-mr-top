export default function PartnerSparkline({ values, color = '#22d3ee', width = 80, height = 28 }) {
  if (!values?.length) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = 2
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * innerW
    const y = padding + innerH - ((v - min) / range) * innerH
    return `${x},${y}`
  })

  const polyline = points.join(' ')
  const last = points[points.length - 1].split(',')

  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden>
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        filter={`drop-shadow(0 0 3px ${color}66)`}
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}
