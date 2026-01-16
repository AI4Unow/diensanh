import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  icon: ReactNode
  trend?: { value: number; isPositive: boolean }
  loading?: boolean
  className?: string
}

function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border-l-4 border-l-gov-blue p-6 shadow-sm min-h-[120px]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-16 bg-muted rounded animate-pulse mt-3" />
        </div>
        <div className="w-12 h-12 bg-gov-blue-light rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export function StatsCard({ title, value, icon, trend, loading, className }: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />

  return (
    <div className={cn(
      'bg-card rounded-xl border-l-4 border-l-primary-600 p-6 shadow-sm min-h-[120px]',
      'transition-all duration-200',
      'hover:shadow-md hover:border-l-primary-700',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-base font-medium text-muted-foreground">{title}</div>
          <div className="text-4xl font-bold text-foreground mt-2">
            {value.toLocaleString('vi-VN')}
          </div>
          {trend && (
            <div
              className={cn(
                'text-sm mt-2',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% so với tháng trước
            </div>
          )}
        </div>
        <div className="p-3 bg-gov-blue-light text-primary-600 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}
