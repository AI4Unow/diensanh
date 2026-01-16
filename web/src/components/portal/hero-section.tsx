import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn(
      "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 px-4",
      className
    )}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Welcome Text */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Xin chào!
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
          Chúng tôi có thể giúp gì cho bạn?
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Tìm kiếm dịch vụ, thông báo, hướng dẫn..."
              className="w-full px-6 py-4 pr-14 text-lg text-foreground bg-white rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-gov-gold focus:outline-none"
              style={{ minHeight: 'var(--spacing-touch-lg)' }}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 text-muted-foreground hover:text-primary-600 transition-colors cursor-pointer"
              style={{ minHeight: 'var(--spacing-touch)', minWidth: 'var(--spacing-touch)' }}
              aria-label="Tìm kiếm"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Search suggestions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-primary-200">Tìm kiếm phổ biến:</span>
            <button className="text-sm text-white hover:text-gov-gold underline cursor-pointer">
              Giấy khai sinh
            </button>
            <span className="text-primary-300">•</span>
            <button className="text-sm text-white hover:text-gov-gold underline cursor-pointer">
              Hộ khẩu
            </button>
            <span className="text-primary-300">•</span>
            <button className="text-sm text-white hover:text-gov-gold underline cursor-pointer">
              Đất đai
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}