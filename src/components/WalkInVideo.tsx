import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface WalkInVideoProps {
  videoWebm: string
  videoMov?: string
  /** Optional exit clip: first frame is locked to the standing pose, character
   *  walks off screen-right. Plays once the visitor scrolls out of the hero. */
  exitWebm?: string
  exitMov?: string
  posterSrc: string
  posterAlt: string
}

// Measured geometry, used to align the video's final standing frame with the
// hi-res poster so the end-of-walk crossfade is seamless.
//
// Poster PNG (1696x2528), alpha bounding box of the character:
const PNG_CHAR_HEIGHT_FRAC = 0.9066 // char height / image height
const PNG_FEET_FRAC = 0.9616 // char feet y / image height
// Walk video (2206x946, ~21:9), alpha bounding box of the character in the
// FINAL frame, measured from the rembg-segmented frames (alpha > 40 threshold).
const VID_CHAR_HEIGHT_FRAC = 0.8531
const VID_FEET_FRAC = 0.9249
const VID_CENTER_X_FRAC = 0.4991

// Exit video (same 21:9 pipeline), alpha bounding box of the character in the
// FIRST frame (start_image-locked to the standing pose), measured post-segmentation.
const EXIT_CHAR_HEIGHT_FRAC = 0.9197
const EXIT_FEET_FRAC = 0.9683
const EXIT_CENTER_X_FRAC = 0.5

const VIDEO_ASPECT = 2206 / 946
const CONTAINER_ASPECT = 1696 / 2528

// Character width as a fraction of video width (measured; used to decide how
// far offscreen the entry slide must start so he emerges from the screen edge).
const VID_CHAR_WIDTH_FRAC = 0.118

const START_DELAY_MS = 300
// Walk and exit clips play sped up: nobody waits through a leisurely stroll.
const PLAYBACK_RATE = 1.5
const SLIDE_DURATION_S = 1.75
const FADE_MS = 350
// If the walk somehow stalls (tab throttling, decode hang), give up and show
// the poster rather than stranding the hero mid-walk.
const WATCHDOG_MS = 12000
// Ignore sub-250ms visibility blips (OS occlusion checks) before skipping.
const HIDDEN_GRACE_MS = 250
// Scroll thresholds in px: the exit starts on the very first scroll movement
// (while the hero is still fully in view), and the character resets to
// standing only once the visitor is back at the very top.
const EXIT_AT_PX = 24
const RESET_AT_PX = 8
// Sampling interval for the exit clip's frame-advance stall check (hidden or
// occluded tabs throttle video decode; a frozen exit must bail, not hang).
const EXIT_STALL_MS = 1200

type Phase = 'waiting' | 'walking' | 'fading' | 'standing' | 'exiting' | 'gone'

