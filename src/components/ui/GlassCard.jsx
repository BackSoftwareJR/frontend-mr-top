import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  ...props
}) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/12 bg-white/6 backdrop-blur-2xl ${className}`}
      whileHover={hover ? { y: -4, borderColor: 'rgba(255,255,255,0.22)' } : undefined}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
