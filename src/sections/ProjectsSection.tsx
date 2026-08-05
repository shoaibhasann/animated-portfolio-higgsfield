import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { PROJECTS } from '../data/projects'
import type { Project } from '../data/projects'
import {
  PROJECTS_BROWSE_POSTER_URL,
  PROJECTS_BROWSE_VIDEO_MOV,
  PROJECTS_BROWSE_VIDEO_WEBM,
} from '../data/images'
import { ACCENT_TEXT } from '../styles/accent'
import SectionIntro from '../components/SectionIntro'

// ---- Scroll choreography -------------------------------------------------
// The section pins for a long runway; global progress 0..1 is divided into a
// short intro plus one slot per card. Every value is a pure function of
// progress, so scrolling backwards lowers the cards back down for free.
const RUNWAY_VH_PER_CARD = 55
const INTRO_FRAC = 0.05
// Fraction of a card's slot spent travelling; the rest is dwell time on top
// of the stack before the next card starts.
const RISE_FRAC = 0.72
// Travel distance (vh) from offscreen-bottom to the resting spot.
const TRAVEL_VH = 62
// Each card that lands nudges the older deck up/back a little.
const PUSH_VH = 1.7
const SCALE_STEP = 0.035

// Stack resting position in the pinned viewport (vh).
const STACK_TOP_VH = 44

// ---- Holo-Presenter clip segments (seconds, measured from the clip) ------
// The clip: looks at camera -> lowers head to tablet -> swipes -> looks back
// up (end frame == start frame). While the visitor scrolls, playback loops
// inside [LOOP_START, LOOP_END] (head down, swiping); when scrolling stops,
// the clip runs through the tail so he looks back up at the camera and
// freezes there.
const BROWSE_LOOP_START_S = 1.2
const BROWSE_LOOP_END_S = 4.0
// How long after the last scroll movement he finishes and looks back up.
const BROWSE_IDLE_AFTER_MS = 240

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

interface SlotWindow {
  start: number
  end: number
}

function slotWindow(index: number, total: number): SlotWindow {
  const slot = (1 - INTRO_FRAC) / total
  const start = INTRO_FRAC + index * slot
  return { start, end: start + slot * RISE_FRAC }
}

/** 0 while a card waits below, 1 once it has fully landed on the stack. */
function riseProgress(p: number, index: number, total: number): number {
  const { start, end } = slotWindow(index, total)
  return easeOutCubic(clamp01((p - start) / (end - start)))
}

/** How many later cards have landed on top of this one (continuous). */
function depthAbove(p: number, index: number, total: number): number {
  let depth = 0
  for (let j = index + 1; j < total; j++) depth += riseProgress(p, j, total)
  return depth
}

interface StackCardProps {
  project: Project
  index: number
  total: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}

