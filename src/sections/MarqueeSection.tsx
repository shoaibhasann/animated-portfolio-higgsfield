import { useEffect, useRef } from 'react'
import { MARQUEE_ROW_1, MARQUEE_ROW_2 } from '../data/marqueeImages'


// "hero-space-voyage-preview-xxxx.gif" -> "space voyage website hero design preview"
const altFromSrc = (src: string): string => {
  const slug = src.split('/').pop() ?? ''
  const name = slug.replace(/^hero-/, '').replace(/-preview.*$/, '').replace(/-/g, ' ')
  return `${name} website hero design preview`
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePositions = () => {
      const section = sectionRef.current
      const row1 = row1Ref.current
      const row2 = row2Ref.current
      if (!section || !row1 || !row2) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      // Clamped and biased so both rows stay left-shifted through the whole
      // parallax range: a positive shift used to expose a blank strip on the
      // row's left edge at the ends of the scroll range.
      const raw = (window.scrollY - sectionTop + window.innerHeight) * 0.3
      const offset = Math.min(600, Math.max(0, raw))

      row1.style.transform = `translateX(${offset - 650}px)`
      row2.style.transform = `translateX(${-50 - offset}px)`
    }

    updatePositions()

    window.addEventListener('scroll', updatePositions, { passive: true })
    window.addEventListener('resize', updatePositions)

    return () => {
      window.removeEventListener('scroll', updatePositions)
      window.removeEventListener('resize', updatePositions)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-[#0C0C0C] pt-14 sm:pt-16 md:pt-20 pb-10 overflow-hidden"
    >
      <div className="flex flex-col gap-3">
        <div className="overflow-hidden">
          <div ref={row1Ref} className="flex gap-3" style={{ willChange: 'transform' }}>
            {MARQUEE_ROW_1.map((src, i) => (
              <img
                key={i}
                src={src}
                loading="lazy"
                alt={altFromSrc(src)}
                className="w-[420px] h-[270px] object-cover rounded-2xl"
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden">
          <div ref={row2Ref} className="flex gap-3" style={{ willChange: 'transform' }}>
            {MARQUEE_ROW_2.map((src, i) => (
              <img
                key={i}
                src={src}
                loading="lazy"
                alt={altFromSrc(src)}
                className="w-[420px] h-[270px] object-cover rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
