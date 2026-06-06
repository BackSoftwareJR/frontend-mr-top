import { motion } from 'framer-motion'
import { useRef } from 'react'
import HomeSearchBar from './HomeSearchBar'
import MulticolorHeading from '../ui/MulticolorHeading'
import WenandoLogo, { WenandoMark } from '../ui/WenandoLogo'
import SectionBlob from '../ui/SectionBlob'
import { HOME_HERO } from '../../constants/siteCopy'

export default function HeroSectionDesktop() {
  const heroDotRef = useRef(null)

  return (
    <section
      id="hero"
      className="relative flex min-h-0 flex-col items-center justify-center overflow-x-clip px-6 pb-20 pt-28 text-center sm:min-h-[88vh] sm:pb-24 sm:pt-32 md:min-h-[85vh]"
    >
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <div className="relative z-10 mb-8 flex flex-col items-center gap-3 md:hidden">
        <WenandoMark
          className="h-24 w-24"
          width={96}
          height={96}
          fetchPriority="high"
        />
        <WenandoLogo size="lg" align="center" />
      </div>

      <MulticolorHeading
        as="h1"
        words={HOME_HERO.title}
        className="relative z-10 mb-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl"
        startIndex={0}
        neutralWords={[0, 3, 4]}
        trigger="mount"
        trailingAnchorRef={heroDotRef}
        trailingAnchorProps={{
          'data-scroll-anchor': 'hero-dot',
          'data-scroll-label': 'Inizio percorso',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mb-10 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 sm:mb-12 sm:text-xl md:text-2xl"
      >
        {HOME_HERO.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 mt-2 flex w-full max-w-xl justify-center px-2"
      >
        <HomeSearchBar />
      </motion.div>
    </section>
  )
}
