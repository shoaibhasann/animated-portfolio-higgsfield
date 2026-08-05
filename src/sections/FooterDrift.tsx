import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { ACCENT_TEXT } from '../styles/accent'
import { DRIFT_POSTER, DRIFT_VIDEO } from '../data/images'

const EMAIL = 'hi@iamshoaib.tech'

/**
 * Fraction of the clip at which the content condenses out of the smoke. Lands
 * on the shot cut (~6.5s of 12s): the frame is pure smoke there, and the
 * McLaren then charges in and settles beside the copy rather than after it.
 */
const REVEAL_AT = 0.54
/** If autoplay is blocked or the file never loads, show the footer anyway. */
const FAILSAFE_MS = 2600
/** The drift reads a touch sluggish at 1x. REVEAL_AT is a fraction, so it
 *  tracks this automatically. */
const PLAYBACK_RATE = 1.4

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
      transition={{ duration: 1.1, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

/**
 * "The Drift Out" footer: a red McLaren enters from the left, drifts out to the
 * left, swings around and charges back through its own tire smoke to park
 * nose-on. The closing content condenses out of that smoke. The clip plays once
 * on entry and holds on its last frame.
 */
export default function FooterDrift(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const failsafeRef = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    // Reduced motion: no drift, the footer is simply present.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }
    const el = sectionRef.current
    if (!el) return

    // Pre-warm well before the footer lands, so the drift starts on the frame
    // the visitor arrives on instead of buffering in front of them.
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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        // Only a stalled clip should trip this; `onPlaying` clears it so a
        // healthy playthrough reveals on the smoke, not on a stopwatch.
        failsafeRef.current = window.setTimeout(() => setRevealed(true), FAILSAFE_MS)
        const v = videoRef.current
        if (!v) return setRevealed(true)
        v.play().catch(() => setRevealed(true))
      },
      { rootMargin: '-12%' }
    )
    io.observe(el)
    return () => {
      warm.disconnect()
      io.disconnect()
      window.clearTimeout(failsafeRef.current)
    }
  }, [])

  const onPlaying = (): void => {
    window.clearTimeout(failsafeRef.current)
    // Re-applied here as well as on load: a re-buffer can reset the rate.
    if (videoRef.current) videoRef.current.playbackRate = PLAYBACK_RATE
    setPlaying(true)
  }

  const onTimeUpdate = (): void => {
    const v = videoRef.current
    if (!v || !v.duration) return
    if (v.currentTime / v.duration >= REVEAL_AT) setRevealed(true)
  }

  const replay = (): void => {
    const v = videoRef.current
    if (!v) return
    setRevealed(false)
    v.currentTime = 0
    v.play().catch(() => setRevealed(true))
  }

  return (
    <footer
      ref={sectionRef}
      className="relative bg-black overflow-hidden min-h-[100svh] flex flex-col justify-center"
    >
      {/* Stage. Full-bleed on desktop; on phones a letterboxed band pinned to
          the bottom, because object-cover in portrait crops the car down to a
          door panel and the drift stops reading. */}
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
            e.currentTarget.playbackRate = PLAYBACK_RATE
          }}
          onPlaying={onPlaying}
          onTimeUpdate={onTimeUpdate}
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 md:px-10 pt-20 pb-[34vw] sm:py-20">
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
              Got something worth building? Bring the idea, I&apos;ll bring the
              engineering.
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
              {/* Replay stays with the clip it controls — the rest of the
                  closing strip now lives on the contact section. */}
              {playing && (
                <button
                  type="button"
                  onClick={replay}
                  className="flex items-center gap-1.5 text-[#EDEFF4]/45 hover:text-white font-medium uppercase tracking-[0.2em] text-[9px] transition-colors"
                >
                  <RotateCcw className="w-[13px] h-[13px]" />
                  Replay
                </button>
              )}
            </div>
          </Condense>
        </div>
      </div>

    </footer>
  )
}
