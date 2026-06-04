import { useIsMobile } from '../utils/performanceTier'
import { MotionButton } from '../utils/motionProxy'

const variants = {
  primary:
    'bg-[#E07A5F] text-white hover:bg-[#c96a52]',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:border-[#E07A5F] hover:text-[#E07A5F]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800',
}

const baseClass = `
  inline-flex items-center justify-center gap-2 rounded-[2rem] px-6 py-3
  text-sm font-bold tracking-wide transition-colors duration-200
  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]
  disabled:cursor-not-allowed disabled:opacity-50
`

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const isMobile = useIsMobile()
  const classes = `${baseClass} ${variants[variant]} ${className}`

  if (isMobile) {
    return (
      <button className={classes} {...props}>
        {children}
      </button>
    )
  }

  return (
    <MotionButton
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={classes}
      {...props}
    >
      {children}
    </MotionButton>
  )
}
