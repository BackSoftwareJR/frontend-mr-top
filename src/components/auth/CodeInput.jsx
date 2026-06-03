import { useRef } from 'react'

export default function CodeInput({ value, onChange, disabled, error }) {
  const inputsRef = useRef([])

  const digits = value.padEnd(6, ' ').split('').slice(0, 6)

  const focusIndex = (index) => {
    inputsRef.current[index]?.focus()
  }

  const handleChange = (index, char) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d === ' ' ? '' : d)).join('').trimEnd()
    onChange(next.replace(/\s/g, ''))
    if (digit && index < 5) focusIndex(index + 1)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      focusIndex(index - 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) onChange(pasted)
  }

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`h-12 w-10 rounded-xl bg-white text-center text-lg font-semibold text-slate-800 ring-1 transition-shadow focus:outline-none sm:h-14 sm:w-12 ${
              error
                ? 'ring-red-300 focus:ring-2 focus:ring-red-400/40'
                : 'ring-black/5 focus:ring-2 focus:ring-accent-coral/25'
            } disabled:opacity-50`}
            aria-label={`Cifra ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
