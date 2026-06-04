import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { prefetchRoute } from '../../utils/routePrefetch'

/**
 * Router link that warms the matching lazy chunk on touch/hover/focus.
 */
export default function PrefetchRouteLink({ to, onTouchStart, onMouseEnter, onFocus, ...props }) {
  const path = typeof to === 'string' ? to : (to?.pathname ?? '')

  const warm = useCallback(() => {
    prefetchRoute(path)
  }, [path])

  return (
    <Link
      to={to}
      onTouchStart={(event) => {
        warm()
        onTouchStart?.(event)
      }}
      onMouseEnter={(event) => {
        warm()
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        warm()
        onFocus?.(event)
      }}
      {...props}
    />
  )
}
