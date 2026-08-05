import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

interface AnimatedTextProps {
  text: string
  className?: string
}

interface CharProps {
  char: string
  range: [number, number]
  progress: MotionValue<number>
}

function Char({ char, range, progress }: CharProps): JSX.Element {
  const opacity = useTransform(progress, range, [0.2, 1])

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ visibility: 'hidden' }}>{char}</span>
      <motion.span style={{ position: 'absolute', left: 0, top: 0, opacity }}>
        {char}
      </motion.span>
    </span>
  )
}

export default function AnimatedText({ text, className }: AnimatedTextProps): JSX.Element {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  // Chars are individually animated, but grouped per word inside a nowrap
  // wrapper so lines only ever break BETWEEN words, never mid-word. Char
  // indices count the separating spaces too, keeping the scroll stagger
  // linear across the whole text.
  const words = text.split(' ')
  const totalChars = text.length
  let charIndex = 0

  return (
    <p ref={ref} className={className}>
      {words.map((word, wordIndex) => {
        const startIndex = charIndex
        charIndex += word.length + 1
        return (
          <span key={wordIndex}>
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {word.split('').map((char, i) => {
                const index = startIndex + i
                return (
                  <Char
                    key={i}
                    char={char}
                    range={[index / totalChars, (index + 1) / totalChars]}
                    progress={scrollYProgress}
                  />
                )
              })}
            </span>
            {wordIndex < words.length - 1 && ' '}
          </span>
        )
      })}
    </p>
  )
}
