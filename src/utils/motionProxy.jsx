/* eslint-disable react-refresh/only-export-components */
import { createElement, lazy, Suspense } from 'react'
import { useIsMobile } from './performanceTier'

const LazyMotionElement = lazy(() =>
  import('./motionLazyBundle').then((module) => ({ default: module.MotionElement })),
)

const LazyAnimatePresenceEl = lazy(() =>
  import('./motionLazyBundle').then((module) => ({ default: module.LazyAnimatePresence })),
)

const MOTION_PROP_KEYS = [
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'custom',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'onAnimationComplete',
]

function stripMotionProps(props) {
  const rest = { ...props }
  for (const key of MOTION_PROP_KEYS) {
    delete rest[key]
  }
  return rest
}

function createMotionProxy(as) {
  function MotionProxy(props) {
    const isMobile = useIsMobile()
    const clean = stripMotionProps(props)

    if (isMobile) {
      return createElement(as, clean)
    }

    return (
      <Suspense fallback={createElement(as, clean)}>
        <LazyMotionElement as={as} {...props} />
      </Suspense>
    )
  }

  return MotionProxy
}

export const MotionDiv = createMotionProxy('div')
export const MotionSection = createMotionProxy('section')
export const MotionArticle = createMotionProxy('article')
export const MotionButton = createMotionProxy('button')
export const MotionLi = createMotionProxy('li')
export const MotionHeader = createMotionProxy('header')
export const MotionForm = createMotionProxy('form')
export const MotionP = createMotionProxy('p')
export const MotionSpan = createMotionProxy('span')
export const MotionInput = createMotionProxy('input')

export function MaybeAnimatePresence({ children, mode, ...props }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return children
  }

  return (
    <Suspense fallback={children}>
      <LazyAnimatePresenceEl mode={mode} {...props}>
        {children}
      </LazyAnimatePresenceEl>
    </Suspense>
  )
}
