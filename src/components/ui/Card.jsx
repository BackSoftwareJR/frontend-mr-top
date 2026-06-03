import { motion } from 'framer-motion'

const variants = {
  default:
    'bg-glass border border-glass-border shadow-card backdrop-blur-md',
  warm: 'bg-peach-soft/80 border border-peach/40 shadow-peach backdrop-blur-md',
  sunny: 'bg-sunny-soft/70 border border-sunny/50 shadow-[0_16px_40px_-12px_rgb(255_233_168/0.5)] backdrop-blur-md',
  teal: 'bg-teal-gentle/30 border border-teal-gentle/60 shadow-teal backdrop-blur-md',
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  hover = true,
  as: Component = motion.div,
  ...props
}) {
  const hoverProps = hover
    ? {
        whileHover: { y: -4, scale: 1.01 },
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      }
    : {}

  return (
    <Component
      className={`rounded-[2rem] p-8 ${variants[variant]} ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  )
}
