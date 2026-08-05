import { useState } from 'react'
import {
  SiClaude,
  SiCss,
  SiExpress,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import FadeIn from '../components/FadeIn'
import SplitText from '../components/SplitText'
import LogoLoop from '../components/LogoLoop'
import type { LogoItem } from '../components/LogoLoop'

const TECH_LOGOS: LogoItem[] = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiJavascript />, title: 'JavaScript', href: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org' },
  { node: <SiExpress />, title: 'Express', href: 'https://expressjs.com' },
  { node: <SiMongodb />, title: 'MongoDB', href: 'https://www.mongodb.com' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { node: <SiVite />, title: 'Vite', href: 'https://vite.dev' },
  { node: <SiHtml5 />, title: 'HTML5', href: 'https://developer.mozilla.org/docs/Web/HTML' },
  { node: <SiCss />, title: 'CSS', href: 'https://developer.mozilla.org/docs/Web/CSS' },
  { node: <SiClaude />, title: 'Claude AI', href: 'https://claude.ai' },
  { node: <SiGit />, title: 'Git', href: 'https://git-scm.com' },
  { node: <SiGithub />, title: 'GitHub', href: 'https://github.com/shoaibhasann' },
  { node: <SiVercel />, title: 'Vercel', href: 'https://vercel.com' },
  { node: <SiFigma />, title: 'Figma', href: 'https://figma.com' },
]

export default function TechStackSection(): JSX.Element {
  const [paused, setPaused] = useState(false)
  // Touch devices synthesize mouseenter without a matching mouseleave, which
  // would freeze the loop on the first tap — only pause for real pointers.
  const [canHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )

  return (
    <section className="bg-[#0C0C0C] pt-20 sm:pt-24 md:pt-28 pb-2">
      <div className="text-center mb-10 md:mb-12">
        <SplitText
          text="Tools and tech I work with"
          tag="p"
          splitType="words"
          delay={90}
          duration={0.7}
          rootMargin="-40px"
          className="text-[#D7E2EA]/50 font-medium uppercase tracking-[0.3em] text-[10px] sm:text-xs md:text-sm"
        />
      </div>
      <FadeIn y={20} delay={0.15}>
        {/* Hovering the strip eases the loop to a stop (LogoLoop's smooth tau)
            instead of the default hard pause. */}
        <div
          className="text-[#D7E2EA] mx-5 sm:mx-10 md:mx-16 lg:mx-24"
          style={{ height: '80px', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={() => canHover && setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <LogoLoop
            logos={TECH_LOGOS}
            speed={paused ? 0 : 100}
            direction="left"
            logoHeight={44}
            gap={64}
            pauseOnHover={false}
            scaleOnHover
            fadeOut
            fadeOutColor="#0C0C0C"
            ariaLabel="Technologies Shoaib works with"
          />
        </div>
      </FadeIn>
    </section>
  )
}
