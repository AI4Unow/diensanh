import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HotlineButtonProps {
  className?: string
  phoneNumber?: string
}

export function HotlineButton({
  className,
  phoneNumber = "0233.123.456"
}: HotlineButtonProps) {
  return (
    <a
      href={`tel:${phoneNumber.replace(/\./g, '')}`}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'bg-gov-red hover:bg-gov-red/90 text-white',
        'rounded-full shadow-lg hover:shadow-xl',
        'flex items-center gap-3 px-6 py-4',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:ring-4 focus-visible:ring-gov-gold focus-visible:outline-none',
        className
      )}
      style={{ minHeight: 'var(--spacing-touch-lg)', minWidth: 'var(--spacing-touch-lg)' }}
      aria-label={`Gọi hotline ${phoneNumber}`}
    >
      <Phone className="w-6 h-6" />
      <span className="font-semibold text-base whitespace-nowrap">
        Gọi: {phoneNumber}
      </span>
    </a>
  )
}