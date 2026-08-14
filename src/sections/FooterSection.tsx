import { ArrowUp } from 'lucide-react'
import FadeIn from '../components/FadeIn'
import FlapText from '../components/FlapText'
import { ACCENT_BG, ACCENT_TEXT } from '../styles/accent'
import { SOCIALS } from '../data/socials'

const EMAIL = 'hi@iamshoaib.tech'

interface BoardRow {
  channel: string
  handle: string
  status: string
  href: string
  /** Live channels glow; the rest read as scheduled. */
  hot?: boolean
}

// Departures board: every row is a way to reach him, in board language.
const ROWS: BoardRow[] = [
  { channel: 'Email', handle: 'HI@IAMSHOAIB.TECH', status: 'BOARDING', href: `mailto:${EMAIL}`, hot: true },
  { channel: 'WhatsApp', handle: 'DIRECT LINE', status: 'ON TIME', href: 'https://wa.me/917818906577', hot: true },
  { channel: 'LinkedIn', handle: 'SHOAIB HASAN', status: 'OPEN', href: 'https://www.linkedin.com/in/mohd-shoaib-ansari-2a0b16230' },
  { channel: 'GitHub', handle: 'SHOAIBHASANN', status: 'PUSHING', href: 'https://github.com/shoaibhasann' },
  { channel: 'Instagram', handle: 'SHOAIB.HASANN', status: 'DAILY', href: 'https://www.instagram.com/shoaib.hasann' },
]

export default function FooterSection(): JSX.Element {
  return (
    <footer className="relative bg-[#0C0C0C] px-5 sm:px-8 md:px-10 pt-16 pb-12 md:pt-20 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Board headline */}
        <FadeIn y={20}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="flex items-center gap-2 text-[#D7E2EA]/45 font-medium uppercase tracking-[0.35em] text-[9px] sm:text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Departures
            </p>
            <p className="text-[#D7E2EA]/30 font-medium uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">
              Gate 01 · Worldwide
            </p>
          </div>
        </FadeIn>

        {/* The board itself */}
        <div
          className="rounded-2xl border border-white/10 px-4 py-6 sm:px-8 sm:py-8 overflow-x-auto"
          style={{
            background: 'linear-gradient(180deg, #121218 0%, #0A0A0E 100%)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <FadeIn y={18}>
            <div className="flex justify-center">
              <FlapText
                text="Ready when you are"
                className="justify-center text-white font-black tracking-tight text-[clamp(1.1rem,4.6vw,2.6rem)]"
              />
            </div>
          </FadeIn>

          {/* Column heads */}
          <div className="mt-7 sm:mt-9 grid grid-cols-[minmax(74px,1fr)_minmax(150px,2fr)_minmax(74px,1fr)] gap-3 sm:gap-6 pb-3 border-b border-white/10">
            {['Channel', 'Handle', 'Status'].map((h) => (
              <span
                key={h}
                className="text-[#D7E2EA]/35 font-semibold uppercase tracking-[0.28em] text-[8px] sm:text-[9px]"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {ROWS.map((row, i) => (
              <a
                key={row.channel}
                href={row.href}
                target={row.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                className="group grid grid-cols-[minmax(74px,1fr)_minmax(150px,2fr)_minmax(74px,1fr)] gap-3 sm:gap-6 items-center py-3.5 sm:py-4 transition-colors hover:bg-white/[0.03] rounded-lg"
              >
                <span className="text-[#D7E2EA]/70 group-hover:text-white font-semibold uppercase tracking-[0.16em] text-[10px] sm:text-xs transition-colors">
                  {row.channel}
                </span>
                <FlapText
                  text={row.handle}
                  startDelay={500 + i * 260}
                  className="text-[#EDEFF4] font-medium text-[10px] sm:text-sm"
                />
                <span className="flex items-center gap-1.5">
                  {row.hot && (
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                      style={{ background: '#E24CD0' }}
                    />
                  )}
                  <FlapText
                    text={row.status}
                    startDelay={700 + i * 260}
                    className={`font-semibold text-[9px] sm:text-[11px] ${
                      row.hot ? 'text-[#F3B8E9]' : 'text-[#D7E2EA]/55'
                    }`}
                  />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Under-board bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-center sm:text-left">
            <p className="text-white font-black uppercase tracking-tight text-base">
              Shoaib Hasan
            </p>
            <p
              className="font-semibold uppercase tracking-[0.22em] text-[9px] mt-1"
              style={ACCENT_TEXT}
            >
              Full-Stack Developer &amp; AI Solutions
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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

        <p className="text-center sm:text-left text-[#D7E2EA]/30 font-light text-[11px] mt-8">
          © 2026 Shoaib Hasan. All departures on schedule.
        </p>
      </div>
    </footer>
  )
}
