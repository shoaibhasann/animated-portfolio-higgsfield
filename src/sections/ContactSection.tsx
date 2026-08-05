import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { CONTACT_CARD_IMAGE, CONTACT_ROOFTOP_VIDEO } from '../data/images'
import { SOCIALS } from '../data/socials'
import { ACCENT_BG } from '../styles/accent'

const EMAIL = 'hi@iamshoaib.tech'

// ---- Scroll choreography -------------------------------------------------
// 0 .. SCRUB_END : scrub the rooftop clip (he turns, walks up, extends the
//                  blank glowing card toward the lens)
// CARD_IN .. 1   : the printed-card closing shot dissolves in over the
//                  frozen frame — the card is in the same spot in both, so
//                  only the soft-focus background shifts.
const RUNWAY_VH = 260
const SCRUB_END = 0.8
const CARD_IN = 0.81

// The scrub stops the moment the card reaches full extension (measured:
// frame 130/145 ≈ 5.42s) and the printed card dissolves in immediately —
// the blank card never dwells on screen. The rest of the runway holds the
// printed card.
const SCRUB_END_T = 5.5

// The card's rect in the closing image (fractions of its frame, measured
// from the pixels) — used to place the invisible mailto hotspot, padded a
// touch so near-misses still land.
const CARD_FRAC = { x: 0.325, y: 0.445, w: 0.314, h: 0.268 }
const HOTSPOT_PAD = 0.03
// Phone framing: `cover` on a portrait viewport renders the card wider than
// the screen, so it always clipped. Instead the media is laid out at an
// explicit size and offset that zooms the frame onto the card: the card ends
// up ~84vw wide and centred, with the hand and his blurred face still in
// shot. Derived from CARD_FRAC + the 2752x1536 source aspect.
const FRAME_ASPECT = 2752 / 1536
const CARD_TARGET_VW = 0.84
// Rendered frame width so the card lands at CARD_TARGET_VW of the viewport.
const PHONE_W_VW = (CARD_TARGET_VW / CARD_FRAC.w) * 100
const PHONE_H_VW = PHONE_W_VW / FRAME_ASPECT
// Offsets that centre the card in the viewport.
const PHONE_LEFT_VW = 50 - (CARD_FRAC.x + CARD_FRAC.w / 2) * PHONE_W_VW
const PHONE_TOP_OFFSET_VW = (CARD_FRAC.y + CARD_FRAC.h / 2) * PHONE_H_VW

