import { forwardRef } from 'react'

/**
 * Apple Intelligence-style border — vivid rotating conic gradient stroke only.
 */
const AppleIntelligenceBorder = forwardRef(function AppleIntelligenceBorder(
  {
    children,
    className = '',
    innerClassName = '',
    variant = 'default',
    as: Component = 'div',
    ...props
  },
  ref,
) {
  const variantClass =
    variant === 'sticky' ? 'apple-intelligence-border--sticky' : ''

  return (
    <Component
      ref={ref}
      className={`apple-intelligence-border ${variantClass} ${className}`.trim()}
      {...props}
    >
      <div className={`apple-intelligence-border__inner ${innerClassName}`.trim()}>
        {children}
      </div>
    </Component>
  )
})

export default AppleIntelligenceBorder
