export interface Service {
  number: string
  name: string
  description: string
}

export const SERVICES: Service[] = [
  {
    number: '01',
    name: 'Full-Stack Web Apps',
    description:
      'React, Next.js and Node builds that go from idea to production without drama. Fast, scalable, and clean under the hood.',
  },
  {
    number: '02',
    name: 'AI Integration & Automation',
    description:
      'Chatbots, smart workflows and LLM features wired straight into your product. Real automation that saves hours, not gimmicks.',
  },
  {
    number: '03',
    name: 'Business Websites',
    description:
      'Sharp, conversion-first sites for brands, clinics and studios. Built to rank on Google and built to win clients.',
  },
  {
    number: '04',
    name: 'E-commerce & B2B Platforms',
    description:
      'Storefronts and trade platforms with payments, catalogs and dashboards. Everything a growing business actually needs.',
  },
  {
    number: '05',
    name: 'Launch & Care',
    description:
      'Deploys, SEO, analytics and ongoing upgrades. I ship it, then I keep it sharp while you run the business.',
  },
]
