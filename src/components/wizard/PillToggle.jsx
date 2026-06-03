import { motion } from 'framer-motion'

export default function PillToggle({ options, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selected === option.value
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`
              rounded-full px-7 py-4 text-sm font-bold transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-warm/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream
              ${
                isSelected
                  ? 'bg-gradient-to-r from-coral to-coral-deep text-white shadow-coral'
                  : 'border-2 border-peach/50 bg-glass text-warm-text shadow-peach hover:border-teal-warm/40 hover:bg-peach-soft/80'
              }
            `}
          >
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}