export default function WalkInVideo({
  videoWebm,
  videoMov,
  exitWebm,
  exitMov,
  posterSrc,
  posterAlt,
}: WalkInVideoProps) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === 'undefined') return 'standing'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'standing'
    // Opened in a background tab: hold the walk until the tab is actually seen.
    return document.visibilityState === 'hidden' ? 'waiting' : 'walking'
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const exitRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Extra entry slide for viewports wider than the video: if the video's left
  // edge would land inside the viewport, the character would pop in mid-screen
  // instead of entering from the edge. Slide the video in from offscreen-left
  // during the first strides to cover the gap. null = not yet measured.
  const [slideFromPx, setSlideFromPx] = useState<number | null>(null)
  const [slid, setSlid] = useState(false)
  // The exit video reports its first painted frame; only then does the poster
  // hide, so the standing pose never blinks during the handoff.
  const [exitPlaying, setExitPlaying] = useState(false)

  // Derived layout (all relative to the container width W):
  // - container height = W / CONTAINER_ASPECT
  // - poster char displayed height = PNG_CHAR_HEIGHT_FRAC * containerHeight
  // - video width V such that its char height matches the poster's:
  //   V * (1/VIDEO_ASPECT) * VID_CHAR_HEIGHT_FRAC = poster char height
  const containerHeightPerW = 1 / CONTAINER_ASPECT
  const videoWidthPerW =
    (PNG_CHAR_HEIGHT_FRAC * containerHeightPerW * VIDEO_ASPECT) / VID_CHAR_HEIGHT_FRAC
  const videoHeightPerW = videoWidthPerW / VIDEO_ASPECT
  // Vertical: align feet lines. Poster feet from container top = PNG_FEET_FRAC * containerHeight.
  // Video feet from video top = VID_FEET_FRAC * videoHeight. Video top offset (from container
  // top) = posterFeetY - videoFeetY; expressed as bottom offset for CSS.
  const videoTopPerW = PNG_FEET_FRAC * containerHeightPerW - VID_FEET_FRAC * videoHeightPerW
  const videoBottomPerW = containerHeightPerW - videoTopPerW - videoHeightPerW
  // Horizontal: the char's final x-center in the video should land on the container center.
  const videoLeftPerW = 0.5 - VID_CENTER_X_FRAC * videoWidthPerW

  // Same math for the exit clip, keyed to its own measured first-frame fractions.
  const exitWidthPerW =
    (PNG_CHAR_HEIGHT_FRAC * containerHeightPerW * VIDEO_ASPECT) / EXIT_CHAR_HEIGHT_FRAC
  const exitHeightPerW = exitWidthPerW / VIDEO_ASPECT
  const exitTopPerW = PNG_FEET_FRAC * containerHeightPerW - EXIT_FEET_FRAC * exitHeightPerW
  const exitBottomPerW = containerHeightPerW - exitTopPerW - exitHeightPerW
  const exitLeftPerW = 0.5 - EXIT_CENTER_X_FRAC * exitWidthPerW

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const videoLeftViewportPx = rect.left + videoLeftPerW * w
    const charWidthPx = VID_CHAR_WIDTH_FRAC * videoWidthPerW * w
    // If the video's left edge (where the character enters) is visible, start
    // the video shifted left so the character begins fully offscreen.
    const needed = videoLeftViewportPx + charWidthPx
    setSlideFromPx(needed > 0 ? -needed : 0)
  }, [videoLeftPerW, videoWidthPerW])

  // Background-tab handling: start the walk when the tab first becomes
  // visible; skip to the poster if the tab is hidden mid-walk for more than a
  // brief blip (browsers pause offscreen video, which would strand the walk).
  useEffect(() => {
    if (phase !== 'waiting' && phase !== 'walking') return
    let hiddenTimer: number | undefined
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(hiddenTimer)
        hiddenTimer = undefined
        setPhase((p) => (p === 'waiting' ? 'walking' : p))
      } else {
        hiddenTimer = window.setTimeout(() => {
          setPhase((p) => (p === 'walking' ? 'standing' : p))
        }, HIDDEN_GRACE_MS)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(hiddenTimer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'walking' || slideFromPx === null) return
    const video = videoRef.current
    if (!video) return
    const timer = window.setTimeout(() => {
      setSlid(true)
      // React does not reflect `muted` into the DOM attribute; some autoplay
      // policies check the attribute, so set everything explicitly.
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
      video.playbackRate = PLAYBACK_RATE
      video.play().catch(() => setPhase('standing'))
    }, START_DELAY_MS)
    const watchdog = window.setTimeout(() => {
      setPhase((p) => (p === 'walking' ? 'standing' : p))
    }, WATCHDOG_MS)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(watchdog)
    }
  }, [phase, slideFromPx])

  useEffect(() => {
    if (phase !== 'fading') return
    const t = window.setTimeout(() => setPhase('standing'), FADE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  // Standing + scrolled away -> play the exit. Gone + back at top -> reset.
  // `waiting` also exits on scroll: some embedded/preview browsers never
  // report the tab visible, and without this the character would just stand
  // there ignoring the scroll forever.
  useEffect(() => {
    if (!exitWebm) return
    // Reduced motion: no walk-in happened, so no walk-out either.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (phase !== 'waiting' && phase !== 'standing' && phase !== 'gone') return
    const onScroll = () => {
      const y = window.scrollY
      if ((phase === 'waiting' || phase === 'standing') && y > EXIT_AT_PX) {
        setPhase('exiting')
      } else if (phase === 'gone' && y < RESET_AT_PX) {
        setExitPlaying(false)
        setPhase('standing')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Also evaluate immediately: the visitor may have scrolled during the
    // walk-in and stopped — no further scroll event would fire.
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [phase, exitWebm])

  useEffect(() => {
    if (phase !== 'exiting') return
    const video = exitRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.playbackRate = PLAYBACK_RATE
    video.currentTime = 0
    video.play().catch(() => {
      setExitPlaying(false)
      setPhase('standing')
    })
    // Frame-advance stall check: play() can "succeed" and then freeze
    // (throttled/occluded-tab decode). If currentTime stops moving between
    // samples: a clip that ran and froze vanishes (`gone` — the visitor has
    // scrolled away); a clip that never started only vanishes when the data
    // is already there (frozen decode). A still-buffering clip keeps waiting
    // behind the poster instead of blinking the character out mid-view.
    let lastT = -1
    const stall = window.setInterval(() => {
      const v = exitRef.current
      if (!v || v.ended) return
      const t = v.currentTime
      if (t !== lastT) {
        lastT = t
        return
      }
      const started = lastT > 0.05
      if (!started && v.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return
      setPhase((p) => (p === 'exiting' ? 'gone' : p))
    }, EXIT_STALL_MS)
    const watchdog = window.setTimeout(() => {
      // Never-started clip (e.g. very slow network): fall back to the poster
      // (`standing` immediately re-arms the exit, a natural retry) instead of
      // popping the still-visible character out of existence.
      const started = (exitRef.current?.currentTime ?? 0) > 0.05
      setExitPlaying(false)
      setPhase((p) => (p === 'exiting' ? (started ? 'gone' : 'standing') : p))
    }, WATCHDOG_MS)
    return () => {
      window.clearInterval(stall)
      window.clearTimeout(watchdog)
    }
  }, [phase])

  const showVideo = (phase === 'walking' || phase === 'fading') && slideFromPx !== null
  // Exit video stays mounted from standing onward so it is preloaded and the
  // poster -> first-frame swap is invisible.
  const mountExit = !!exitWebm && (phase === 'standing' || phase === 'exiting' || phase === 'gone')
  const showExit = phase === 'exiting'
  // Everything except the walk itself shows the poster — including `waiting`,
  // so a tab that never becomes visible still renders the character instead of
  // an empty hero.
  const showPoster =
    phase !== 'walking' && phase !== 'gone' && !(phase === 'exiting' && exitPlaying)

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '1696 / 2528' }}>
      {showVideo && (
        <div
          className="absolute"
          style={{
            width: `${videoWidthPerW * 100}%`,
            left: `${videoLeftPerW * 100}%`,
            bottom: `${(videoBottomPerW / containerHeightPerW) * 100}%`,
            aspectRatio: `${VIDEO_ASPECT}`,
            transform: `translateX(${slid ? 0 : slideFromPx ?? 0}px)`,
            transition: `transform ${SLIDE_DURATION_S}s cubic-bezier(0.4, 0, 0.3, 1)`,
            willChange: 'transform',
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onEnded={() => setPhase('fading')}
            onError={() => {
              // Source-level errors (e.g. Chromium rejecting the HEVC <source>)
              // surface here through React's event delegation while the WebM
              // fallback still loads fine — only bail when the video element
              // itself reports total failure.
              if (videoRef.current?.error) setPhase('standing')
            }}
            className="block w-full h-full max-w-none"
            style={{
              // Soften the video's left border so the character never shows a
              // hard vertical cut while emerging.
              maskImage: 'linear-gradient(to right, transparent 0%, black 5%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%)',
            }}
          >
            {/* HEVC-with-alpha first: Safari plays it, Chromium falls through to WebM. */}
            {videoMov && <source src={videoMov} type='video/mp4; codecs="hvc1"' />}
            <source src={videoWebm} type="video/webm" />
          </video>
        </div>
      )}
      {mountExit && (
        <div
          className="absolute"
          style={{
            width: `${exitWidthPerW * 100}%`,
            left: `${exitLeftPerW * 100}%`,
            bottom: `${(exitBottomPerW / containerHeightPerW) * 100}%`,
            aspectRatio: `${VIDEO_ASPECT}`,
            opacity: showExit ? 1 : 0,
          }}
        >
          <video
            ref={exitRef}
            muted
            playsInline
            preload="auto"
            onPlaying={() => setExitPlaying(true)}
            onEnded={() => setPhase('gone')}
            onError={() => {
              if (exitRef.current?.error) {
                setExitPlaying(false)
                setPhase('standing')
              }
            }}
            className="block w-full h-full max-w-none"
            style={{
              // Soften the right border so he never hard-clips while exiting
              // on ultra-wide viewports.
              maskImage: 'linear-gradient(to left, transparent 0%, black 5%)',
              WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 5%)',
            }}
          >
            {exitMov && <source src={exitMov} type='video/mp4; codecs="hvc1"' />}
            <source src={exitWebm} type="video/webm" />
          </video>
        </div>
      )}
      {/* Hi-res poster crossfades in over the video's frozen final frame. */}
      <img
        src={posterSrc}
        alt={posterAlt}
        className="absolute inset-0 block w-full h-full object-contain"
        style={{
          opacity: showPoster ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      />
    </div>
  )
}
