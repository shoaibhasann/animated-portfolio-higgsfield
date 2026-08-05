import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import FadeIn from '../components/FadeIn'
import { ACCENT_BG, ACCENT_TEXT } from '../styles/accent'
import { SOCIALS } from '../data/socials'
import { CONTACT_ROOFTOP_VIDEO } from '../data/images'

const EMAIL = 'hi@iamshoaib.tech'

interface CreditRow {
  label: string
  value: string
  href?: string
}

// The site plays like a short film (walk-in, elevator, rooftop handoff), so it
// signs off with actual end credits.
const CREDITS: CreditRow[] = [
  { label: 'Directed by', value: 'Shoaib Hasan' },
  { label: 'Built with', value: 'React · Next.js · Node · AI' },
  { label: 'Starring', value: '20+ shipped projects' },
  { label: 'Filmed on location', value: 'Worldwide' },
  { label: 'Runtime', value: 'Replies in under 24 hours' },
  { label: 'Casting', value: 'Taking select projects' },
  { label: 'Contact', value: EMAIL, href: `mailto:${EMAIL}` },
]

export default function FooterCredits(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)

  // The wordmark footage only decodes while the sign-off is actually on
  // screen — it is the same file the rooftop scene already cached.
  useEffect(() => {
    const wrap = wordmarkRef.current
    const video = videoRef.current
    if (!wrap || !video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '15%' }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <footer className="relative bg-[#0C0C0C] overflow-hidden">
      {/* Gradient hairline: the cut from the rooftop scene into the credits. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: ACCENT_BG }}
      />

      {/* Letterbox bars + grain, so the credits read as film, not as a page. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-10 bg-black/70" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-10 bg-black/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-14 md:pt-28 md:pb-16">
        <FadeIn y={18}>
          <p className="text-center text-[#D7E2EA]/40 font-medium uppercase tracking-[0.4em] text-[9px] sm:text-[10px]">
            A Shoaib Hasan production
          </p>
        </FadeIn>

        <div className="mt-10 md:mt-14 space-y-5 md:space-y-6">
          {CREDITS.map((row, i) => (
            <FadeIn key={row.label} y={22} delay={0.05 + i * 0.06}>
              <div className="grid grid-cols-2 gap-4 sm:gap-8 items-baseline">
                <span
                  className="text-right font-semibold uppercase tracking-[0.22em] text-[9px] sm:text-[10px]"
                  style={ACCENT_TEXT}
                >
                  {row.label}
                </span>
                {row.href ? (
                  <a
                    href={row.href}
                    className="text-left text-white/90 hover:text-white font-light text-sm sm:text-base tracking-wide underline underline-offset-8 decoration-white/20 hover:decoration-fuchsia-400/60 transition-colors"
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="text-left text-white/90 font-light text-sm sm:text-base tracking-wide">
                    {row.value}
                  </span>
                )}
              </div>
            </FadeIn>
          ))}

          <FadeIn y={22} delay={0.5}>
            <div className="grid grid-cols-2 gap-4 sm:gap-8 items-baseline">
              <span
                className="text-right font-semibold uppercase tracking-[0.22em] text-[9px] sm:text-[10px]"
                style={ACCENT_TEXT}
              >
                Follow
              </span>
              <span className="flex items-center gap-3 flex-wrap">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="social-dot w-9 h-9 rounded-full flex items-center justify-center text-[#EBD7F2]/75 hover:text-white"
                    style={{
                      border: '1px solid rgba(226, 76, 208, 0.28)',
                      background:
                        'linear-gradient(140deg, rgba(70, 14, 92, 0.7) 0%, rgba(24, 4, 34, 0.7) 100%)',
                    }}
                  >
                    <Icon className="w-[16px] h-[16px]" />
                  </a>
                ))}
              </span>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* The sign-off card: the rooftop skyline plays inside the letters. */}
      <div ref={wordmarkRef} className="relative w-full" style={{ aspectRatio: '1200 / 250' }}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src={CONTACT_ROOFTOP_VIDEO} type="video/mp4" />
        </video>
        {/* Knockout: the page colour is painted everywhere except the glyphs,
            so the footage is only visible through the name. */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 250"
          role="img"
          aria-label="Shoaib Hasan"
        >
          <defs>
            <mask id="footer-wordmark-mask">
              <rect width="1200" height="250" fill="#fff" />
              <text
                x="600"
                y="172"
                textAnchor="middle"
                fill="#000"
                fontFamily="Kanit, sans-serif"
                fontWeight="900"
                fontSize="150"
                letterSpacing="-4"
                textLength="1120"
                lengthAdjust="spacingAndGlyphs"
              >
                SHOAIB HASAN
              </text>
            </mask>
          </defs>
          <rect width="1200" height="250" fill="#0C0C0C" mask="url(#footer-wordmark-mask)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[#D7E2EA]/35 font-light text-[11px] sm:text-xs">
          © 2026 Shoaib Hasan. No pixels were harmed in the making of this site.
        </p>
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="social-dot flex items-center gap-2 rounded-full pl-4 pr-2 py-2 text-[#EBD7F2]/80 hover:text-white"
          style={{
            border: '1px solid rgba(226, 76, 208, 0.28)',
            background:
              'linear-gradient(140deg, rgba(70, 14, 92, 0.7) 0%, rgba(24, 4, 34, 0.7) 100%)',
          }}
        >
          <span className="font-semibold uppercase tracking-[0.25em] text-[9px]">Rewind</span>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ background: ACCENT_BG }}
          >
            <ArrowUp className="w-[15px] h-[15px]" />
          </span>
        </button>
      </div>
    </footer>
  )
}
