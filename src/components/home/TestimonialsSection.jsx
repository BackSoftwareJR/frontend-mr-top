import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import TestimonialsSectionStatic from './TestimonialsSectionStatic'

const TestimonialsSectionDesktop = lazy(() => import('./TestimonialsSectionDesktop'))

export default function TestimonialsSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <TestimonialsSectionStatic />
  }

  return (
    <Suspense fallback={<TestimonialsSectionStatic />}>
      <TestimonialsSectionDesktop />
    </Suspense>
  )
}
