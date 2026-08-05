import { useEffect, useRef, useState } from 'react'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@./+·'
const TICK_MS = 75
const SETTLE_MS = 420
const PER_CHAR_MS = 95

interface FlapTextProps {
  text: string
  /** Extra classes on the row wrapper. */
  className?: string
  /** Extra classes on every flap cell (size/colour). */
  cellClassName?: string
  /** Delay before this row starts churning, in ms. */
  startDelay?: number
}

const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)]

/**
 * Split-flap (Solari) display: every cell churns through characters and locks
 * left-to-right, like an airport departure board.
 */
export default function FlapText({
  text,
  className = '',
  cellClassName = '',
  startDelay = 0,
}: FlapTextProps): JSX.Element {
  const chars = [...text.toUpperCase()]
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)
  const [shown, setShown] = useState<string[]>(() => chars.map((c) => (c === ' ' ? ' ' : '')))
  const [locked, setLocked] = useState<boolean[]>(() => chars.map((c) => c === ' '))

  // Reduced motion: the board is already at its final state.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(chars)
      setLocked(chars.map(() => true))
      setStarted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(() => {
    const el = ref.current
    if (!el || started) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { rootMargin: '-10%' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const begin = Date.now() + startDelay
    // One timer drives every cell; each locks a beat after the one before it.
    const lockAt = chars.map((_, i) => begin + SETTLE_MS + i * PER_CHAR_MS)
    const id = window.setInterval(() => {
      const now = Date.now()
      if (now < begin) return
      setShown(chars.map((ch, i) => (now >= lockAt[i] ? ch : ch === ' ' ? ' ' : randomChar())))
      setLocked(chars.map((ch, i) => now >= lockAt[i] || ch === ' '))
      if (now >= lockAt[lockAt.length - 1]) window.clearInterval(id)
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, text, startDelay])

  return (
    <span
      ref={ref}
      className={`inline-flex flex-wrap gap-[3px] ${className}`}
      style={{ perspective: '420px' }}
      aria-label={text}
    >
      {chars.map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="w-[0.42em]" aria-hidden="true" />
        ) : (
          <span
            key={i}
            aria-hidden="true"
            className={`flap-cell ${locked[i] ? '' : 'is-flipping'} ${cellClassName}`}
          >
            {shown[i] || ' '}
          </span>
        )
      )}
    </span>
  )
}
