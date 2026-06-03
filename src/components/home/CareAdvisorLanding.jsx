import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HeartHandshake,
  Gift,
  Zap,
  ShieldCheck,
} from 'lucide-react'

const NEED_OPTIONS = [
  { id: 'genitore', label: 'Per un genitore' },
  { id: 'coniuge', label: 'Per il coniuge' },
  { id: 'me', label: 'Per me' },
]

const TRUST_ITEMS = [
  { icon: Gift, label: '100% Gratuito' },
  { icon: Zap, label: 'Risposte rapide' },
  { icon: ShieldCheck, label: 'Strutture verificate' },
]

function LandingNavbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-xl items-center justify-between gap-4 rounded-full border border-white/60 bg-white/50 px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E07A5F] text-white">
            <HeartHandshake className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800">
            CareAdvisor
          </span>
        </Link>

        <a
          href="#come-funziona"
          className="text-xs font-semibold text-slate-600 transition-colors hover:text-[#E07A5F]"
        >
          Come funziona
        </a>

        <Link
          to="/wizard"
          className="shrink-0 rounded-full bg-[#E07A5F] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c96a52]"
        >
          Inizia ora
        </Link>
      </nav>
    </motion.header>
  )
}

function HeroSection() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mx-auto max-w-4xl text-center"
      >
        <h1 className="mb-5 text-6xl font-extrabold tracking-tighter text-slate-800 md:text-8xl">
          Trova l&apos;assistenza ideale.
        </h1>
        <p className="mb-14 text-lg font-medium text-slate-600 md:text-xl">
          Zero stress. Solo soluzioni.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.15,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="w-full max-w-lg"
      >
        <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-10">
          <p className="mb-6 text-center text-base font-semibold text-slate-800">
            Di cosa hai bisogno oggi?
          </p>

          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {NEED_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`
                  rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200
                  ${
                    selected === opt.id
                      ? 'bg-[#1E293B] text-white shadow-[0_8px_24px_rgba(30,41,59,0.2)]'
                      : 'bg-[#FAF9F6] text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Link to="/wizard" className="block">
            <motion.span
              animate={{
                boxShadow: [
                  '0 12px 32px rgba(224,122,95,0.35)',
                  '0 16px 40px rgba(224,122,95,0.5)',
                  '0 12px 32px rgba(224,122,95,0.35)',
                ],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex w-full items-center justify-center rounded-[2rem] bg-[#E07A5F] py-4 text-base font-bold text-white transition-colors hover:bg-[#c96a52]"
            >
              Inizia ora
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

function TrustBanner() {
  return (
    <section
      id="come-funziona"
      className="mx-auto max-w-3xl px-4 pb-24 sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
        {TRUST_ITEMS.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <Icon className="h-5 w-5 text-[#E07A5F]" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-800">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default function CareAdvisorLanding() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <LandingNavbar />
      <HeroSection />
      <TrustBanner />
    </div>
  )
}
