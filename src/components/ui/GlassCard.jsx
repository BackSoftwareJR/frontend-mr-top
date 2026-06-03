import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  ...props
}) {
  return (
    <motion.div
      className={`rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)' } : undefined}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
