import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-[#1A4D2E] text-white hover:bg-[#245A38]',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200 hover:border-[#1A4D2E] hover:text-[#1A4D2E]',
  ghost:
    'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3
        text-sm font-bold tracking-wide transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4D2E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F0]
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
