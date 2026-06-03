import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-teal-800 text-white shadow-lg shadow-teal-900/20 hover:bg-teal-900 hover:shadow-xl hover:shadow-teal-900/25',
  secondary: 'bg-white/80 text-teal-800 border border-teal-100 shadow-md shadow-slate-200/50 hover:bg-white hover:border-teal-200',
  sage: 'bg-emerald-100 text-emerald-800 shadow-md shadow-emerald-200/40 hover:bg-emerald-200',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  pulse = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      animate={
        pulse
          ? {
              boxShadow: [
                '0 10px 25px -5px rgb(15 118 110 / 0.2)',
                '0 10px 35px -5px rgb(15 118 110 / 0.35)',
                '0 10px 25px -5px rgb(15 118 110 / 0.2)',
              ],
            }
          : undefined
      }
      transition={
        pulse
          ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 25 }
      }
      className={`
        inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
        text-sm font-semibold tracking-wide transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
