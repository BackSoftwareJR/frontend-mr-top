import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MotionDiv } from '../../utils/motionProxy'

export default function UnsupportedTopicMessage({ topic, animate = true }) {
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45 },
      }
    : {}

  return (
    <MotionDiv
      {...motionProps}
      className="rounded-3xl border border-amber-200/60 bg-amber-50/50 p-6 text-center sm:p-8"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-700">
        <Construction className="h-6 w-6" strokeWidth={2} />
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-800">
        Non siamo ancora in grado di aiutarti su questo argomento
      </h2>
      <p className="mx-auto max-w-md text-base leading-relaxed text-slate-600">
        {topic ? (
          <>
            Stiamo lavorando su <span className="font-medium">{topic}</span>. Torna presto — nel
            frattempo puoi esplorare altri temi legati all&apos;assistenza anziani.
          </>
        ) : (
          <>
            Ci stiamo lavorando — torna presto. Non generiamo risposte inventate: preferiamo
            essere onesti finché non abbiamo contenuti verificati.
          </>
        )}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Torna alla home
      </Link>
    </MotionDiv>
  )
}
