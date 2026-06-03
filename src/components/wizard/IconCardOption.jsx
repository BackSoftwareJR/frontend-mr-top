import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function IconCardOption({ option, selected, onSelect }) {
  const Icon = option.icon

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option.value)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full rounded-3xl border-2 p-6 text-left transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
        ${
          selected
            ? 'border-teal-700 bg-teal-50 shadow-lg shadow-teal-900/10'
            : 'border-slate-100 bg-white shadow-md shadow-slate-200/40 hover:border-teal-200 hover:shadow-lg'
        }
      `}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-teal-800 text-white"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.span>
      )}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
          selected ? 'bg-teal-800 text-white' : 'bg-teal-50 text-teal-800'
        }`}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">{option.label}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{option.description}</p>
    </motion.button>
  )
}
