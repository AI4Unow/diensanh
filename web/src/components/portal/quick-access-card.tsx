import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface QuickAccessCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  className?: string
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
  green: 'bg-green-50 text-green-600 border-green-200 hover:border-green-400',
  purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
  orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-400',
  red: 'bg-red-50 text-red-600 border-red-200 hover:border-red-400'
}

export function QuickAccessCard({
  icon,
  title,
  description,
  href,
  color = 'blue',
  className
}: QuickAccessCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'block bg-white rounded-xl border-2 shadow-sm p-6 transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary-400 focus-visible:ring-4 focus-visible:ring-gov-gold focus-visible:outline-none',
        'min-h-[120px] flex flex-col justify-center',
        className
      )}
      style={{ minHeight: 'var(--spacing-touch-lg)' }}
    >
      {/* Icon */}
      <div className={cn(
        'p-3 rounded-lg w-fit mb-4',
        colorClasses[color]
      )}>
        <div className="w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  )
}