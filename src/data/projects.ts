export interface Project {
  number: string
  name: string
  category: string
  tag: 'Client' | 'Personal'
  /** What was built, one tight line. */
  description: string
  /** What it achieved, worn as a badge on the card. */
  outcome: string
  /** Live URL. '#' until the real link is filled in. */
  href: string
}

export const PROJECTS: Project[] = [
  {
    number: '01',
    name: 'AJ Consultancy',
    category: 'Business Website',
    tag: 'Client',
    description:
      'Corporate site for a consultancy brand with sharp service pages, trust-building content and lead capture at every step. Designed to turn visitors into booked calls.',
    outcome: 'Steady inbound inquiries',
    href: '#',
  },
  {
    number: '02',
    name: 'AJ Medical Academy',
    category: 'Education Platform',
    tag: 'Client',
    description:
      'Admissions-first platform for a medical academy covering courses, faculty, counselling and enquiry flows. Parents and students get answers fast, the academy gets serious applications.',
    outcome: 'Admissions made simple',
    href: 'https://ajmedicalacademy.com',
  },
  {
    number: '03',
    name: 'RMV International',
    category: 'Export & Trade Platform',
    tag: 'Client',
    description:
      'B2B export platform with structured product catalogs, company credentials and enquiry pipelines tuned for international buyers who need confidence before they commit.',
    outcome: 'Serious global presence',
    href: 'https://rmv18.com',
  },
  {
    number: '04',
    name: 'Rise Chemical',
    category: 'B2B Industrial Site',
    tag: 'Client',
    description:
      'Industrial site with clean product lines, spec-ready pages and a straight path to enquiry. Procurement teams find what they need without digging.',
    outcome: 'Inquiry rate lifted',
    href: '#',
  },
  {
    number: '05',
    name: 'City Physiotherapy',
    category: 'Healthcare Platform',
    tag: 'Client',
    description:
      'Clinic platform with online booking, treatment pages and patient-first UX from the first tap to the visit. Less phone tag, more confirmed appointments.',
    outcome: 'Bookings over phone calls',
    href: '#',
  },
  {
    number: '06',
    name: 'Majestique Global',
    category: 'Brand Website',
    tag: 'Client',
    description:
      'Full brand build from identity to launch: design language, content and a premium site that actually sells the story instead of just telling it.',
    outcome: 'Brand came alive online',
    href: '#',
  },
  {
    number: '07',
    name: 'CoinPulse',
    category: 'Crypto Dashboard',
    tag: 'Personal',
    description:
      'Live crypto dashboard with real-time prices, interactive charts and watchlists on a fast, clean stack. Built for people who check the market twenty times a day.',
    outcome: 'Real-time data, zero lag',
    href: '#',
  },
]
