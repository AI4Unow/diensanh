import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

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
  const { user, logout } = useAuth()
  return (
    <header className={cn("sticky top-0 z-50 shadow-md", className)}>
      {/* Banner Image with Login Button Overlay */}
      <div className="relative w-full">
        <img
          src="https://diensanh.quangtri.gov.vn/documents/790019/0/bannner-xa-dien-sanh.jpg"
          alt="UBND Xã Diên Sanh - Huyện Hải Lăng - Tỉnh Quảng Trị"
          className="w-full h-auto object-cover"
          loading="eager"
        />

        {/* Login/Profile Button Overlay */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-white font-medium text-shadow">
                {user.displayName || user.email || 'Người dân'}
              </span>
              <button
                onClick={() => logout()}
                className="bg-white/90 hover:bg-white text-gov-red px-4 py-2 rounded-lg font-medium transition-colors shadow-md text-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : showLogin && (
            <Link
              to="/login"
              className="bg-white/90 hover:bg-white text-gov-red px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
              style={{ minHeight: 'var(--spacing-touch)' }}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search (if enabled) */}
      {showSearch && (
        <div className="bg-primary-600 px-4 py-3">
          <div className="relative">
            <input
              type="search"
              placeholder="Tìm kiếm dịch vụ..."
              className="w-full px-4 py-3 border border-primary-300 bg-white text-foreground rounded-lg focus:ring-2 focus:ring-gov-gold focus:border-transparent"
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