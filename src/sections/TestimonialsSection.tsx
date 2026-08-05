import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { TESTIMONIALS } from '../data/testimonials'
import { ELEVATOR_INTRO_VIDEO, ELEVATOR_OUTRO_VIDEO } from '../data/images'
import { ACCENT_TEXT } from '../styles/accent'

// ---- Scroll choreography (fractions of the pinned runway) ----------------
// 0 .. INTRO_END        : scrub the intro clip (lift arrives, character
//                         exits right, camera dollies into the cab)
// WALL_START .. WALL_END: frozen on the cab's back wall; testimonials step
//                         through as etched-neon text
// OUTRO_START .. 1      : scrub the outro clip (pull back, doors close)
// Everything is a pure function of scroll progress, so it all reverses.
const INTRO_END = 0.18
const WALL_START = 0.2
const WALL_END = 0.84
const OUTRO_START = 0.86
const RUNWAY_VH = 560

// Clip durations in seconds (probed from the encoded files).
const INTRO_DUR = 8.04
const OUTRO_DUR = 4.04

// Wall canvas placement at the freeze frame (fractions of the viewport) —
// tuned to the dollied-in final frame of the intro clip.
const WALL_INSET: CSSProperties = {
  left: '14%',
  right: '14%',
  top: '22%',
  bottom: '22%',
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

interface WallItem {
  title?: string
  quote: string
  byline?: string
}

const WALL_ITEMS: WallItem[] = [
  {
    title: 'Kind Words',
    quote: 'Real words from real clients. No scripts, no fluff.',
  },
  ...TESTIMONIALS.map((t) => ({
    quote: `“${t.quote}”`,
    byline: `${t.name} · ${t.role}, ${t.project}`,
  })),
]

interface WallSlideProps {
  item: WallItem
  index: number
  total: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}

function WallSlide({ item, index, total, progress }: WallSlideProps): JSX.Element {
  const span = (WALL_END - WALL_START) / total
  const start = WALL_START + index * span
  const end = start + span
  const fade = Math.min(0.18 * span, 0.028)

  const opacity = useTransform(progress, (p) => {
    if (p <= start || p >= end) return 0
    if (p < start + fade) return (p - start) / fade
    if (p > end - fade) return (end - p) / fade
    return 1
  })
  const y = useTransform(progress, (p) => {
    const t = clamp01((p - start) / span)
    return `${((0.5 - t) * 26).toFixed(2)}px`
  })

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
      style={{ opacity, y }}
    >
      {item.title && (
        <p
          className="hero-heading font-black uppercase tracking-tight leading-none"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 96px)' }}
        >
          {item.title}
        </p>
      )}
      <p
        className={
          item.title
            ? 'text-[#D7E2EA]/70 font-light tracking-wide mt-4 text-sm sm:text-base md:text-lg'
            : 'text-[#EDEFF4] font-light leading-relaxed'
        }
        style={
          item.title
            ? undefined
            : {
                fontSize: 'clamp(1.05rem, 2.3vw, 1.9rem)',
                textShadow: '0 0 22px rgba(226, 76, 208, 0.28), 0 0 2px rgba(237, 239, 244, 0.5)',
              }
        }
      >
        {item.quote}
      </p>
      {item.byline && (
        <p
          className="font-semibold uppercase tracking-[0.22em] mt-6 text-[10px] sm:text-xs"
          style={ACCENT_TEXT}
        >
          {item.byline}
        </p>
      )}
    </motion.div>
  )
}

/**
 * "The Elevator": a full-bleed cinematic — the lift arrives, the character
 * steps out and leaves, the camera dollies onto the cab's back wall, and the
 * testimonials play across the wall as etched neon while the visitor
 * scrolls. Scrolling back runs the whole thing in reverse.
 */
export default function TestimonialsSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLVideoElement>(null)
  const outroRef = useRef<HTMLVideoElement>(null)
  const [videoOk, setVideoOk] = useState(true)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // The clips only buffer aggressively once the section approaches — three
  // fully-preloaded scrub videos otherwise hog GPU/decode memory from page
  // load (which corrupts other composited layers on weaker machines).
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !videoOk) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (introRef.current) introRef.current.preload = 'auto'
          if (outroRef.current) outroRef.current.preload = 'auto'
          io.disconnect()
        }
      },
      { rootMargin: '150% 0px' }
    )
    io.observe(section)
    return () => io.disconnect()
  }, [videoOk])

  // Frame-accurate scrubbing: scroll position IS the playhead.
  useEffect(() => {
    if (!videoOk) return
    const unsub = scrollYProgress.on('change', (p) => {
      const intro = introRef.current
      const outro = outroRef.current
      if (!intro || !outro) return
      if (p < OUTRO_START) {
        const t = clamp01(p / INTRO_END) * INTRO_DUR
        intro.currentTime = Math.min(t, INTRO_DUR - 0.04)
        // Pre-warm the outro at its first frame near the handoff so the
        // layer swap never flashes a stale frame from an earlier pass
        // (outro frame 0 matches the frozen wall, so this is invisible).
        if (p >= OUTRO_START - 0.03 && outro.currentTime > 0.05) {
          outro.currentTime = 0
        }
      } else {
        const t = clamp01((p - OUTRO_START) / (1 - OUTRO_START)) * OUTRO_DUR
        outro.currentTime = Math.min(t, OUTRO_DUR - 0.04)
      }
    })
    return unsub
  }, [scrollYProgress, videoOk])

  // The outro layer swaps in on top only for the final pull-back.
  const outroOpacity = useTransform(scrollYProgress, (p) => (p >= OUTRO_START ? 1 : 0))
  // Wall overlay only exists while frozen on the wall.
  const wallOpacity = useTransform(
    scrollYProgress,
    [WALL_START - 0.015, WALL_START, WALL_END, WALL_END + 0.015],
    [0, 1, 1, 0]
  )

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0C0C0C]"
      style={{ height: `${RUNWAY_VH}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-clip">
        {videoOk ? (
          <>
            <video
              ref={introRef}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
              onError={() => {
                if (introRef.current?.error) setVideoOk(false)
              }}
            >
              <source src={ELEVATOR_INTRO_VIDEO} type="video/mp4" />
            </video>
            <motion.video
              ref={outroRef}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: outroOpacity }}
              aria-hidden="true"
              onError={() => {
                if (outroRef.current?.error) setVideoOk(false)
              }}
            >
              <source src={ELEVATOR_OUTRO_VIDEO} type="video/mp4" />
            </motion.video>
          </>
        ) : (
          // Assets unavailable: plain dark stage so the wall still works.
          <div className="absolute inset-0 bg-gradient-to-b from-[#101114] to-[#0C0C0C]" />
        )}

        {/* The wall: etched-neon testimonials, perspective-flat because the
            dolly ends square to the back wall. */}
        <motion.div className="absolute" style={{ ...WALL_INSET, opacity: wallOpacity }}>
          {WALL_ITEMS.map((item, i) => (
            <WallSlide
              key={i}
              item={item}
              index={i}
              total={WALL_ITEMS.length}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>

        {/* Screen-reader copy of every testimonial (the cinema is aria-hidden). */}
        <ul className="sr-only">
          {TESTIMONIALS.map((t) => (
            <li key={t.project}>
              {t.quote} ({t.name}, {t.role}, {t.project})
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
