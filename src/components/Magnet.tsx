import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  activeTransition?: string
  inactiveTransition?: string
  className?: string
}

export default function Magnet({
  children,
  padding = 100,
  strength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps): JSX.Element {
  const magnetRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const element = magnetRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const cursorX = e.clientX
      const cursorY = e.clientY

      const withinRange =
        cursorX >= rect.left - padding &&
        cursorX <= rect.right + padding &&
        cursorY >= rect.top - padding &&
        cursorY <= rect.bottom + padding

      if (withinRange) {
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distX = cursorX - centerX
        const distY = cursorY - centerY

        setIsActive(true)
        setTranslate({ x: distX / strength, y: distY / strength })
      } else {
        setIsActive(false)
        setTranslate({ x: 0, y: 0 })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [padding, strength])

  return (
    <div
      ref={magnetRef}
      className={className}
      style={{
        transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
        transition: isActive ? activeTransition : inactiveTransition,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
