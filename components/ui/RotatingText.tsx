'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface RotatingTextProps {
  phrases: string[]
  className?: string
}

export const RotatingText: React.FC<RotatingTextProps> = ({ phrases, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsAnimating(false)
      }, 300) // Half of animation duration
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [phrases.length])

  return (
    <div className={cn('relative inline-block', className)}>
      <span
        className={cn(
          'inline-block transition-all duration-600 ease-in-out',
          isAnimating
            ? 'opacity-0 translate-y-4 scale-95'
            : 'opacity-100 translate-y-0 scale-100'
        )}
      >
        {phrases[currentIndex]}
      </span>
    </div>
  )
}

