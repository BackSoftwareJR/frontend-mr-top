import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WenandoMark } from '../ui/WenandoLogo'
import B2BOnboardingShell from './B2BOnboardingShell'
import { ONBOARDING_STEP_LABELS } from '../../services/b2bOnboardingService'
import { STEP_ACCENTS, obGlassCardSm, obGlassPanel } from './onboardingStyles'
import { MaybeAnimatePresence, MotionDiv, MotionLi } from '../../utils/motionProxy'

const stepMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
}

function StepIndicator({ steps, currentIndex }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        const accent = STEP_ACCENTS[index] ?? STEP_ACCENTS[0]
        const base = done
          ? 'border-black/5 bg-white/60'
          : active
            ? accent.active
            : 'border-transparent bg-white/40 opacity-60'

        return (
          <MotionLi
            key={step.id}
            layout
            className={`flex items-start gap-3 rounded-2xl border px-3 py-3 backdrop-blur-md transition-colors ${base}`}
            animate={active ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-accent-teal-dark text-white'
                  : active
                    ? accent.dot
                    : 'bg-black/5 text-charcoal-muted'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  active ? accent.label : done ? 'text-charcoal' : 'text-charcoal-muted'
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-charcoal-muted">{step.description}</p>
            </div>
          </MotionLi>
        )
      })}
    </ol>
  )
}

export default function OnboardingLayout({
  currentStepIndex,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <B2BOnboardingShell>
      <div className="flex min-h-screen">
        <aside className="hidden w-[19rem] shrink-0 flex-col border-r border-black/5 bg-white/50 px-6 py-8 backdrop-blur-2xl lg:flex">
          <Link to="/" className="mb-10 inline-flex items-center gap-2.5">
            <WenandoMark className="h-9 w-9" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Wenando Pro</p>
              <p className="text-xs text-charcoal-muted">Onboarding Partner</p>
            </div>
          </Link>

          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-muted/80">
            Progresso
          </p>
          <StepIndicator steps={ONBOARDING_STEP_LABELS} currentIndex={currentStepIndex} />

          <div className={`${obGlassCardSm} mt-auto text-xs text-charcoal-muted`}>
            <p className="font-semibold text-charcoal">Trust Verification</p>
            <p className="mt-1.5 leading-relaxed">
              Ogni partner viene verificato dal team Wenando prima dell&apos;accesso al marketplace
              lead.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-black/5 bg-white/60 px-4 py-4 backdrop-blur-xl sm:px-8 lg:hidden">
            <Link to="/" aria-label="Home">
              <WenandoMark className="h-9 w-9" />
            </Link>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-charcoal-muted ring-1 ring-black/5">
              Step {currentStepIndex + 1} / {ONBOARDING_STEP_LABELS.length}
            </span>
          </header>

          <main className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-2xl">
              {title && (
                <MotionDiv
                  className="mb-8"
                  key={title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
                    <span className="text-gradient-multicolor">{title.split(' ')[0]}</span>{' '}
                    {title.split(' ').slice(1).join(' ')}
                  </h1>
                  {subtitle && <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">{subtitle}</p>}
                </MotionDiv>
              )}

              <div className={title ? '' : obGlassPanel + ' p-6 sm:p-8'}>
                <MaybeAnimatePresence mode="wait">
                  <MotionDiv key={currentStepIndex} {...stepMotion}>
                    {children}
                  </MotionDiv>
                </MaybeAnimatePresence>
              </div>

              {footer && (
                <div className="mt-8 border-t border-black/5 pt-6">{footer}</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </B2BOnboardingShell>
  )
}
