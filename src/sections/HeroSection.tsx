import { Briefcase, Globe, Rocket, Zap } from 'lucide-react'
import FadeIn from '../components/FadeIn'
import BlurText from '../components/BlurText'
import Magnet from '../components/Magnet'
import ContactButton from '../components/ContactButton'
import WalkInVideo from '../components/WalkInVideo'
import { ACCENT_TEXT } from '../styles/accent'
import { SOCIALS } from '../data/socials'
import {
  HERO_EXIT_VIDEO_MOV,
  HERO_EXIT_VIDEO_WEBM,
  HERO_PORTRAIT_URL,
  HERO_WALK_VIDEO_MOV,
  HERO_WALK_VIDEO_WEBM,
} from '../data/images'

const STATS = [
  { Icon: Rocket, top: '3+ years', sub: 'building for the web' },
  { Icon: Briefcase, top: '20+ projects', sub: 'in the bag' },
  { Icon: Zap, top: 'Replies within', sub: '24 hours' },
]

// Angular "data slate": top-left and bottom-right sliced at 45°, the other two
// corners left sharp. Deliberately not the CTA capsule.
const SLATE_CLIP =
  'polygon(26px 0, 100% 0, 100% calc(100% - 26px), calc(100% - 26px) 100%, 0 100%, 0 26px)'
// The same shape inset 2px on every edge so the white frame reads an even
// width. A 45° chamfer offsets by 2√2, so the cut shrinks to 24.8, not 24.
const SLATE_CLIP_INNER =
  'polygon(24.8px 0, 100% 0, 100% calc(100% - 24.8px), calc(100% - 24.8px) 100%, 0 100%, 0 24.8px)'
// Icon chip echoes the slate at small scale.
const CHIP_CLIP =
  'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'

