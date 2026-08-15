import type { CSSProperties } from 'react'

interface SectionIntroProps {
  heading: string
  sub?: string
  headingClassName?: string
  headingStyle?: CSSProperties
  subClassName?: string
  /** Wrapper spacing (margins) for the pair. */
  className?: string
}

/**
 * The section heading + subheading pair. Both render plain and reveal via
 * the site-wide wipe (gradient headings take its clip-path variant).
 */
export default function SectionIntro({
  heading,
  sub,
  headingClassName = '',
  headingStyle,
  subClassName = '',
  className = '',
}: SectionIntroProps): JSX.Element {
  return (
    <div className={className}>
      <div className="text-center">
        <h2 className={headingClassName} style={headingStyle}>
          {heading}
        </h2>
      </div>
      {sub && (
        <div className="text-center mt-2">
          {/* Plain text on purpose: the site-wide wipe reveal picks it up. */}
          <p className={subClassName}>{sub}</p>
        </div>
      )}
    </div>
  )
}
