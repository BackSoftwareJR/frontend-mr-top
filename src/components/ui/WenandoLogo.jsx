import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import WenandoWordmarkStatic from './WenandoWordmarkStatic'

const WenandoWordmarkMotion = lazy(() => import('./WenandoWordmarkMotion'))

export function WenandoMark({
  className,
  width = 64,
  height = 64,
  fetchPriority,
  alt = '',
}) {
  return (
    <picture>
      <source srcSet="/wenando-logo-96.webp" type="image/webp" media="(max-width: 768px)" />
      <source srcSet="/wenando-logo-96.webp" type="image/webp" />
      <img
        src="/wenando-logo-96.png"
        alt={alt}
        aria-hidden={alt ? undefined : true}
        width={width}
        height={height}
        decoding="async"
        fetchPriority={fetchPriority}
        className={`shrink-0 object-contain ${className || 'h-9 w-9'}`}
      />
    </picture>
  )
}

function WenandoWordmark({ size, className }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <WenandoWordmarkStatic size={size} className={className} />
  }

  return (
    <Suspense fallback={<WenandoWordmarkStatic size={size} className={className} />}>
      <WenandoWordmarkMotion size={size} className={className} />
    </Suspense>
  )
}

export default function WenandoLogo({
  size = 'md',
  className = '',
  align = 'start',
}) {
  const alignClass =
    align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'

  return (
    <div
      className={`inline-flex min-w-0 overflow-visible ${alignClass} ${className}`}
      aria-label="wenando"
      role="img"
    >
      <WenandoWordmark size={size} />
    </div>
  )
}
