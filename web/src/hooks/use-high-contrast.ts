import { useState, useEffect } from 'react'

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('high-contrast') === 'true' ||
             window.matchMedia('(prefers-contrast: more)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('theme-high-contrast', highContrast)
      localStorage.setItem('high-contrast', String(highContrast))
    }
  }, [highContrast])

  return [highContrast, setHighContrast] as const
}