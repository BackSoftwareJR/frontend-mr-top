import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'

const GlassCardMotion = lazy(() => import('./GlassCardMotion'))

export default function GlassCard({ children, className = '', hover = true, ...props }) {
  const isMobile = useIsMobile()
  const baseClass = `rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl ${className}`

  if (isMobile) {
    return (
      <div className={baseClass} {...props}>
        {children}
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className={baseClass} {...props}>
          {children}
        </div>
      }
    >
      <GlassCardMotion className={className} hover={hover} {...props}>
        {children}
      </GlassCardMotion>
    </Suspense>
  )
}
