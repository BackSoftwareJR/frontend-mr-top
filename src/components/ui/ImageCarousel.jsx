import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
}

export default function ImageCarousel({
  items,
  autoPlay = true,
  interval = 5000,
  className = '',
}) {
  const [[currentIndex, direction], setSlide] = useState([0, 0])

  const paginate = useCallback(
    (newDirection) => {
      setSlide(([prev]) => {
        const next = (prev + newDirection + items.length) % items.length
        return [next, newDirection]
      })
    },
    [items.length],
  )

  const goTo = useCallback(
    (index) => {
      setSlide(([prev]) => [index, index > prev ? 1 : -1])
    },
    [],
  )

  if (!items.length) return null

  const item = items[currentIndex]

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[16/9]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              {item.tag && (
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {item.tag}
                </span>
              )}
              <h3 className="text-xl font-bold text-white sm:text-2xl">{item.title}</h3>
              {item.description && (
                <p className="mt-1 max-w-lg text-sm text-white/85 sm:text-base">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => paginate(-1)}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:left-4"
        aria-label="Immagine precedente"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => paginate(1)}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:right-4"
        aria-label="Immagine successiva"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 bg-[#E07A5F]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Vai alla slide ${index + 1}`}
          />
        ))}
      </div>

      {autoPlay && (
        <AutoPlay paginate={paginate} interval={interval} />
      )}
    </div>
  )
}

function AutoPlay({ paginate, interval }) {
  useEffect(() => {
    const id = setInterval(() => paginate(1), interval)
    return () => clearInterval(id)
  }, [paginate, interval])

  return null
}
