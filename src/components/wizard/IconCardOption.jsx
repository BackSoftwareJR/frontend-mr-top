import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const accentColors = [
  'from-coral to-coral-deep',
  'from-teal-warm to-teal-deep',
  'from-sunny to-coral',
]

export default function IconCardOption({ option, selected, onSelect }) {
  const Icon = option.icon
  const accentIndex =
    option.value === 'autosufficiente'
      ? 0
      : option.value === 'parziale'
        ? 1
        : 2
  const accent = accentColors[accentIndex]

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option.value)}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full rounded-[2rem] border-2 p-6 text-left transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream
        ${
          selected
            ? 'border-coral bg-peach-soft/90 shadow-coral'
            : 'border-peach/40 bg-glass shadow-card hover:border-coral/50 hover:shadow-peach backdrop-blur-md'
        }
      `}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral to-coral-deep text-white shadow-coral"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.span>
      )}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${accent} text-white shadow-coral`}
      >
        <Icon className="h-7 w-7" strokeWidth={2} />
      </div>
      <h3 className="mb-1 text-lg font-bold text-warm-text">{option.label}</h3>
      <p className="text-sm font-medium leading-relaxed text-warm-muted">
        {option.description}
      </p>
    </motion.button>
  )
}
