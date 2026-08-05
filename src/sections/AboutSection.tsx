import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FadeIn from '../components/FadeIn'
import SectionIntro from '../components/SectionIntro'
import AnimatedText from '../components/AnimatedText'
import ContactButton from '../components/ContactButton'
import { ABOUT_CODING_VIDEO_MOV, ABOUT_CODING_VIDEO_WEBM } from '../data/images'

export default function AboutSection(): JSX.Element {
  return (
    <section className="min-h-screen relative flex flex-col justify-center px-5 sm:px-8 md:px-10 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section header */}
        <SectionIntro
          heading="About me"
          sub="The person behind the builds"
          headingClassName="hero-heading font-black uppercase leading-none tracking-tight"
          headingStyle={{ fontSize: 'clamp(2.75rem, 9vw, 130px)' }}
          subClassName="text-[#D7E2EA]/50 font-medium uppercase tracking-[0.3em] text-[10px] sm:text-xs md:text-sm"
          className="mb-12 md:mb-20"
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-14 lg:gap-24 items-center">
          {/* Left — content */}
          <div className="flex flex-col items-start gap-7 md:gap-9">
            <AnimatedText
              text="I'm Shoaib, a full-stack developer who turns ideas into fast, clean, AI-powered products. 20+ builds in the bag, from local brands to full platforms. Sharp design, solid code, zero fluff. Let's build something people remember."
              className="text-[#D7E2EA] font-semibold text-left leading-relaxed max-w-[620px] text-[clamp(1.15rem,1.9vw,1.65rem)]"
            />

            <FadeIn delay={0.2} x={-40} y={0}>
              <ContactButton />
            </FadeIn>
          </div>

          {/* Right — coding character as a native page element (transparent video, no card).
              The 16:9 source has empty margins around the subject, so it renders
              oversized and nudged right to make the desk setup read large. */}
          <FadeIn delay={0.2} x={60} y={0} duration={0.9}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="block w-full h-auto max-w-none md:w-[126%] md:-ml-[8%] lg:w-[132%] lg:-ml-[10%]"
              // 2560x1440 source: reserving the box prevents the +36px layout
              // shift on metadata load that left every ScrollTrigger below
              // this section with stale (early) start positions.
              style={{ aspectRatio: '2560 / 1440' }}
              onLoadedMetadata={() => ScrollTrigger.refresh()}
              aria-label="3D character of Shoaib coding at a desk"
            >
              {/* HEVC-with-alpha first: Safari plays it, Chromium falls through to WebM. */}
              <source src={ABOUT_CODING_VIDEO_MOV} type='video/mp4; codecs="hvc1"' />
              <source src={ABOUT_CODING_VIDEO_WEBM} type="video/webm" />
            </video>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
