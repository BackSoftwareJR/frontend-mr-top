import SolutionResultCard from './SolutionResultCard'
import { MotionSection } from '../../utils/motionProxy'

export default function SolutionGroupBox({
  group,
  groupIndex = 0,
  animate = true,
  onSolutionAction,
}) {
  if (!group) return null

  return (
    <MotionSection
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + groupIndex * 0.1, duration: 0.45 }}
      className="rounded-2xl border border-black/[0.06] bg-white/75 p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5"
    >
      <header className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">{group.title}</h2>
        {group.subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{group.subtitle}</p>
        ) : null}
      </header>

      <div className="flex flex-col gap-3">
        {group.solutions.map((solution, index) => (
          <SolutionResultCard
            key={solution.id}
            solution={solution}
            index={index}
            animate={animate}
            onAction={onSolutionAction}
          />
        ))}
      </div>
    </MotionSection>
  )
}
