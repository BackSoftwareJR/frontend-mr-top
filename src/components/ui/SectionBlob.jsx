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
    'top-right': 'top-0 right-0 translate-x-[15%] -translate-y-[15%]',
    'top-left': 'top-0 left-0 -translate-x-[15%] -translate-y-[15%]',
    'bottom-right': 'bottom-0 right-0 translate-x-[15%] translate-y-[15%]',
    'bottom-left': 'bottom-0 left-0 -translate-x-[15%] translate-y-[15%]',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90',
  }

  const positionClass = positionClasses[position] || positionClasses['top-right']

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <div
        className={`absolute h-[65%] w-[65%] max-h-[440px] max-w-[440px] max-md:h-[55%] max-md:w-[55%] max-md:max-h-[360px] max-md:max-w-[360px] sm:h-[75%] sm:w-[75%] ${positionClass}`}
      >
        <div className="section-blob-layer h-full w-full">
        <svg
          viewBox="0 0 600 400"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
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
      </div>
    </div>
  )
}
