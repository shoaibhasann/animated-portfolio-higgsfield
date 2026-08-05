import { useMemo } from 'react'
import type { ElementType, ReactNode } from 'react'
import { motion } from 'motion/react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  x?: number
  y?: number
  as?: ElementType
  className?: string
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as = 'div',
  className,
}: FadeInProps): JSX.Element {
  // Memoized: motion.create returns a NEW component type each call, and an
  // inline call would remount the whole subtree on every parent re-render
  // (restarting any videos inside).
  const MotionComponent = useMemo(() => motion.create(as), [as])

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionComponent>
  )
}
