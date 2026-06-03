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
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`
              rounded-full px-6 py-3.5 text-sm font-semibold transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
              ${
                isSelected
                  ? 'bg-teal-800 text-white shadow-lg shadow-teal-900/20'
                  : 'bg-white text-slate-700 shadow-md shadow-slate-200/50 hover:bg-teal-50 hover:text-teal-800'
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
