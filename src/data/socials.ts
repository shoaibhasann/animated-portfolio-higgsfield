import type { ComponentType, SVGProps } from 'react'
import { Instagram, Linkedin } from 'lucide-react'
import { SiGithub, SiWhatsapp } from 'react-icons/si'

export interface Social {
  label: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Shown on phones too; the rest only appear from `sm` up. */
  primary?: boolean
}

/** Single source of truth: the hero row and the footer render this list. */
export const SOCIALS: Social[] = [
  { label: 'WhatsApp', href: 'https://wa.me/917818906577', Icon: SiWhatsapp, primary: true },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/shoaib.hasann',
    Icon: Instagram,
  },
  { label: 'GitHub', href: 'https://github.com/shoaibhasann', Icon: SiGithub },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mohd-shoaib-ansari-2a0b16230',
    Icon: Linkedin,
    primary: true,
  },
]
