import type { CSSProperties } from 'react'
import SplitText from './SplitText'

interface SectionIntroProps {
  heading: string
  sub?: string
  headingClassName?: string
  headingStyle?: CSSProperties
  subClassName?: string
  /** Wrapper spacing (margins) for the pair. */
  className?: string
}

// One set of numbers for every section, so no heading reveals differently.
const HEADING_ANIM = {
  splitType: 'chars' as const,
  delay: 45,
  duration: 0.8,
  rootMargin: '-80px',
}

const SUB_ANIM = {
  splitType: 'words' as const,
  delay: 90,
  duration: 0.7,
  rootMargin: '-40px',
}

/**
 * The section heading + subheading pair. Both reveal with the same
 * scroll-triggered SplitText animation everywhere on the page.
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
        <SplitText
          text={heading}
          tag="h2"
          className={headingClassName}
          // Gradient headings must carry the gradient per character, or the
          // reveal is invisible and the heading appears to pop in.
          pieceClassName={headingClassName.includes('hero-heading') ? 'hero-heading' : ''}
          style={headingStyle}
          {...HEADING_ANIM}
        />
      </div>
      {sub && (
        <div className="text-center mt-2">
          <SplitText text={sub} tag="p" className={subClassName} {...SUB_ANIM} />
        </div>
      )}
    </div>
  )
}
