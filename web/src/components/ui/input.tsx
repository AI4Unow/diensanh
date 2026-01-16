import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'min-h-12 w-full px-4 py-3 rounded-lg border bg-background',
        'text-foreground placeholder:text-muted-foreground',
        'transition-colors',
        'focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-gov-gold/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-error focus:ring-error/20',
        !error && 'border-border',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'