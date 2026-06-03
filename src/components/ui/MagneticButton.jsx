import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const springConfig = { stiffness: 300, damping: 20, mass: 0.5 }
const MotionLink = motion.create(Link)

export default function MagneticButton({
  children,
  to,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
}) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.25)
    y.set((e.clientY - centerY) * 0.25)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const baseStyles =
    'relative inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8A72]/40'

  const variants = {
    primary:
      'bg-[#5B8A72] text-white glow-sage hover:bg-[#4A7360] hover:shadow-[0_6px_20px_rgba(91,138,114,0.35)]',
    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#5B8A72]/40 hover:text-[#5B8A72]',
  }

  const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${className}`

  const motionProps = {
    ref,
    style: { x: springX, y: springY },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  }

  if (to) {
    return (
      <MotionLink to={to} className={combinedClassName} {...motionProps}>
        <span className="relative z-10">{children}</span>
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      {...motionProps}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
