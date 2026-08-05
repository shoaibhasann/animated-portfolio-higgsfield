import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ElementType } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

type Snapshot = Record<string, string | number>

interface SplitTextProps {
  text: string
  className?: string
  /** Delay between letters (ms). */
  delay?: number
  /** Duration of each letter tween (s). */
  duration?: number
  ease?: string
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars'
  from?: Snapshot
  to?: Snapshot
  threshold?: number
  rootMargin?: string
  textAlign?: CSSProperties['textAlign']
  tag?: ElementType
  /**
   * Classes copied onto every split char/word. Gradient text belongs here:
   * with `background-clip: text` only on the parent, the split children have
   * a transparent fill, so animating their opacity does nothing and the
   * heading just pops in. Per-char gradients animate correctly and look
   * identical for vertical ramps.
   */
  pieceClassName?: string
  style?: CSSProperties
  onLetterAnimationComplete?: () => void
}

/**
 * React Bits SplitText (GSAP variant): scroll-triggered per-char/word reveal.
 * Animates once, then reverts to plain text so no per-letter layers stick
 * around afterwards.
 */
const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  pieceClassName = '',
  style,
  onLetterAnimationComplete,
}: SplitTextProps) => {
  const ref = useRef<HTMLElement>(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  // Hidden until the split has applied its from-state (or we bail to plain
  // text): otherwise the heading paints visible, then blinks out when fonts
  // finish loading and the tween's initial state lands.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (document.fonts.status === 'loaded') setFontsLoaded(true)
    else document.fonts.ready.then(() => setFontsLoaded(true))
  }, [])

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return
      if (animationCompletedRef.current) return
      // Reduced motion: the text simply shows, no split, no tween.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animationCompletedRef.current = true
        setReady(true)
        return
      }
      const el = ref.current as HTMLElement & { _rbsplitInstance?: GSAPSplitText | null }

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert()
        } catch {
          /* noop */
        }
        el._rbsplitInstance = null
      }

      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px'
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: Element[] | undefined
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines
        if (!targets) targets = self.chars || self.words || self.lines
      }

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self)
          if (pieceClassName) {
            const classes = pieceClassName.split(' ').filter(Boolean)
            // Move the gradient from the parent onto each piece: Chromium
            // refuses to paint a nested `background-clip: text`, so with the
            // class on both the letters render as nothing.
            el.classList.remove(...classes)
            targets?.forEach((t) => t.classList.add(...classes))
          }
          return gsap.fromTo(
            targets!,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                // NOTE: no fastScrollEnd — it assumes the element left the
                // viewport, which is false for headings inside sticky-pinned
                // sections (a fast fling would pop them in with no reveal).
              },
              onComplete: () => {
                animationCompletedRef.current = true
                // Revert to plain text: no leftover per-letter spans/layers.
                try {
                  splitInstance.revert()
                } catch {
                  /* noop */
                }
                // Gradient goes back on the (now unsplit) heading.
                if (pieceClassName) {
                  el.classList.add(...pieceClassName.split(' ').filter(Boolean))
                }
                el._rbsplitInstance = null
                onCompleteRef.current?.()
              },
              willChange: 'transform, opacity',
              force3D: true,
            }
          )
        },
      })

      el._rbsplitInstance = splitInstance
      // From-states are applied synchronously by the fromTo above; safe to
      // paint now without a visible flash.
      setReady(true)

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill()
        })
        try {
          splitInstance.revert()
        } catch {
          /* noop */
        }
        if (pieceClassName) {
          el.classList.add(...pieceClassName.split(' ').filter(Boolean))
        }
        el._rbsplitInstance = null
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        pieceClassName,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: ref,
    }
  )

  const Tag = tag
  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        visibility: ready ? 'visible' : 'hidden',
        ...style,
      }}
    >
      {text}
    </Tag>
  )
}

export default SplitText
