import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (term?: string) => {
    const q = term || query
    if (q.trim()) {
      navigate(`/portal/search?q=${encodeURIComponent(q)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className={cn(
      "bg-body-bg py-16 px-4 border-b border-section-border",
      className
    )}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Welcome Text */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-hero-accent">
          Xin chào!
        </h1>
        <p className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 text-muted-foreground hover:text-hero-accent transition-colors cursor-pointer"
              style={{ minHeight: 'var(--spacing-touch)', minWidth: 'var(--spacing-touch)' }}
              aria-label="Tìm kiếm"
              onClick={() => handleSearch()}
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Search suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Tìm kiếm phổ biến:</span>
            <button
              onClick={() => handleSearch('Giấy khai sinh')}
              className="text-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:text-hero-accent cursor-pointer transition-colors"
            >
              Giấy khai sinh
            </button>
            <span>•</span>
            <button
              onClick={() => handleSearch('Hộ khẩu')}
              className="text-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:text-hero-accent cursor-pointer transition-colors"
            >
              Hộ khẩu
            </button>
            <span>•</span>
            <button
              onClick={() => handleSearch('Đất đai')}
              className="text-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:text-hero-accent cursor-pointer transition-colors"
            >
              Đất đai
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}