import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ElementType } from 'react'

type AnimationSnapshot = Record<string, string | number>

type BlurTextProps = {
  text?: string
  delay?: number
  className?: string
  /**
   * Classes applied to every animated segment. Gradient-text classes belong
   * here, not on `className`: the animation blurs each span, and a parent-level
   * `background-clip: text` + transparent fill would leave nothing to blur.
   */
  segmentClassName?: string
  /** Indices of segments that get `accentClassName` on top (glow letters). */
  accentIndices?: number[]
  accentClassName?: string
  /** Rendered wrapper element. Use `h1`/`h2` for headings (a `p` cannot nest in one). */
  as?: ElementType
  /** Merged over the wrapper's flex defaults (e.g. `flexWrap: 'nowrap'`). */
  style?: CSSProperties
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: AnimationSnapshot
  animationTo?: AnimationSnapshot[]
  easing?: (value: number) => number
  onAnimationComplete?: () => void
  stepDuration?: number
}

const buildKeyframes = (from: AnimationSnapshot, steps: AnimationSnapshot[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])

  const keyframes: Record<string, Array<string | number>> = {}
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])]
  })
  return keyframes
}

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  segmentClassName = '',
  accentIndices,
  accentClassName = '',
  as: Wrapper = 'p',
  style,
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  // Once the intro completes, the motion spans are swapped for plain static
  // spans. Leaving them as motion elements kept every letter promoted to its
  // own GPU layer (residual filter + will-change), and Chrome corrupts those
  // background-clip:text layer textures under memory pressure — the heading
  // would render with smudged blotches.
  const [settled, setSettled] = useState(
    // Reduced motion: skip straight to the plain, fully-visible spans.
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(ref.current!)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const defaultFrom = useMemo<AnimationSnapshot>(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  )

  const defaultTo = useMemo<AnimationSnapshot[]>(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  )

  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo

  const stepCount = toSnapshots.length + 1
  const totalDuration = stepDuration * (stepCount - 1)
  const times = Array.from({ length: stepCount }, (_, index) =>
    stepCount === 1 ? 0 : index / (stepCount - 1)
  )

  return (
    <Wrapper
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', ...style }}
    >
      {elements.map((segment, index) => {
        const segCls = `inline-block ${segmentClassName} ${
          accentIndices?.includes(index) ? accentClassName : ''
        }`
        const content = (
          <>
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </>
        )

        // Post-intro: plain spans, no transforms, no filters, no layers.
        if (settled) {
          return (
            <span className={segCls} key={index}>
              {content}
            </span>
          )
        }

        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots)

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        }

        return (
          <motion.span
            className={segCls}
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1
                ? () => {
                    setSettled(true)
                    onAnimationComplete?.()
                  }
                : undefined
            }
          >
            {content}
          </motion.span>
        )
      })}
    </Wrapper>
  )
}

export default BlurText
