import type { ReactNode } from 'react'

interface StatsGridProps {
  children: ReactNode
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {children}
    </div>
  )
}
