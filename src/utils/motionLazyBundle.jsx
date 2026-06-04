import { createElement, forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const MotionElement = forwardRef(function MotionElement({ as = 'div', ...props }, ref) {
  const Component = motion[as] ?? motion.div
  return createElement(Component, { ref, ...props })
})

export function LazyAnimatePresence({ children, mode, ...props }) {
  return (
    <AnimatePresence mode={mode} {...props}>
      {children}
    </AnimatePresence>
  )
}
