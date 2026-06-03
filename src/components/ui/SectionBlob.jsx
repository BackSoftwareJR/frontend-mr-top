const VARIANTS = {
  coral: { fill: '#E07A5F', opacity: 0.08 },
  amber: { fill: '#E9A84A', opacity: 0.09 },
  violet: { fill: '#9B8EC4', opacity: 0.1 },
  teal: { fill: '#5CB8A8', opacity: 0.08 },
  rose: { fill: '#E879A0', opacity: 0.09 },
}

const SHAPES = {
  blob: (
    <path d="M320,80 C420,20 520,60 540,160 C560,260 480,340 380,360 C280,380 180,320 160,220 C140,120 220,140 320,80 Z" />
  ),
  circle: <circle cx="300" cy="200" r="160" />,
  wave: (
    <path d="M0,180 Q150,80 300,160 T600,140 L600,400 L0,400 Z" />
  ),
  ring: (
    <ellipse cx="280" cy="200" rx="200" ry="140" fill="none" strokeWidth="48" />
  ),
}

export default function SectionBlob({
  variant = 'coral',
  shape = 'blob',
  position = 'top-right',
  className = '',
}) {
  const colors = VARIANTS[variant] || VARIANTS.coral
  const shapeEl = SHAPES[shape] || SHAPES.blob
  const isRing = shape === 'ring'

  const positionClasses = {
    'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
    'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
    'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 400"
        className={`absolute h-[70%] w-[70%] max-h-[480px] max-w-[480px] sm:h-[80%] sm:w-[80%] ${positionClasses[position] || positionClasses['top-right']}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {isRing ? (
          <ellipse
            cx="280"
            cy="200"
            rx="200"
            ry="140"
            fill="none"
            stroke={colors.fill}
            strokeWidth="48"
            opacity={colors.opacity * 2.5}
          />
        ) : (
          <g fill={colors.fill} opacity={colors.opacity}>
            {shapeEl}
          </g>
        )}
      </svg>
    </div>
  )
}
