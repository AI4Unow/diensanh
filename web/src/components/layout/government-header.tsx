import { NationalEmblem } from "@/components/ui/national-emblem"
import { cn } from "@/lib/utils"

interface GovernmentHeaderProps {
  className?: string
  showSearch?: boolean
  showLogin?: boolean
}

export function GovernmentHeader({
  className,
  showSearch = false,
  showLogin = false
}: GovernmentHeaderProps) {
  return (
    <header className={cn(
      "bg-white border-b-4 border-gov-red shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: National Emblem + Agency Info */}
          <div className="flex items-center space-x-4">
            <NationalEmblem size="lg" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary-600 leading-tight">
                UBND XÃ DIÊN SANH
              </h1>
              <p className="text-sm text-muted-foreground">
                Huyện Hải Lăng - Tỉnh Quảng Trị
              </p>
            </div>
          </div>

          {/* Right: Search + Login (optional) */}
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Tìm kiếm dịch vụ..."
                    className="w-64 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    style={{ minHeight: 'var(--spacing-touch)' }}
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-primary-600"
                    aria-label="Tìm kiếm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {showLogin && (
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search (if enabled) */}
      {showSearch && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Tìm kiếm dịch vụ..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ minHeight: 'var(--spacing-touch)' }}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-primary-600"
              aria-label="Tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}