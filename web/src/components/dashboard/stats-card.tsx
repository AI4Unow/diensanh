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
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="w-10 h-10 bg-primary-50 rounded-lg animate-pulse" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export function StatsCard({ title, value, icon, trend, loading, className }: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />

  return (
    <div className={cn(
      'bg-card rounded-xl border p-5 shadow-sm',
      'transition-all duration-200',
      'hover:shadow-md hover:border-primary-200',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold">{value.toLocaleString('vi-VN')}</div>
        {trend && (
          <div
            className={cn(
              'text-sm mt-1',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}% so với tháng trước
          </div>
        )}
      </div>
    </div>
  )
}
