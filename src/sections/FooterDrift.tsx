import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll } from 'motion/react'
import { ACCENT_TEXT } from '../styles/accent'
import { triggerWipe } from '../lib/wipeReveal'
import { DRIFT_POSTER, DRIFT_VIDEO } from '../data/images'

const EMAIL = 'hi@iamshoaib.tech'

// ---- Scroll choreography -------------------------------------------------
// The whole clip is scrubbed by scroll, same grammar as the elevator and the
// rooftop: progress maps straight onto currentTime, fully reversible.
/** Sticky runway. ~220vh of travel for a 12s clip lands near the rooftop's
 *  scrub pace. */
const RUNWAY_VH = 320
/** Progress at which the content condenses out of the smoke — the shot cut,
 *  where the frame is pure smoke and the car hasn't parked yet. Scrolling
 *  back above it dissolves the content again. */
const REVEAL_AT = 0.54

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

/** Blur-to-sharp rise, as if the line settles out of the smoke. */
const CONDENSE = {
  hidden: { opacity: 0, y: 26, filter: 'blur(18px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const ease = [0.22, 0.61, 0.36, 1] as const

interface LineProps {
  shown: boolean
  delay: number
  children: ReactNode
  className?: string
}

function Condense({ shown, delay, children, className = '' }: LineProps): JSX.Element {
  return (
    <motion.div
      className={className}
      variants={CONDENSE}
      initial="hidden"
      animate={shown ? 'shown' : 'hidden'}
      // The stagger belongs to the reveal; dissolving on scroll-back starts
      // at once or the lines feel like they're waiting for each other.
      transition={{ duration: 1.1, delay: shown ? delay : 0, ease }}
    >
      {children}
    </motion.div>
  )
}

/**
 * "The Drift Out" footer: a red McLaren enters from the left, drifts out to
 * the left, swings around and charges back through its own tire smoke to park
 * nose-on. Scroll scrubs the clip (all-intra encode, frame-accurate seeks);
 * the closing content condenses out of the smoke past the shot cut.
 */
export default function FooterDrift(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [revealed, setRevealed] = useState(false)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    // Reduced motion: no scrub. Hold the parked final frame under the content.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }

    const unsub = scrollYProgress.on('change', (p) => {
      setRevealed(p >= REVEAL_AT)
      const v = videoRef.current
      if (!v || !v.duration) return
      v.currentTime = clamp01(p) * (v.duration - 0.05)
    })

    // Landing mid-runway (restored scroll, hash link) fires no scroll event;
    // seed from wherever we already are.
    const sync = (): void => {
      const p = scrollYProgress.get()
      setRevealed(p >= REVEAL_AT)
    }
    sync()
    window.addEventListener('resize', sync)
    return () => {
      unsub()
      window.removeEventListener('resize', sync)
    }
  }, [scrollYProgress])

  // The text sweep fires at the same moment the content condenses out of the
  // smoke; the viewport observer would have run it invisibly long before.
  useEffect(() => {
    if (revealed && sectionRef.current) triggerWipe(sectionRef.current)
  }, [revealed])

  // Buffer the clip well before the footer lands: scrubbing needs the frames
  // already local or the first seeks land on black.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        warm.disconnect()
        const v = videoRef.current
        if (!v) return
        v.preload = 'auto'
        v.load()
      },
      { rootMargin: '150% 0px' }
    )
    warm.observe(el)
    return () => warm.disconnect()
  }, [])

  return (
    <footer
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: `${RUNWAY_VH}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-clip flex flex-col justify-center">
        {/* Stage. Full-bleed on desktop; on phones a letterboxed band pinned
            to the bottom, because object-cover in portrait crops the car down
            to a door panel and the drift stops reading. */}
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 pointer-events-none">
          <video
            ref={videoRef}
            className="w-full h-auto sm:h-full sm:object-cover"
            src={DRIFT_VIDEO}
            poster={DRIFT_POSTER}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onLoadedMetadata={(e) => {
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                e.currentTarget.currentTime = e.currentTarget.duration - 0.05
              }
            }}
            onError={() => setRevealed(true)}
          />
        </div>

        {/* Scrim: keeps the copy legible once the smoke rolls under it. Phones
            don't need it — the copy sits on plain black above the band. */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.88) 100%)',
          }}
        />

        <div
          data-wipe-manual
          className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 md:px-10 pt-20 pb-[34vw] sm:py-20"
        >
          {/* Copy keeps to the left column: the car parks in the right half of
              the frame and the upper left stays clean black. */}
          <div className="sm:max-w-[52%] lg:max-w-[46%]">
            <Condense shown={revealed} delay={0}>
              <p className="flex items-center gap-2.5 text-[#D7E2EA]/50 font-medium uppercase tracking-[0.4em] text-[9px] sm:text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Last lap
              </p>
            </Condense>

            <Condense shown={revealed} delay={0.14} className="mt-4">
              <h2
                className="hero-name font-black uppercase leading-[0.86] tracking-tight text-[clamp(2.6rem,8vw,5.4rem)]"
                style={{ textShadow: '0 6px 40px rgba(0,0,0,0.75)' }}
              >
                Shoaib
                <br />
                Hasan
              </h2>
            </Condense>

            <Condense shown={revealed} delay={0.3} className="mt-4 md:mt-5">
              <p
                className="font-semibold uppercase tracking-[0.24em] text-[10px] sm:text-xs md:text-sm"
                style={ACCENT_TEXT}
              >
                Full-Stack Developer &amp; AI Solutions
              </p>
            </Condense>

            <Condense shown={revealed} delay={0.42} className="mt-5 md:mt-6">
              <p
                className="text-[#EDEFF4]/80 font-light text-sm md:text-lg max-w-[38ch] leading-relaxed"
                style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
              >
                Got something worth building? Bring the idea, I&apos;ll bring
                the engineering.
              </p>
            </Condense>

            <Condense shown={revealed} delay={0.56} className="mt-7 md:mt-9">
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-block rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-11 md:py-4 text-xs sm:text-sm"
                  style={{
                    background:
                      'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                    boxShadow:
                      '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                    outline: '2px solid white',
                    outlineOffset: '-3px',
                  }}
                >
                  Let&apos;s Build
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-[#EDEFF4]/70 hover:text-white font-light text-xs sm:text-sm underline underline-offset-4 decoration-white/25 transition-colors"
                >
                  {EMAIL}
                </a>
              </div>
            </Condense>
          </div>
        </div>
      </div>
    </footer>
  )
}
