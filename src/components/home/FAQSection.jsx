import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import FAQSectionStatic from './FAQSectionStatic'

const FAQSectionDesktop = lazy(() => import('./FAQSectionDesktop'))

export default function FAQSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <FAQSectionStatic />
  }

  return (
    <Suspense fallback={<FAQSectionStatic />}>
      <FAQSectionDesktop />
    </Suspense>
  )
}
