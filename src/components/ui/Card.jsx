import { motion } from 'framer-motion'

const variants = {
  default: 'bg-white border border-zinc-200',
  muted: 'bg-[#F5F5F0] border border-zinc-200',
  forest: 'bg-[#1A4D2E] border border-[#1A4D2E] text-white',
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
        whileHover: { y: -2 },
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      }
    : {}

  return (
    <Component
      className={`rounded-2xl p-8 ${variants[variant]} ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  )
}
