import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gov-gold/30 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'hover:bg-muted text-foreground',
  },
  sizes: {
    sm: 'min-h-10 px-4 text-sm',
    md: 'min-h-12 px-6 text-base',
    lg: 'min-h-14 px-8 text-lg',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants.base,
        buttonVariants.variants[variant],
        buttonVariants.sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'