import { motion } from 'framer-motion'

const blobVariants = {
  peach: 'bg-peach/70',
  sunny: 'bg-sunny/60',
  teal: 'bg-teal-gentle/55',
}

export default function MeshGradientBackground({
  children,
  className = '',
  intensity = 'default',
  showBlobs = true,
}) {
  const blobScale = intensity === 'subtle' ? 'scale-90 opacity-60' : ''

  return (
    <div className={`relative overflow-hidden bg-cream ${className}`}>
      {showBlobs && (
        <div className={`pointer-events-none absolute inset-0 ${blobScale}`} aria-hidden>
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.08, 0.95, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full blur-[100px] ${blobVariants.peach}`}
          />
          <motion.div
            animate={{
              x: [0, -40, 25, 0],
              y: [0, 20, -30, 0],
              scale: [1, 0.92, 1.1, 1],
            }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className={`absolute -right-24 top-1/4 h-[32rem] w-[32rem] rounded-full blur-[110px] ${blobVariants.sunny}`}
          />
          <motion.div
            animate={{
              x: [0, 35, -15, 0],
              y: [0, -20, 25, 0],
              scale: [1, 1.05, 0.98, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className={`absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full blur-[95px] ${blobVariants.teal}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-transparent to-cream-deep/50" />
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