const phoneFrameStyle: CSSProperties = {
  width: `${PHONE_W_VW.toFixed(2)}vw`,
  height: `${PHONE_H_VW.toFixed(2)}vw`,
  left: `${PHONE_LEFT_VW.toFixed(2)}vw`,
  top: `calc(50% - ${PHONE_TOP_OFFSET_VW.toFixed(2)}vw)`,
  right: 'auto',
  bottom: 'auto',
  // Tailwind preflight caps media at `max-width: 100%`, which clamped the
  // zoomed frame back to the viewport width.
  maxWidth: 'none',
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Map a frame-fraction rect through the element's object-cover box. */
function fitMap(el: HTMLElement, iw: number, ih: number, frac: typeof CARD_FRAC): Box {
  // offsetWidth/Height: the UNSCALED layout box, so the hotspot's coordinates
  // stay in the scaled stage's own space.
  const w = el.offsetWidth
  const h = el.offsetHeight
  const scale = Math.max(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  // object-position: phones centre the crop on the card, desktop centres it.
  const ox = el.offsetLeft + (w - dw) / 2
  const oy = el.offsetTop + (h - dh) / 2
  return {
    left: ox + frac.x * dw,
    top: oy + frac.y * dh,
    width: frac.w * dw,
    height: frac.h * dh,
  }
}

/**
 * "The Rooftop Handoff": the site's closing scene. The character who walked
 * into the hero now stands on a night rooftop, walks up and holds out his
 * card — and the blank card resolves into his printed business card (baked
 * into the closing shot, so it always sits perfectly in his hand). The card
 * area is a live mailto link. Fully scroll-scrubbed and reversible.
 */
export default function ContactSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [videoOk, setVideoOk] = useState(true)
  const [cardShown, setCardShown] = useState(false)
  // Once the dissolve completes, the printed card is sealed on via plain
  // React state (synchronous DOM style), so no animation-frame throttling
  // can ever leave the section ending on the blank card.
  const [sealed, setSealed] = useState(false)
  const [hotspot, setHotspot] = useState<Box | null>(null)
  // Portrait phones: `cover` renders the card wider than the screen, so the
  // whole cinematic is centred on the card and scaled to fit (letterboxed
  // top/bottom, which reads as intentional on the dark page).
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(min-width: 640px)').matches
  )
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (p) => {
      setCardShown(p >= CARD_IN)
      setSealed(p >= CARD_IN + 0.05)
      const video = videoRef.current
      if (!video || !videoOk) return
      const t = clamp01(p / SCRUB_END) * SCRUB_END_T
      video.currentTime = Math.min(t, SCRUB_END_T)
    })
    return unsub
  }, [scrollYProgress, videoOk])

  // Landing straight at the bottom (restored scroll position, a hash link, a
  // resize) fires no scroll event, so seed the state from wherever we already
  // are instead of waiting for one.
  useEffect(() => {
    const sync = (): void => {
      const p = scrollYProgress.get()
      setCardShown(p >= CARD_IN)
      setSealed(p >= CARD_IN + 0.05)
    }
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [scrollYProgress])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const onChange = () => setIsPhone(!mq.matches)
    mq.addEventListener('change', onChange)
    // Belt and braces: some embedded browsers resize the viewport without
    // firing the media-query change event.
    window.addEventListener('resize', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  // Place the mailto hotspot over the card in the closing shot.
  useEffect(() => {
    const compute = () => {
      const img = imgRef.current
      if (!img || !img.naturalWidth) return
      const padded = {
        x: CARD_FRAC.x - HOTSPOT_PAD,
        y: CARD_FRAC.y - HOTSPOT_PAD,
        w: CARD_FRAC.w + HOTSPOT_PAD * 2,
        h: CARD_FRAC.h + HOTSPOT_PAD * 2,
      }
      setHotspot(fitMap(img, img.naturalWidth, img.naturalHeight, padded))
    }
    const img = imgRef.current
    if (img?.complete) compute()
    img?.addEventListener('load', compute)
    window.addEventListener('resize', compute)
    // The element's own box can settle after load (sticky layout, fit swap,
    // mobile browser chrome collapsing) — a plain load/resize pair measured
    // it too early and left the hotspot off the card.
    const ro = new ResizeObserver(compute)
    if (img) ro.observe(img)
    return () => {
      img?.removeEventListener('load', compute)
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [isPhone])

  // The closing shot dissolves in; the card is pinned in place in both
  // frames, so the blend reads as the card "printing" itself.
  const imgOpacity = useTransform(scrollYProgress, [CARD_IN, CARD_IN + 0.04], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0C0C0C]"
      style={{ height: `${RUNWAY_VH}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-clip">
        {/* One scaled stage so the clip, the closing shot and the hotspot all
            share the same coordinate system. */}
        <div className="absolute inset-0">
        {videoOk && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={isPhone ? phoneFrameStyle : undefined}
            aria-hidden="true"
            onError={() => {
              if (videoRef.current?.error) setVideoOk(false)
            }}
          >
            <source src={CONTACT_ROOFTOP_VIDEO} type="video/mp4" />
          </video>
        )}

        {/* Closing shot with the printed card. If the video fails, this is
            simply the section, full stop. */}
        <motion.img
          ref={imgRef}
          src={CONTACT_CARD_IMAGE}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: videoOk ? (sealed ? 1 : imgOpacity) : 1,
            ...(isPhone ? phoneFrameStyle : null),
          }}
          onError={() => {
            // One cache-busted retry so a flaky fetch can never leave the
            // section ending on the blank card.
            const img = imgRef.current
            if (img && !img.src.includes('?retry')) {
              img.src = `${CONTACT_CARD_IMAGE}?retry=1`
            }
          }}
        />

        {/* The printed card in his hand IS the CTA. */}
        {(cardShown || !videoOk) && hotspot && (
          <a
            href={`mailto:${EMAIL}`}
            aria-label={`Email ${EMAIL}`}
            className="absolute z-10 cursor-pointer"
            style={{
              left: hotspot.left,
              top: hotspot.top,
              width: hotspot.width,
              height: hotspot.height,
            }}
          />
        )}

        </div>

        {/* Closing strip: no panel, no rule, elements sitting straight on the
            rooftop. Fades in with the printed card so it never competes with
            the scrub. */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 px-5 sm:px-8 md:px-10 pb-7 sm:pb-8 transition-opacity duration-700 ${
            cardShown || !videoOk ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-6xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-5">
            <p
              className="text-white/55 font-light text-[11px]"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}
            >
              © 2026 Shoaib Hasan. Built end to end.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="social-dot w-9 h-9 rounded-full flex items-center justify-center text-[#EBD7F2]/80 hover:text-white"
                  style={{
                    border: '1px solid rgba(226, 76, 208, 0.28)',
                    background:
                      'linear-gradient(140deg, rgba(70, 14, 92, 0.7) 0%, rgba(24, 4, 34, 0.7) 100%)',
                  }}
                >
                  <Icon className="w-[16px] h-[16px]" />
                </a>
              ))}
              <button
                type="button"
                aria-label="Back to top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                style={{ background: ACCENT_BG }}
              >
                <ArrowUp className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Screen-reader contact info (the cinema is aria-hidden). */}
        <div className="sr-only">
          <h2>Contact Shoaib Hasan</h2>
          <p>Full-Stack Developer &amp; AI Solutions. Available worldwide, replies within 24 hours.</p>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </div>
    </section>
  )
}