function StackCard({ project, index, total, progress }: StackCardProps): JSX.Element {
  const y = useTransform(progress, (p) => {
    const rise = (1 - riseProgress(p, index, total)) * TRAVEL_VH
    const push = depthAbove(p, index, total) * PUSH_VH
    return `${(rise - push).toFixed(3)}vh`
  })
  const scale = useTransform(
    progress,
    (p) => 1 - depthAbove(p, index, total) * SCALE_STEP
  )
  // Depth dimming via opacity (compositable) instead of filter: brightness()
  // (which forces style/paint work on every scroll frame).
  const opacity = useTransform(progress, (p) =>
    Math.max(0.55, 1 - depthAbove(p, index, total) * 0.07)
  )

  return (
    // Outer div owns the horizontal placement (Tailwind-responsive: centered
    // on small screens, presenter-to-right-edge span on lg+); the inner
    // motion.div owns only the scroll transforms, so the two never fight
    // over `transform`.
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[92vw] max-w-[880px] h-[30vh] min-h-[215px] sm:h-[34vh] sm:min-h-[250px] lg:left-auto lg:right-[3vw] lg:translate-x-0 lg:w-[56vw] lg:max-w-[900px]"
      style={{
        // min() keeps the card inside short/landscape viewports where a
        // vh-based top would push it past the bottom edge.
        top: `min(${STACK_TOP_VH}vh, calc(100vh - 280px))`,
        zIndex: 10 + index,
      }}
    >
      <motion.div className="h-full" style={{ y, scale, opacity }}>
        <div
          className="relative h-full rounded-[26px] px-6 py-5 sm:px-9 sm:py-6 flex flex-col justify-between overflow-hidden"
          style={{
            // Gradient border via the padding-box/border-box trick: the card
            // wears the brand ramp as a 1px frame around a deep surface.
            border: '1px solid transparent',
            background:
              'linear-gradient(150deg, #15161B 0%, #0D0E12 70%) padding-box, linear-gradient(123deg, rgba(226,76,208,0.55) 0%, rgba(155,77,224,0.4) 45%, rgba(190,76,0,0.3) 100%) border-box',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(155, 77, 224, 0.15)' }}
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
              <span
                className="font-black leading-none text-4xl sm:text-6xl"
                style={ACCENT_TEXT}
              >
                {project.number}
              </span>
              <div className="min-w-0">
                <h3 className="text-white font-black uppercase tracking-tight leading-tight text-lg sm:text-3xl md:text-4xl truncate">
                  {project.name}
                </h3>
                <p className="text-[#D7E2EA]/50 font-medium uppercase tracking-[0.25em] text-[10px] sm:text-xs mt-1.5">
                  {project.category}
                </p>
              </div>
            </div>
            {project.href !== '#' ? (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full border border-white/20 text-[#D7E2EA]/80 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px] px-3.5 py-1.5 sm:px-4 sm:py-2 hover:border-fuchsia-400/60 hover:text-white transition-colors"
              >
                See it live ↗
              </a>
            ) : (
              // Placeholder until the real URL is filled in — a '#' link
              // would yank the pinned section back to the page top.
              <span
                aria-disabled="true"
                className="shrink-0 rounded-full border border-white/15 text-[#D7E2EA]/60 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px] px-3.5 py-1.5 sm:px-4 sm:py-2 select-none"
              >
                See it live ↗
              </span>
            )}
          </div>

          <p className="text-[#DCE4EC]/80 font-light leading-relaxed text-sm sm:text-[15px] max-w-[60ch] line-clamp-3">
            {project.description}
          </p>

          <div className="flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold uppercase tracking-[0.14em] text-[9px] sm:text-[10px]"
              style={{
                // Solid readable tint: the gradient-clip text was too dim on
                // the chip's dark fill.
                color: '#F3B8E9',
                border: '1px solid rgba(226, 76, 208, 0.35)',
                background: 'rgba(226, 76, 208, 0.09)',
              }}
            >
              ✦ {project.outcome}
            </span>
            <span className="text-[#D7E2EA]/40 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px] whitespace-nowrap">
              {project.tag} Work · {project.number} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Pinned Projects section: the viewport locks and the project cards deal
 * themselves onto a rising deck one by one as the visitor scrolls — and deal
 * themselves back off when scrolling up (everything is a pure function of
 * scroll progress).
 */
export default function ProjectsSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const [videoOk, setVideoOk] = useState(true)
  // The presenter only exists on lg+ layouts; without this gate the video
  // (~1MB + poster) still downloaded and decoded on phones where it is
  // display:none.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )
  const guyRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Scroll-chained playback: scrolling plays the clip and keeps it looping
  // inside the head-down swipe segment; stopping lets it run through the
  // tail (he looks back up at the camera) and freeze. play() on an ended
  // clip restarts from the first frame, which matches the last one, so every
  // transition is forward playback — no reverse scrubbing.
  useEffect(() => {
    const video = guyRef.current
    if (!video || !videoOk) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let scrolling = false
    // True while the clip is running its look-back-up tail: the loop clamp
    // must not yank it back mid-motion if scrolling resumes; the clip
    // finishes the tail, ends, and the next play() restarts cleanly from 0.
    let inTail = false
    let idleTimer: number | undefined
    let raf = 0
    const clampLoop = () => {
      if (scrolling && !inTail && !video.paused && video.currentTime >= BROWSE_LOOP_END_S) {
        video.currentTime = BROWSE_LOOP_START_S
      }
      raf = requestAnimationFrame(clampLoop)
    }
    const onEnded = () => {
      inTail = false
    }
    video.addEventListener('ended', onEnded)
    const unsub = scrollYProgress.on('change', (p) => {
      if (p <= 0 || p >= 1) return
      scrolling = true
      if (video.paused || video.ended) video.play().catch(() => {})
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        // Stop looping; the clip plays its tail and pauses on 'ended' with
        // him looking at the camera.
        scrolling = false
        inTail = true
      }, BROWSE_IDLE_AFTER_MS)
    })
    raf = requestAnimationFrame(clampLoop)
    return () => {
      unsub()
      video.removeEventListener('ended', onEnded)
      window.clearTimeout(idleTimer)
      cancelAnimationFrame(raf)
      video.pause()
    }
  }, [videoOk, scrollYProgress])

  return (
    <section
      ref={sectionRef}
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10"
      style={{ height: `${100 + PROJECTS.length * RUNWAY_VH_PER_CARD}vh` }}
    >
      {/* overflow-clip (not hidden): forbids the focus-scroll a keyboard Tab
          into a below-fold card link would otherwise cause, which offsets the
          pinned container and permanently breaks the layout. */}
      <div className="sticky top-0 h-screen overflow-clip">
        <SectionIntro
          heading="Projects"
          sub="Selected work. Scroll to deal the deck."
          headingClassName="hero-heading font-black uppercase leading-none tracking-tight"
          headingStyle={{ fontSize: 'clamp(2.75rem, 10vw, 130px)' }}
          subClassName="text-[#D7E2EA]/50 font-medium uppercase tracking-[0.3em] text-[10px] sm:text-xs"
          className="pt-[6vh]"
        />

        {/* Holo-Presenter: stands front-right of the deck casually browsing
            his tablet. Swipes while the visitor scrolls; looks up at the
            camera when they stop. Desktop only — no room on small screens. */}
        {videoOk && isDesktop && (
          <div
            className="hidden lg:block absolute z-30 left-[22vw] -translate-x-1/2 bottom-[2vh] h-[70vh] xl:h-[74vh]"
            style={{ aspectRatio: '3 / 4' }}
          >
            <video
              ref={guyRef}
              muted
              playsInline
              preload="auto"
              poster={PROJECTS_BROWSE_POSTER_URL}
              className="block w-full h-full object-contain"
              aria-label="3D character casually browsing projects on a holographic tablet"
              onError={() => {
                if (guyRef.current?.error) setVideoOk(false)
              }}
            >
              <source src={PROJECTS_BROWSE_VIDEO_MOV} type='video/mp4; codecs="hvc1"' />
              <source src={PROJECTS_BROWSE_VIDEO_WEBM} type="video/webm" />
            </video>
          </div>
        )}

        {PROJECTS.map((project, i) => (
          <StackCard
            key={project.number}
            project={project}
            index={i}
            total={PROJECTS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  )
}
