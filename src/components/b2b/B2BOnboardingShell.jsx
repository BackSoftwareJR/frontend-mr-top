import { MotionDiv } from '../../utils/motionProxy'

export default function B2BOnboardingShell({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-x-hidden bg-warm-cream ${className}`}>
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-orb aurora-orb--coral" />
        <span className="aurora-orb aurora-orb--violet" />
        <span className="aurora-orb aurora-orb--amber" />
      </div>
      <MotionDiv
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </MotionDiv>
    </div>
  )
}
