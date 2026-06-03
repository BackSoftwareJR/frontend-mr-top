import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import PersonalizedAnalysisSectionStatic from './PersonalizedAnalysisSectionStatic'

const PersonalizedAnalysisSectionDesktop = lazy(
  () => import('./PersonalizedAnalysisSectionDesktop'),
)

export default function PersonalizedAnalysisSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <PersonalizedAnalysisSectionStatic />
  }

  return (
    <Suspense fallback={<PersonalizedAnalysisSectionStatic />}>
      <PersonalizedAnalysisSectionDesktop />
    </Suspense>
  )
}
