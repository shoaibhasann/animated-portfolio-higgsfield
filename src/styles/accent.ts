import type { CSSProperties } from 'react'

// Brand accent: the original magenta to violet ramp with a warm ember tail.
// This is the same palette baked into the generated clips (tablet glow,
// elevator neon, rooftop card), so UI and cinematics stay in one world.
export const ACCENT_FROM = '#E24CD0'
export const ACCENT_MID = '#9B4DE0'
export const ACCENT_TO = '#BE4C00'

export const ACCENT_GRADIENT = `linear-gradient(123deg, ${ACCENT_FROM} 0%, ${ACCENT_MID} 60%, ${ACCENT_TO} 130%)`
export const ACCENT_BG = `linear-gradient(135deg, ${ACCENT_FROM} 0%, ${ACCENT_MID} 100%)`

/** Gradient text. Apply to the element that holds the text itself. */
export const ACCENT_TEXT: CSSProperties = {
  background: ACCENT_GRADIENT,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

/** Soft glow used behind accent UI on dark surfaces. */
export const ACCENT_GLOW = '0 0 24px rgba(226, 76, 208, 0.28)'