export default function HeroSection(): JSX.Element {
  return (
    <section className="h-screen flex flex-col relative" style={{ overflowX: 'clip' }}>
      {/* Top bar — desktop only; on phones the strip crowds the wordmark. */}
      <div className="hidden sm:flex justify-between items-start px-5 sm:px-8 md:px-10 pt-5 md:pt-6">
        <FadeIn delay={0} y={-15} className="flex items-center gap-2 sm:gap-2.5">
          {SOCIALS.map(({ label, href, Icon, primary }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className={`social-dot w-10 h-10 rounded-full flex items-center justify-center text-[#EBD7F2]/75 hover:text-white ${
                primary ? 'flex' : 'hidden sm:flex'
              }`}
              style={{
                border: '1px solid rgba(226, 76, 208, 0.28)',
                background:
                  'linear-gradient(140deg, rgba(70, 14, 92, 0.7) 0%, rgba(24, 4, 34, 0.7) 100%)',
              }}
            >
              <Icon className="w-[18px] h-[18px]" />
            </a>
          ))}
        </FadeIn>
        <FadeIn delay={0.1} y={-15} className="flex items-center gap-2 md:gap-3">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[#D7E2EA] font-medium uppercase tracking-[0.25em] text-[10px] sm:text-xs md:text-sm">
            Taking Select Projects
          </p>
        </FadeIn>
      </div>

      {/* Giant background word */}
      <BlurText
        text="Developer"
        delay={70}
        animateBy="letters"
        direction="bottom"
        as="h1"
        className="font-black uppercase tracking-tight leading-none whitespace-nowrap w-full justify-center text-[18vw] mt-7 sm:mt-0 sm:-mt-1 md:-mt-6"
        segmentClassName="hero-heading"
        style={{ flexWrap: 'nowrap' }}
      />

      {/* Left column — identity */}
      <div className="absolute z-20 left-5 sm:left-8 md:left-10 bottom-10 sm:bottom-10 md:bottom-12 lg:bottom-16 max-w-[86%] md:max-w-[36vw]">
        <FadeIn delay={0.25} x={-28} y={0}>
          <p className="italic font-light text-[#D7E2EA]/80 text-sm sm:text-base md:text-2xl tracking-wide">
            Hello, I&apos;m
          </p>
        </FadeIn>
        <FadeIn delay={0.35} x={-28} y={0}>
          <h2 className="hero-name font-black uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-6xl lg:text-7xl mt-1 md:mt-2">
            Shoaib
            <br />
            Hasan
          </h2>
        </FadeIn>
        <FadeIn delay={0.45} x={-28} y={0}>
          <p
            className="font-semibold uppercase tracking-[0.18em] text-[10px] sm:text-xs md:text-base mt-2 md:mt-4"
            style={ACCENT_TEXT}
          >
            Full-Stack Developer &amp; AI Solutions
          </p>
        </FadeIn>
        <FadeIn delay={0.55} x={-28} y={0}>
          <p className="hidden sm:block text-[#D7E2EA]/60 font-light text-xs md:text-sm leading-relaxed mt-3 md:mt-4 max-w-[40ch]">
            Websites that load fast, look sharp, and actually convert. From
            brand sites to AI-powered products, built end to end.
          </p>
        </FadeIn>
        <FadeIn delay={0.65} x={-28} y={0} className="flex items-center gap-2 mt-3 md:mt-5">
          <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#D7E2EA]/70" />
          <p className="text-[#D7E2EA]/70 font-medium uppercase tracking-[0.25em] text-[9px] sm:text-[10px] md:text-xs">
            Available Worldwide
          </p>
        </FadeIn>
        <FadeIn delay={0.75} x={-28} y={0} className="mt-4 md:mt-7">
          <ContactButton />
        </FadeIn>
      </div>

      {/* Right column: stat cards in the CTA's own gradient family */}
      <div className="hidden md:flex absolute z-20 right-8 md:right-10 bottom-12 lg:bottom-16 flex-col items-stretch gap-4 w-[280px] lg:w-[330px]">
        {STATS.map(({ Icon, top, sub }, i) => (
          <FadeIn key={top} delay={0.5 + i * 0.12} x={28} y={0}>
            {/* Glow rides on `filter`: clip-path would swallow a box-shadow. */}
            <div className="stat-card">
              {/* White frame, then the gradient face inset inside it. */}
              <div style={{ clipPath: SLATE_CLIP, background: '#ffffff', padding: '2px' }}>
                <div
                  className="flex items-center gap-4 pl-4 pr-6 py-3 lg:pl-5 lg:pr-7 lg:py-3.5"
                  style={{
                    clipPath: SLATE_CLIP_INNER,
                    // Same brand ramp and inset violet glow as LET'S BUILD.
                    background:
                      'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                    boxShadow: 'inset 4px 4px 12px #7721B1',
                  }}
                >
                  <span
                    className="w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center shrink-0"
                    style={{
                      clipPath: CHIP_CLIP,
                      background: 'rgba(255, 255, 255, 0.16)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Icon className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-white" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-white font-semibold uppercase tracking-wider text-xs lg:text-sm leading-tight">
                      {top}
                    </span>
                    <span className="block text-white/70 font-light text-xs lg:text-sm mt-0.5">
                      {sub}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* 3D character on his glowing platform */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 top-1/2 -translate-y-1/2 top-[46%] sm:top-auto sm:translate-y-0 sm:bottom-0 w-[300px] sm:w-[350px] md:w-[430px] lg:w-[500px]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[106%] pointer-events-none"
          style={{ aspectRatio: '4.8 / 1' }}
        >
          <div
            className="absolute inset-0 rounded-[50%]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(155, 77, 224, 0.16) 0%, rgba(226, 76, 208, 0.06) 45%, rgba(12, 12, 12, 0) 72%)',
            }}
          />
          <div
            className="absolute inset-0 rounded-[50%]"
            style={{
              border: '2px solid rgba(226, 76, 208, 0.45)',
              boxShadow:
                '0 0 18px rgba(226, 76, 208, 0.3), inset 0 0 26px rgba(155, 77, 224, 0.18)',
            }}
          />
        </div>
        <Magnet
          padding={150}
          strength={3}
          activeTransition="transform 0.3s ease-out"
          inactiveTransition="transform 0.6s ease-in-out"
        >
          <WalkInVideo
            videoWebm={HERO_WALK_VIDEO_WEBM}
            videoMov={HERO_WALK_VIDEO_MOV}
            exitWebm={HERO_EXIT_VIDEO_WEBM}
            exitMov={HERO_EXIT_VIDEO_MOV}
            posterSrc={HERO_PORTRAIT_URL}
            posterAlt="Shoaib Hasan 3D character"
          />
        </Magnet>
      </div>
    </section>
  )
}
