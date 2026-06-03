import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-coral text-white shadow-coral hover:bg-coral-deep hover:shadow-[0_16px_40px_-8px_rgb(255_107_74/0.55)]',
  secondary:
    'bg-glass text-teal-warm border border-glass-border shadow-teal hover:bg-white/80 hover:text-teal-deep',
  sunny:
    'bg-sunny text-warm-text shadow-[0_12px_32px_-8px_rgb(255_233_168/0.7)] hover:bg-sunny-soft',
  teal:
    'bg-teal-warm text-white shadow-teal hover:bg-teal-deep',
}

const pulseShadows = {
  primary: [
    '0 12px 32px -8px rgb(255 107 74 / 0.4)',
    '0 16px 44px -6px rgb(255 107 74 / 0.55)',
    '0 12px 32px -8px rgb(255 107 74 / 0.4)',
  ],
  teal: [
    '0 12px 32px -8px rgb(45 155 142 / 0.3)',
    '0 16px 44px -6px rgb(45 155 142 / 0.45)',
    '0 12px 32px -8px rgb(45 155 142 / 0.3)',
  ],
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  pulse = false,
  ...props
}) {
  const pulseKey = variant === 'teal' ? 'teal' : 'primary'

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      animate={
        pulse
          ? { boxShadow: pulseShadows[pulseKey] }
          : undefined
      }
      transition={
        pulse
          ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 420, damping: 22 }
      }
      className={`
        inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
        text-sm font-bold tracking-wide transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
