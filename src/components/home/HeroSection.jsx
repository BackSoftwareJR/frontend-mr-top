import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import AnimatedText from '../ui/AnimatedText'
import MagneticButton from '../ui/MagneticButton'
import BentoSteps from './BentoSteps'
import AuroraBackground from '../layout/AuroraBackground'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-xl"
      >
        <HeartHandshake className="h-4 w-4 text-pink-400" strokeWidth={2} />
        <span className="text-xs font-semibold tracking-wide text-white/70 uppercase">
          CareAdvisor
        </span>
      </motion.div>

      <AnimatedText
        as="h1"
        trigger="mount"
        text="La guida sicura per chi ami."
        className="text-gradient mb-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-12 max-w-2xl text-lg font-medium text-white/60 sm:text-xl md:text-2xl"
      >
        L&apos;intelligenza di un algoritmo, l&apos;empatia di un concierge.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <MagneticButton to="/wizard">Inizia l&apos;analisi gratuita</MagneticButton>
      </motion.div>

      <BentoSteps />
    </section>
  )
}

export function HomePageContent() {
  return (
    <>
      <AuroraBackground />
      <div className="relative z-10">
        <HomeNav />
        <HeroSection />
      </div>
    </>
  )
}

function HomeNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 backdrop-blur-2xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
            <HeartHandshake className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white">CareAdvisor</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden text-xs font-semibold text-white/60 transition-colors hover:text-white sm:block"
          >
            Area B2B
          </Link>
          <MagneticButton to="/wizard" className="!px-5 !py-2.5 !text-sm">
            Inizia ora
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  )
}
