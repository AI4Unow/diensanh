import { Eye } from 'lucide-react'
import { useHighContrast } from '@/hooks/use-high-contrast'

interface HighContrastToggleProps {
  className?: string
}

export function HighContrastToggle({ className }: HighContrastToggleProps) {
  const [highContrast, setHighContrast] = useHighContrast()

  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${className}`}
      style={{ minHeight: 'var(--spacing-touch)' }}
      aria-pressed={highContrast}
      aria-label={`${highContrast ? 'Tắt' : 'Bật'} chế độ tương phản cao`}
    >
      <Eye className="w-5 h-5" />
      <span className="text-base">Chế độ tương phản cao</span>
    </button>
  )
}