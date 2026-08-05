import FadeIn from '../components/FadeIn'
import SectionIntro from '../components/SectionIntro'
import { SERVICES } from '../data/services'

export default function ServicesSection() {
  return (
    <section className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <SectionIntro
        heading="Services"
        sub="What I can build for you"
        headingClassName="text-[#0C0C0C] font-black uppercase leading-none"
        headingStyle={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        subClassName="text-[#0C0C0C]/50 font-medium uppercase tracking-[0.3em] text-[10px] sm:text-xs md:text-sm"
        className="mb-16 sm:mb-20 md:mb-28"
      />

      <div className="max-w-5xl mx-auto divide-y divide-[rgba(12,12,12,0.15)]">
        {SERVICES.map((item, i) => (
          <FadeIn key={item.number} delay={0.08 + (i % 2) * 0.08} y={36}>
            <div className="flex flex-row items-center gap-6 md:gap-10 py-8 sm:py-10 md:py-12">
              <span
                className="font-black text-[#0C0C0C] leading-none shrink-0"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {item.number}
              </span>

              <div>
                <h3
                  className="font-medium uppercase text-[#0C0C0C]"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {item.name}
                </h3>
                <p
                  className="font-light leading-relaxed max-w-2xl text-[#0C0C0C]"
                  style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
